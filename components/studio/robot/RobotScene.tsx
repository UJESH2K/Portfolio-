"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { robotHover, robotScreen, useRobot } from "@/lib/robot";
import type { RobotMood } from "@/lib/content";
import { sfx } from "./sfx";

/**
 * The robot: "Robot Playground" by Hadrien59 (CC BY 4.0), driven by code.
 *
 * The model ships one 25-second clip. Rather than cutting it into sub-clips
 * (which drops any track without a key inside the cut, leaving bones frozen
 * in whatever state the last clip left them), the full clip runs on two
 * actions and we crossfade between *time windows* of it. Every bone is then
 * always evaluated, so the hologram toys, eyes and antennae never get stuck.
 *
 * On top of the clip, in this order every frame:
 *   1. the face bones are overridden for moods and blinks,
 *   2. the head is turned toward the cursor,
 *   3. the whole rig is placed in screen space from `place`, a plain object
 *      that GSAP tweens for jumps, so React never re-renders per frame.
 */

const MODEL_URL = "/models/robot.glb";
const FOV = 20;
const CAM_Z = 12;

/** Time windows inside the clip, in seconds. */
const SEG = {
  idle: [0.05, 2.3],
  happy: [2.35, 3.2],
  wave: [3.2, 4.45],
  think: [4.45, 6.0],
  play: [6.0, 22.2],
  peek: [22.4, 25.0],
} as const;
type Seg = keyof typeof SEG;

/** Face bones come in sets; scale 1 shows a part, 0 hides it. */
const EYES = {
  open: ["eye_050", "eyeL_058"],
  closed: ["eyeClos_051", "eyeLClos_059"],
  kawaii: ["eyeClosKawai_052", "eyeLClosKawai_060"],
  happy: ["eyeClosHappy_053", "eyeLClosHappy_061"],
};
const MOUTHS = {
  open: ["mouth_054"],
  closed: ["mouthClos_055"],
  kawaii: ["mouthClosKawai_056"],
  happy: ["mouthClosHappy_057"],
};
type Face = { eyes: keyof typeof EYES; mouth: keyof typeof MOUTHS };

type Place = { x: number; y: number; h: number; rz: number; sq: number; hop: number; ry: number; spin: number };

type Spot = "hero" | "tl" | "tr" | "bl" | "br";
type Edge = "top" | "bottom" | "left" | "right";

function targetFor(key: Spot, w: number, h: number) {
  const mobile = w < 810;
  if (key === "hero") {
    // Phones: standing above the headline at the top of the landing page.
    return mobile
      ? { x: w * 0.5, y: 76 + h * 0.42 - 12, h: Math.min(h * 0.2, w * 0.46), ry: -0.12 }
      : { x: w * 0.74, y: h * 0.865, h: Math.min(h * 0.55, w * 0.33), ry: -0.3 };
  }
  const size = mobile ? 88 : 150;
  const inset = mobile ? 46 : 92;
  const right = key === "br" || key === "tr";
  const top = key === "tl" || key === "tr";
  // Top spots sit just under the header so the logo and menu stay clear.
  const y = top ? (mobile ? 104 : 150) + size : h - (mobile ? 46 : 58);
  return { x: right ? w - inset : inset, y, h: size, ry: right ? -0.38 : 0.38 };
}

/**
 * How the robot travels between spots, by rule rather than at random:
 *   - from or to the landing page: leap off the top, drop in from above;
 *   - same side, other row (e.g. top-left to bottom-left): slide out of the
 *     side edge and back in at the new height;
 *   - other side: leap over the top and drop into the new corner.
 */
function routeFor(from: Spot | null, to: Spot): { out: Edge; in: Edge } {
  if (!from || from === "hero" || to === "hero") return { out: "top", in: "top" };
  const sideOf = (k: Spot): Edge => (k === "br" || k === "tr" ? "right" : "left");
  if (sideOf(from) === sideOf(to)) return { out: sideOf(from), in: sideOf(to) };
  return { out: "top", in: "top" };
}

