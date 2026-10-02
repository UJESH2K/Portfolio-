"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { robotScreen, useRobot } from "@/lib/robot";
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

type Place = { x: number; y: number; h: number; rz: number; sq: number; hop: number; ry: number };

function targetFor(key: "hero" | "br" | "bl", w: number, h: number) {
  const mobile = w < 810;
  if (key === "hero") {
    // On phones the robot stands in the comic panel at the top of the page
    // (76px from the top, 42% of the screen tall; see .comic__stage), low
    // enough that the balloon above it never covers its face.
    return mobile
      ? { x: w * 0.5, y: 76 + h * 0.42 - 12, h: Math.min(h * 0.2, w * 0.46), ry: -0.12 }
      : { x: w * 0.74, y: h * 0.865, h: Math.min(h * 0.55, w * 0.33), ry: -0.3 };
  }
  const size = mobile ? 88 : 150;
  const inset = mobile ? 46 : 92;
  const x = key === "br" ? w - inset : inset;
  return { x, y: h - (mobile ? 46 : 58), h: size, ry: key === "br" ? -0.38 : 0.38 };
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
    const faceBones: Record<string, THREE.Object3D | null> = {};
    [...Object.values(EYES).flat(), ...Object.values(MOUTHS).flat()].forEach((n) => (faceBones[n] = byName(n)));
    return { scene, bot, head: byName("Head_M_033"), ground, toys, faceBones };
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
  });
  const place = useRef<Place>({ x: 0, y: 0, h: 0, rz: 0, sq: 1, hop: 0, ry: 0 });
  // Height of the posed robot (antennae to feet) in model units, measured on
  // the first frame. A skinned mesh's geometry box is the unposed bind pose,
  // which is not the size you see, so this uses the skinned vertices.
  const botH = useRef(0);
  const posKey = useRef<"hero" | "br" | "bl" | null>(null);
  const pointer = useRef({ x: 0.5, y: 0.5, seen: false });

  const playSeg = (seg: Seg, opts: { loop?: boolean; then?: Seg; fade?: number } = {}) => {
    if (!actions) return;
    const a = anim.current;
    const from = actions[a.cur];
    const to = actions[1 - a.cur];
    to.reset();
    to.time = SEG[seg][0];
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

  // React to store changes: position (jumps), moods and the tingle.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const moveTo = (key: "hero" | "br" | "bl", animate: boolean) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const t = targetFor(key, w, h);
      const p = place.current;
      gsap.killTweensOf(p);
      posKey.current = key;
      if (!animate || reduced || p.h === 0) {
        Object.assign(p, { x: t.x, y: t.y, h: t.h, ry: t.ry, rz: 0, sq: 1, hop: 0 });
        return;
      }
      const startH = p.h;
      const exitX = p.x + (key === "bl" || (key === "hero" && p.x > w / 2) ? -1 : 1) * startH * 0.25;
      const tl = gsap.timeline();
      // Crouch, leap off the top of the screen…
      tl.to(p, { sq: 0.82, duration: 0.14, ease: "power2.out" })
        .add(() => sfx.jump())
        .to(p, { sq: 1.12, duration: 0.12, ease: "power2.out" })
        .to(p, { y: -startH * 0.35, x: exitX, rz: (Math.random() - 0.5) * 0.9, duration: 0.5, ease: "power2.in" }, "<")
        // …reappear above the new spot, then drop in and land.
        .set(p, { x: t.x, y: -t.h * 0.2, h: t.h, ry: t.ry, rz: key === "bl" ? 0.35 : -0.35, sq: 1.1 })
        .to(p, { y: t.y, rz: 0, duration: 0.62, ease: "power3.in" }, "+=0.12")
        .add(() => sfx.land())
        .to(p, { sq: 0.72, duration: 0.09, ease: "power2.out" })
        .to(p, { sq: 1, duration: 0.5, ease: "elastic.out(1, 0.45)" })
        .add(() => {
          setFace({ eyes: "happy", mouth: "open" }, 900);
          playSeg("happy", { then: "idle" });
        }, "<");
    };

    let lastMode = useRobot.getState().mode;
    let lastCorner = useRobot.getState().corner;
    moveTo(lastMode === "hero" ? "hero" : lastCorner, false);

    const onResize = () => moveTo(posKey.current ?? "hero", false);
    window.addEventListener("resize", onResize);

    let lastTick = useRobot.getState().moodTick;
    let lastTingle = useRobot.getState().tingle;
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
      if (s.tingle !== lastTingle) {
        lastTingle = s.tingle;
        if (s.tingle) {
          anim.current.shakeUntil = performance.now() + 900;
          setFace({ eyes: "kawaii", mouth: "kawaii" }, 1400);
          playSeg("think", { then: s.mode === "hero" ? "play" : "idle" });
        } else {
          playSeg("idle", { loop: true });
        }
      }
    });

    const react = (mood: RobotMood) => {
      const hero = useRobot.getState().mode === "hero";
      switch (mood) {
        case "wave":
          playSeg("wave", { then: hero ? "play" : "idle", fade: 0.25 });
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

    mixer.update(Math.min(dt, 1 / 20));

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

    // Advance to the next window when the current one runs out.
    const act = actions[a.cur];
    if (act.time >= SEG[a.seg][1]) {
      if (a.loop) {
        a.loops++;
        // In the hero, break up the idle loop with the hologram routine.
        if (s.mode === "hero" && a.seg === "idle" && a.loops >= 2) playSeg("play", { then: "idle" });
        else playSeg(a.seg, { loop: true, fade: 0.25 });
      } else {
        playSeg(a.then, { loop: true });
      }
    }

    // Toys only in the hero; the companion keeps its disc and nothing else.
    const showToys = s.mode === "hero" && posKey.current === "hero";
    for (const t of parts.toys) t.visible = showToys;

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
    const cam = camera as THREE.PerspectiveCamera;
    const worldH = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const wpp = worldH / size.height;
    const scale = (p.h * wpp) / botH.current;
    let jitter = 0;
    if (now < a.shakeUntil) jitter = (Math.random() - 0.5) * p.h * 0.02;
    g.position.set((p.x + jitter - size.width / 2) * wpp, (size.height / 2 - p.y) * wpp + p.hop * p.h * wpp, 0);
    g.scale.set(scale * (2 - p.sq) ** 0.5, scale * p.sq, scale * (2 - p.sq) ** 0.5);
    g.rotation.set(0, p.ry, p.rz);
    g.visible = !s.hidden && p.h > 0;

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
    robotScreen.visible = g.visible && p.y > 0;
    robotScreen.width = p.h * 0.72;
    robotScreen.height = p.h;
    robotScreen.left = p.x - robotScreen.width / 2;
    robotScreen.top = p.y - p.h;
    robotScreen.side = p.x > size.width / 2 ? "right" : "left";
  });

  return (
    <group ref={rig}>
      <primitive object={parts.scene} />
    </group>
  );
}

function Lights() {
  const tingle = useRobot((s) => s.tingle);
  const rim = useRef<THREE.DirectionalLight>(null);
  useFrame(() => {
    if (!rim.current) return;
    const target = new THREE.Color(tingle ? "#ff2a0d" : "#ffb38a");
    rim.current.color.lerp(target, 0.08);
    rim.current.intensity += ((tingle ? 5 : 2.2) - rim.current.intensity) * 0.08;
  });
  return (
    <>
      <hemisphereLight args={["#ffffff", "#3a2418", 1.15]} />
      <directionalLight position={[3, 5, 7]} intensity={2.1} />
      <directionalLight ref={rim} position={[-5, 3, -4]} intensity={2.2} color="#ffb38a" />
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