/** How far the landing page has scrolled, capped once it is off screen. */
function heroShift(vh: number) {
  return Math.min(window.scrollY, vh * 1.5);
}

function Robot() {
  const gltf = useGLTF(MODEL_URL, false, true);
  const { size, camera } = useThree();
  const rig = useRef<THREE.Group>(null);
  const setReady = useRobot((s) => s.setReady);

  const parts = useMemo(() => {
    const scene = gltf.scene;
    const byName = (n: string) => scene.getObjectByName(n) ?? null;
    scene.traverse((o) => {
      o.frustumCulled = false;
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = false;
        m.receiveShadow = false;
      }
    });
    const bot = byName("bot_geo");
    const holo = byName("holo");
    const ground = byName("ground");
    const toys = holo ? holo.children.filter((c) => c !== ground) : [];
    // The hologram disc is twice the robot's width; shrink it to a platform.
    ground?.scale.multiplyScalar(0.58);

    // Hover colour reveal: inside a circle around the pointer the robot's
    // colours rotate through the spectrum, with a soft bright ring at the
    // edge, like paint wiping across it. Patched into its own material once.
    const reveal = { uReveal: { value: new THREE.Vector3(0, 0, 0) }, uHue: { value: 0 } };
    scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (!m || m.name !== "material" || m.userData.reveal) return;
      m.userData.reveal = true;
      m.customProgramCacheKey = () => "robot-reveal";
      m.onBeforeCompile = (shader) => {
        shader.uniforms.uReveal = reveal.uReveal;
        shader.uniforms.uHue = reveal.uHue;
        shader.fragmentShader = shader.fragmentShader
          .replace(
            "void main() {",
            `uniform vec3 uReveal;
uniform float uHue;
vec3 hueShift(vec3 c, float a) {
  const vec3 k = vec3(0.57735);
  float ca = cos(a);
  return c * ca + cross(k, c) * sin(a) + k * dot(k, c) * (1.0 - ca);
}
void main() {`
          )
          .replace(
            "#include <dithering_fragment>",
            `#include <dithering_fragment>
if (uReveal.z > 0.5) {
  float d = distance(gl_FragCoord.xy, uReveal.xy);
  float inside = 1.0 - smoothstep(uReveal.z * 0.8, uReveal.z, d);
  float ring = smoothstep(uReveal.z * 0.74, uReveal.z * 0.9, d) * (1.0 - smoothstep(uReveal.z * 0.9, uReveal.z, d));
  vec3 painted = hueShift(gl_FragColor.rgb, uHue) * 1.12 + 0.03;
  gl_FragColor.rgb = mix(gl_FragColor.rgb, painted, inside) + ring * vec3(1.0, 0.86, 0.62) * 0.4;
}`
          );
      };
      m.needsUpdate = true;
    });
    const faceBones: Record<string, THREE.Object3D | null> = {};
    [...Object.values(EYES).flat(), ...Object.values(MOUTHS).flat()].forEach((n) => (faceBones[n] = byName(n)));
    return { scene, bot, head: byName("Head_M_033"), ground, toys, faceBones, reveal };
  }, [gltf.scene]);

  const mixer = useMemo(() => new THREE.AnimationMixer(parts.scene), [parts.scene]);
  const actions = useMemo(() => {
    const clip = gltf.animations[0];
    if (!clip) return null;
    return [mixer.clipAction(clip), mixer.clipAction(clip.clone())];
  }, [gltf.animations, mixer]);

  // Animation state lives in a ref: it changes inside useFrame, not React.
  const anim = useRef({
    cur: 0,
    seg: "idle" as Seg,
    loop: true,
    then: "idle" as Seg,
    loops: 0,
    face: null as Face | null,
    faceUntil: 0,
    blinkAt: 2,
    lookYaw: 0,
    lookPitch: 0,
    shakeUntil: 0,
    // Lean from scroll speed, so the companion rides along instead of
    // standing frozen while the page moves under it.
    lean: 0,
    lastScrollY: 0,
    bodyYaw: 0,
  });
  const place = useRef<Place>({ x: 0, y: 0, h: 0, rz: 0, sq: 1, hop: 0, ry: 0, spin: 0 });
  // Height of the posed robot (antennae to feet) in model units, measured on
  // the first frame. A skinned mesh's geometry box is the unposed bind pose,
  // which is not the size you see, so this uses the skinned vertices.
  const botH = useRef(0);
  const spinning = useRef(false);
  // The clean animated pose of the bones we override, saved every frame.
  const cleanPose = useRef({
    q: new Map<THREE.Object3D, THREE.Quaternion>(),
    s: new Map<THREE.Object3D, THREE.Vector3>(),
  });
  const posKey = useRef<Spot | null>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, seen: false });

  const playSeg = (seg: Seg, opts: { loop?: boolean; then?: Seg; fade?: number } = {}) => {
    if (!actions) return;
    const a = anim.current;
    const from = actions[a.cur];
    const to = actions[1 - a.cur];
    to.reset();
    to.time = SEG[seg][0];
    to.timeScale = 1;
    to.setEffectiveWeight(1);
    to.play();
    from.crossFadeTo(to, opts.fade ?? 0.35, false);
    a.cur = 1 - a.cur;
    a.seg = seg;
    a.loop = opts.loop ?? false;
    a.then = opts.then ?? "idle";
    a.loops = 0;
  };

  const setFace = (face: Face, ms: number) => {
    anim.current.face = face;
    anim.current.faceUntil = performance.now() + ms;
  };

  // Start the clip once.
  useEffect(() => {
    if (!actions) return;
    actions[0].play();
    actions[0].time = SEG.idle[0];
    anim.current.cur = 0;
    setReady();
    return () => {
      mixer.stopAllAction();
    };
  }, [actions, mixer, setReady]);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.x = e.clientX / window.innerWidth;
      pointer.current.y = e.clientY / window.innerHeight;
      pointer.current.seen = true;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // React to store changes: position (jumps) and moods.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const moveTo = (key: Spot, animate: boolean) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = targetFor(key, w, h);
      const p = place.current;
      gsap.killTweensOf(p);
      // A travel cancels any spin in progress; self-righting clears the rest.
      spinning.current = false;
      // On the landing the robot rides up with the page (see heroShift);
      // when it leaves, start from where it actually is on screen.
      const from = posKey.current;
      if (animate && from === "hero") p.y -= heroShift(h);
      posKey.current = key;
      if (!animate || reduced || p.h === 0) {
        Object.assign(p, { x: t.x, y: t.y, h: t.h, ry: t.ry, rz: 0, sq: 1, hop: 0, spin: 0 });
        return;
      }

      const tl = gsap.timeline();
      const size = p.h;

      // ── Off the screen, by the route for this move ─────────────────
      const route = routeFor(from, key);
      const out = route.out;
      tl.to(p, { sq: 0.82, duration: 0.13, ease: "power2.out" }).add(() => sfx.jump());
      if (out === "top") {
        tl.to(p, { sq: 1.1, duration: 0.12, ease: "power2.out" }).to(
          p,
          { y: -size * 0.4, x: p.x + (p.x > w / 2 ? -1 : 1) * size * 0.25, rz: p.x > w / 2 ? 0.35 : -0.35, duration: 0.5, ease: "power2.in" },
          "<"
        );
      } else {
        const dir = out === "right" ? 1 : -1;
        tl.to(p, { sq: 1.05, ry: dir * 1.1, duration: 0.14 })
          .to(p, { x: dir > 0 ? w + size : -size, rz: -dir * 0.3, duration: 0.45, ease: "power2.in" })
          .to(p, { hop: 0.25, duration: 0.22, ease: "power2.out", yoyo: true, repeat: 1 }, "<");
      }

      if (key === "hero") {
        // Back to the landing: drop in from above.
        tl.set(p, { x: t.x, y: -t.h * 0.2, h: t.h, ry: t.ry, rz: -0.3, sq: 1.1, hop: 0 })
          .to(p, { y: t.y, rz: 0, duration: 0.65, ease: "power3.in" }, "+=0.1")
          .add(() => sfx.land())
          .to(p, { sq: 0.75, duration: 0.09 })
          .to(p, { sq: 1, duration: 0.5, ease: "elastic.out(1, 0.45)" });
        return;
      }

      // ── …and back on to the new spot from one of its edges ─────────
      const inn = route.in;
      const land = () => {
        sfx.land();
        setFace({ eyes: "happy", mouth: "open" }, 900);
        playSeg("happy", { then: "idle" });
      };
      if (inn === "top") {
        tl.set(p, { x: t.x, y: -t.h * 0.2, h: t.h, ry: t.ry, rz: t.x > w / 2 ? -0.35 : 0.35, sq: 1.1, hop: 0 })
          .to(p, { y: t.y, rz: 0, duration: 0.6, ease: "power3.in" }, "+=0.12")
          .add(land)
          .to(p, { sq: 0.72, duration: 0.09, ease: "power2.out" })
          .to(p, { sq: 1, duration: 0.5, ease: "elastic.out(1, 0.45)" });
      } else if (inn === "bottom") {
        tl.set(p, { x: t.x, y: h + t.h * 1.2, h: t.h, ry: t.ry, rz: 0, sq: 1.15, hop: 0 }, "+=0.1")
          .to(p, { y: t.y, duration: 0.6, ease: "back.out(1.7)" })
          .add(land, "-=0.15")
          .to(p, { sq: 1, duration: 0.45, ease: "elastic.out(1, 0.5)" }, "<");
      } else {
        const dir = inn === "right" ? 1 : -1;
        tl.set(p, { x: dir > 0 ? w + t.h : -t.h, y: t.y, h: t.h, ry: -dir * 1.1, rz: dir * 0.25, sq: 1, hop: 0 }, "+=0.1")
          .to(p, { x: t.x, rz: 0, duration: 0.75, ease: "power3.out" })
          .to(p, { hop: 0.22, duration: 0.18, ease: "power2.out", yoyo: true, repeat: 3 }, "<")
          .to(p, { ry: t.ry, duration: 0.35, ease: "power2.out" }, "-=0.25")
          .add(land)
          .to(p, { sq: 0.85, duration: 0.08 })
          .to(p, { sq: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
      }
    };

    let lastMode = useRobot.getState().mode;
    let lastCorner = useRobot.getState().corner;
    moveTo(lastMode === "hero" ? "hero" : lastCorner, false);

    const onResize = () => moveTo(posKey.current ?? "hero", false);
    window.addEventListener("resize", onResize);

    let lastTick = useRobot.getState().moodTick;
    const unsub = useRobot.subscribe((s) => {
      const key = s.mode === "hero" ? "hero" : s.corner;
      if (s.mode !== lastMode || (s.mode === "companion" && s.corner !== lastCorner)) {
        lastMode = s.mode;
        lastCorner = s.corner;
        moveTo(key, true);
      }
      if (s.moodTick !== lastTick) {
        lastTick = s.moodTick;
        react(s.mood);
      }
    });

    const react = (mood: RobotMood) => {
      const hero = useRobot.getState().mode === "hero";
      switch (mood) {
        case "wave":
          // Wave, then back to the calm idle. (The clip's hologram-juggling
          // routine is never used: its head chases toys we don't show.)
          playSeg("wave", { then: "idle", fade: 0.25 });
          break;
        case "happy":
          setFace({ eyes: "happy", mouth: "open" }, 1200);
          playSeg("happy", { then: "idle" });
          break;
        case "think":
          playSeg("think", { then: "idle" });
          break;
        case "peek":
          playSeg("peek", { then: "idle" });
          break;
        case "dizzy": {
          // A full spin with ">.<" eyes, then a wobbly little hop. The spin
          // has its own channel that always ends at zero, so an interrupted
          // or repeated spin can never leave the robot facing the wrong way;
          // a spin already in progress is left to finish.
          const p = place.current;
          if (spinning.current) break;
          spinning.current = true;
          setFace({ eyes: "kawaii", mouth: "kawaii" }, 2400);
          p.spin = 0;
          gsap
            .timeline({
              onComplete: () => {
                p.spin = 0;
                spinning.current = false;
              },
              onInterrupt: () => {
                spinning.current = false;
              },
            })
            .to(p, { spin: Math.PI * 2, duration: 0.9, ease: "power2.inOut" })
            .set(p, { spin: 0 })
            .to(p, { hop: 0.18, duration: 0.2, ease: "power2.out", yoyo: true, repeat: 1 });
          break;
        }
        case "sleep":
          // Eyes closed until something else (a wake-up "happy") takes over.
          setFace({ eyes: "closed", mouth: "closed" }, 120000);
          playSeg("idle", { loop: true });
          break;
        case "cheer": {
          setFace({ eyes: "happy", mouth: "open" }, 1600);
          playSeg("wave", { then: "idle", fade: 0.2 });
          const p = place.current;
          gsap.killTweensOf(p, "hop");
          gsap
            .timeline()
            .to(p, { hop: 0.22, duration: 0.22, ease: "power2.out" })
            .to(p, { hop: 0, duration: 0.24, ease: "power2.in" })
            .to(p, { hop: 0.14, duration: 0.18, ease: "power2.out" })
            .to(p, { hop: 0, duration: 0.2, ease: "power2.in" });
          break;
        }
      }
    };

    const placed = place.current;
    return () => {
      unsub();
      window.removeEventListener("resize", onResize);
      gsap.killTweensOf(placed);
    };
    // playSeg/setFace only touch refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions]);

  const tmp = useMemo(
    () => ({
      v: new THREE.Vector3(),
      q: new THREE.Quaternion(),
      qp: new THREE.Quaternion(),
      qr: new THREE.Quaternion(),
      e: new THREE.Euler(),
    }),
    []
  );

  useFrame((state, dt) => {
    const g = rig.current;
    if (!g || !actions) return;
    const a = anim.current;
    const now = performance.now();
    const s = useRobot.getState();

    // Bones we override after the mixer (head turn, face swaps) are put back
    // to the clean animated pose first. Three.js only rewrites a bone when
    // its animated value changes, so on a held pose the mixer leaves our
    // previous frame's override in place; without this the head turn piled
    // up every frame into a continuous spin, and blinks could stick.
    const pure = cleanPose.current;
    for (const [bone, q] of pure.q) bone.quaternion.copy(q);
    for (const [bone, sc] of pure.s) bone.scale.copy(sc);

    mixer.update(Math.min(dt, 1 / 20));

    if (parts.head) {
      const q = pure.q.get(parts.head);
      if (q) q.copy(parts.head.quaternion);
      else pure.q.set(parts.head, parts.head.quaternion.clone());
    }
    for (const bone of Object.values(parts.faceBones)) {
      if (!bone) continue;
      const sc = pure.s.get(bone);
      if (sc) sc.copy(bone.scale);
      else pure.s.set(bone, bone.scale.clone());
    }

    if (!botH.current) {
      g.position.set(0, 0, 0);
      g.rotation.set(0, 0, 0);
      g.scale.setScalar(1);
      g.updateMatrixWorld(true);
      const box = new THREE.Box3();
      if (parts.bot) box.setFromObject(parts.bot, true);
      const h = box.max.y - Math.min(0, box.min.y);
      botH.current = isFinite(h) && h > 0.3 ? h : 1.5;
    }

    // On the landing, idle is a held, relaxed pose: the only motion is the
    // body and head turning toward the cursor (and blinks). Elsewhere the
    // idle loop plays normally.
    const act = actions[a.cur];
    const calm = posKey.current === "hero" && a.seg === "idle";
    act.timeScale = calm ? 0 : 1;

    // Advance to the next window when the current one runs out.
    if (act.time >= SEG[a.seg][1]) {
      if (a.loop) {
        a.loops++;
        playSeg(a.seg, { loop: true, fade: 0.25 });
      } else {
        playSeg(a.then, { loop: true });
      }
    }

    // No hologram toys anywhere; the disc stays.
    for (const t of parts.toys) t.visible = false;

    // ── Face ────────────────────────────────────────────────────────────
    let face: Face | null = a.face && now < a.faceUntil ? a.face : null;
    if (!face && now / 1000 > a.blinkAt) {
      if (now / 1000 > a.blinkAt + 0.13) a.blinkAt = now / 1000 + 2.4 + Math.random() * 3;
      else if (a.seg === "idle" || a.seg === "play") face = { eyes: "closed", mouth: "happy" };
    }
    if (face) {
      for (const [k, names] of Object.entries(EYES))
        for (const n of names) parts.faceBones[n]?.scale.setScalar(k === face.eyes ? 1 : 0);
      for (const [k, names] of Object.entries(MOUTHS))
        for (const n of names) parts.faceBones[n]?.scale.setScalar(k === face.mouth ? 1 : 0);
    }

    // ── Placement ───────────────────────────────────────────────────────
    const p = place.current;
    // Self-righting: whenever nothing is animating the robot, ease it back
    // to exactly where and how it should stand at its current spot. However
    // a jump, spin or reaction gets interrupted, it recovers on its own
    // within a second or two instead of staying stuck.
    if (p.h > 0 && posKey.current && !gsap.isTweening(p)) {
      const rest = targetFor(posKey.current, size.width, size.height);
      const k = 1 - Math.exp(-dt * 3);
      p.x += (rest.x - p.x) * k;
      p.y += (rest.y - p.y) * k;
      p.h += (rest.h - p.h) * k;
      p.ry += (rest.ry - p.ry) * k;
      p.rz += (0 - p.rz) * k;
      p.sq += (1 - p.sq) * k;
      p.hop += (0 - p.hop) * k;
      p.spin += (0 - p.spin) * k;
    }
    // While it stands on the landing page it scrolls away with the page
    // instead of hanging in place over the next section.
    const yScreen = p.y - (posKey.current === "hero" ? heroShift(size.height) : 0);
    const cam = camera as THREE.PerspectiveCamera;
    const worldH = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const wpp = worldH / size.height;
    const scale = (p.h * wpp) / botH.current;
    // Companion only: a slow hover, and a lean against the scroll direction.
    const companion = posKey.current !== "hero";
    const sy = window.scrollY;
    const vel = (sy - a.lastScrollY) / Math.max(dt * 60, 1);
    a.lastScrollY = sy;
    const leanT = companion ? THREE.MathUtils.clamp(-vel * 0.004, -0.14, 0.14) : 0;
    a.lean += (leanT - a.lean) * (1 - Math.exp(-dt * 5));
    // Companion: a slow hover. Landing: just breathing.
    const bob = companion ? Math.sin(now / 900) * p.h * 0.01 : Math.sin(now / 1100) * p.h * 0.005;
    // On the landing the whole body turns a little toward the cursor.
    const bodyT =
      !companion && pointer.current.seen
        ? THREE.MathUtils.clamp(((pointer.current.x * size.width - p.x) / size.width) * 1.3, -0.55, 0.45)
        : 0;
    a.bodyYaw += (bodyT - a.bodyYaw) * (1 - Math.exp(-dt * 4));
    let jitter = 0;
    if (now < a.shakeUntil) jitter = (Math.random() - 0.5) * p.h * 0.02;
    g.position.set((p.x + jitter - size.width / 2) * wpp, (size.height / 2 - yScreen) * wpp + p.hop * p.h * wpp, 0);
    g.scale.set(scale * (2 - p.sq) ** 0.5, scale * p.sq, scale * (2 - p.sq) ** 0.5);
    g.position.y += bob * wpp;
    g.rotation.set(0, p.ry + p.spin + a.bodyYaw, p.rz + a.lean * (p.x > size.width / 2 ? 1 : -1));
    g.visible = !s.hidden && p.h > 0;

    // ── Hover colour reveal ─────────────────────────────────────────────
    {
      const dpr = state.gl.getPixelRatio();
      const u = parts.reveal.uReveal.value;
      const target = robotHover.on ? robotScreen.height * 0.42 * dpr : 0;
      u.z += (target - u.z) * (1 - Math.exp(-dt * (robotHover.on ? 7 : 4)));
      if (u.z < 0.6 && !robotHover.on) u.z = 0;
      if (robotHover.on || u.z > 0) {
        u.x += (robotHover.x * dpr - u.x) * 0.35;
        u.y += ((size.height - robotHover.y) * dpr - u.y) * 0.35;
      }
      if (robotHover.on) parts.reveal.uHue.value = (parts.reveal.uHue.value + dt * 1.6) % (Math.PI * 2);
    }

    // ── Look at the cursor ──────────────────────────────────────────────
    if (parts.head) {
      g.updateMatrixWorld(true);
      const head = parts.head;
      head.getWorldPosition(tmp.v);
      const hp = tmp.v.clone().project(cam);
      const hx = (hp.x * 0.5 + 0.5) * size.width;
      const hy = (-hp.y * 0.5 + 0.5) * size.height;
      robotScreen.headX = hx;
      robotScreen.headY = hy;

      const weight = a.seg === "idle" ? 1 : a.seg === "play" ? 0.15 : 0.45;
      const px = pointer.current.seen ? pointer.current.x * size.width : hx - size.width * 0.2;
      const py = pointer.current.seen ? pointer.current.y * size.height : hy + 40;
      const yawT = THREE.MathUtils.clamp(((px - hx) / size.width) * 1.8, -0.6, 0.6) * weight;
      const pitchT = THREE.MathUtils.clamp(((py - hy) / size.height) * 1.3, -0.32, 0.42) * weight;
      const k = 1 - Math.exp(-dt * 6);
      a.lookYaw += (yawT - a.lookYaw) * k;
      a.lookPitch += (pitchT - a.lookPitch) * k;

      // Offset built in the rig's frame, applied in world space, written back locally.
      tmp.e.set(a.lookPitch, a.lookYaw - p.ry * weight * 0.6, 0, "YXZ");
      const offLocal = new THREE.Quaternion().setFromEuler(tmp.e);
      g.getWorldQuaternion(tmp.qr);
      const offWorld = tmp.qr.clone().multiply(offLocal).multiply(tmp.qr.clone().invert());
      head.parent!.getWorldQuaternion(tmp.qp);
      head.getWorldQuaternion(tmp.q);
      tmp.q.premultiply(offWorld);
      head.quaternion.copy(tmp.qp.invert().multiply(tmp.q));
    }

    // ── Publish the screen box for the DOM overlays ─────────────────────
    robotScreen.visible = g.visible && yScreen > 0;
    robotScreen.width = p.h * 0.72;
    robotScreen.height = p.h;
    robotScreen.left = p.x - robotScreen.width / 2;
    robotScreen.top = yScreen - p.h;
    robotScreen.side = p.x > size.width / 2 ? "right" : "left";
  });

  return (
    <group ref={rig}>
      <primitive object={parts.scene} />
    </group>
  );
}

function Lights() {
  return (
    <>
      <hemisphereLight args={["#ffffff", "#3a2418", 1.15]} />
      <directionalLight position={[3, 5, 7]} intensity={2.1} />
      <directionalLight position={[-5, 3, -4]} intensity={2.6} color="#ff8a5a" />
    </>
  );
}

export default function RobotScene() {
  return (
    <Canvas
      className="robot-canvas"
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      camera={{ fov: FOV, position: [0, 0, CAM_Z], near: 0.1, far: 60 }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Lights />
      <Suspense fallback={null}>
        <Robot />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL, false, true);
