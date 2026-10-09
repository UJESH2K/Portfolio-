"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { gsap } from "gsap";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { robotHover, robotPoke, robotScreen, useRobot } from "@/lib/robot";
import type { RobotMood } from "@/lib/content";
import { sfx } from "./sfx";
import { RobotFx, createFxUniforms } from "./RobotFx";
import { MESH_FRAGMENT_COLOUR, MESH_FRAGMENT_CUT, MESH_FRAGMENT_HEAD, MESH_VERTEX_BODY, MESH_VERTEX_HEAD } from "./fxShaders";

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
 *      that GSAP tweens for jumps, so React never re-renders per frame,
 *   4. on the landing page, the hover effect (RobotFx) runs: the robot comes
 *      apart into particles under the pointer and reforms.
 *
 * The scene is laid out as if the canvas covered the whole window, but the
 * canvas itself is only the robot-sized box around it, moved with the robot,
 * and the camera renders just that window of the full view
 * (setViewOffset). Same picture, a fraction of the pixels: a full-screen
 * WebGL canvas redrawn every frame was the biggest cost on phones.
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
  // Kept small and tucked into the corner, so it rides along without
  // covering the text it is talking about.
  const size = mobile ? 76 : 118;
  const inset = mobile ? 40 : 72;
  const right = key === "br" || key === "tr";
  const top = key === "tl" || key === "tr";
  // Top spots sit just under the header so the logo and menu stay clear.
  const y = top ? (mobile ? 104 : 150) + size : h - (mobile ? 46 : 58);
  return { x: right ? w - inset : inset, y, h: size, ry: right ? -0.38 : 0.38 };
}

/**
 * How the robot travels between spots. Each move is one of a few designed
 * routes, picked at random where more than one fits, so where it leaves and
 * where it comes back from are hard to guess:
 *   - from or to the landing page: leap off the top, drop in from above;
 *   - same side, other row (e.g. top-left to bottom-left): usually slide out
 *     of the side edge and back in at the new height, sometimes over the top
 *     or under the bottom;
 *   - other side: leap over the top, or duck out under the bottom and pop up
 *     into the new corner.
 */
function routeFor(from: Spot | null, to: Spot): { out: Edge; in: Edge } {
  if (!from || from === "hero" || to === "hero") return { out: "top", in: "top" };
  const sideOf = (k: Spot): Edge => (k === "br" || k === "tr" ? "right" : "left");
  const r = Math.random();
  if (sideOf(from) === sideOf(to) && r < 0.6) return { out: sideOf(from), in: sideOf(to) };
  return r < 0.8 ? { out: "top", in: "top" } : { out: "bottom", in: "bottom" };
}

/**
 * The model is 34 skinned parts, each with its own copy of the same 112-bone
 * skeleton: 34 skeletons recomputed and 34 bone textures uploaded every
 * frame. Their bind poses differ only by a per-part offset (left by mesh
 * compression), so that offset is baked into each part's geometry once and
 * every part is bound to the first part's skeleton: the same pose, one
 * skeleton update per frame. A part whose offset is not uniform across its
 * bones keeps its own skeleton.
 */
function shareSkeleton(root: THREE.Object3D) {
  const meshes: THREE.SkinnedMesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.SkinnedMesh).isSkinnedMesh) meshes.push(o as THREE.SkinnedMesh);
  });
  const ref = meshes[0]?.skeleton;
  if (!ref) return;
  const inv = new THREE.Matrix4();
  const off = new THREE.Matrix4();
  const probe = new THREE.Matrix4();
  for (const m of meshes) {
    const sk = m.skeleton;
    if (sk === ref || sk.bones.length !== ref.bones.length || sk.bones.some((b, i) => b !== ref.bones[i])) continue;
    // offset = refInverse⁻¹ · ownInverse, the same for every bone if shareable.
    off.copy(inv.copy(ref.boneInverses[0]).invert()).multiply(sk.boneInverses[0]);
    const uniform = sk.boneInverses.every((bi, i) => {
      probe.copy(ref.boneInverses[i]).multiply(off);
      return probe.elements.every((e, k) => Math.abs(e - bi.elements[k]) < 1e-3 * (1 + Math.abs(e)));
    });
    if (!uniform) continue;
    const g = m.geometry;
    // Quantised attributes can't hold the transformed values; widen to floats.
    for (const name of ["position", "normal"]) {
      const a = g.getAttribute(name) as THREE.BufferAttribute | undefined;
      if (!a) continue;
      const f = new Float32Array(a.count * 3);
      for (let i = 0; i < a.count; i++) {
        f[i * 3] = a.getX(i);
        f[i * 3 + 1] = a.getY(i);
        f[i * 3 + 2] = a.getZ(i);
      }
      g.setAttribute(name, new THREE.BufferAttribute(f, 3));
    }
    const bindInv = inv.copy(m.bindMatrix).invert();
    g.applyMatrix4(new THREE.Matrix4().multiplyMatrices(bindInv, off).multiply(m.bindMatrix));
    m.bind(ref, m.bindMatrix);
    sk.dispose();
  }
}

/**
 * Angry eyebrows: two dark bars over the eyes, slanted down toward the middle,
 * parented to the head so they follow every turn. Sized and placed from the
 * eye bones, so they sit right whatever the model's scale. Hidden until the
 * robot is angry.
 */
function makeBrows(head: THREE.Object3D | null, eyeR: THREE.Object3D | null, eyeL: THREE.Object3D | null) {
  if (!head || !eyeR || !eyeL) return null;
  head.updateWorldMatrix(true, false);
  const inv = new THREE.Matrix4().copy(head.matrixWorld).invert();
  const toLocal = new THREE.Matrix3().setFromMatrix4(inv);
  const pR = eyeR.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
  const pL = eyeL.getWorldPosition(new THREE.Vector3()).applyMatrix4(inv);
  // The face looks down +z (at the camera), up is +y; in the head's frame:
  const fwd = new THREE.Vector3(0, 0, 1).applyMatrix3(toLocal).normalize();
  const up = new THREE.Vector3(0, 1, 0).applyMatrix3(toLocal).normalize();
  const right = new THREE.Vector3().crossVectors(up, fwd).normalize();
  const span = pR.distanceTo(pL);
  if (!(span > 0)) return null;
  const mid = pR.clone().add(pL).multiplyScalar(0.5);
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(span * 0.56, span * 0.12, span * 0.03);
  const mat = new THREE.MeshBasicMaterial({ color: 0x160604 });
  const basis = new THREE.Matrix4().makeBasis(right, up, fwd);
  for (const eye of [pR, pL]) {
    const brow = new THREE.Mesh(geo, mat);
    brow.quaternion.setFromRotationMatrix(basis);
    // Slant: the end nearer the middle of the face goes down.
    const inward = Math.sign(mid.clone().sub(eye).dot(right)) || 1;
    brow.rotateZ(-inward * 0.42);
    // Just over the top of the eye, flat against the face screen.
    brow.position.copy(eye).addScaledVector(up, span * 0.3).addScaledVector(fwd, span * 0.03);
    brow.frustumCulled = false;
    group.add(brow);
  }
  group.visible = false;
  head.add(group);
  return group;
}

/** How far the landing page has scrolled, capped once it is off screen. */
function heroShift(vh: number) {
  return Math.min(window.scrollY, vh * 1.5);
}

function Robot() {
  const gltf = useGLTF(MODEL_URL, false, true);
  const { camera, gl: renderer } = useThree();
  // The camera as it would be for a full-window canvas: used for every
  // screen-space calculation (projections, the pointer ray).
  const fullCam = useMemo(() => {
    const c = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
    c.position.set(0, 0, CAM_Z);
    c.updateMatrixWorld();
    return c;
  }, []);
  const box = useRef({ w: 0, h: 0 });
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

    // The robot's material gets the hover effect's half: the dissolve under
    // the pointer, its glowing rim, the spectrum glowing from inside, and a
    // pearly sheen at grazing angles. Patched once; uniforms are shared with
    // the particles (RobotFx).
    const fxU = createFxUniforms();
    scene.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (!m || m.name !== "material" || m.userData.fx) return;
      m.userData.fx = true;
      m.envMapIntensity = 0.85;
      m.customProgramCacheKey = () => "robot-fx";
      m.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, fxU);
        shader.vertexShader = shader.vertexShader
          .replace("void main() {", `${MESH_VERTEX_HEAD}
void main() {`)
          .replace("#include <project_vertex>", `#include <project_vertex>
${MESH_VERTEX_BODY}`);
        shader.fragmentShader = shader.fragmentShader
          .replace("void main() {", `${MESH_FRAGMENT_HEAD}
void main() {`)
          .replace("#include <clipping_planes_fragment>", `#include <clipping_planes_fragment>
${MESH_FRAGMENT_CUT}`)
          .replace("#include <dithering_fragment>", `#include <dithering_fragment>
${MESH_FRAGMENT_COLOUR}`);
      };
      m.needsUpdate = true;
    });
    shareSkeleton(scene);
    const faceBones: Record<string, THREE.Object3D | null> = {};
    [...Object.values(EYES).flat(), ...Object.values(MOUTHS).flat()].forEach((n) => (faceBones[n] = byName(n)));
    const head = byName("Head_M_033");
    const brows = makeBrows(head, faceBones[EYES.open[0]], faceBones[EYES.open[1]]);
    return { scene, bot, head, ground, toys, faceBones, fxU, brows };
  }, [gltf.scene]);

  // The particle half of the hover effect. Fewer particles on phones; none
  // at all for reduced motion or without float render targets. Built while
  // the browser is idle after the robot appears (sampling ~36k points takes
  // a moment), so it never delays the page.
  const gl = useThree((st) => st.gl);
  const [fx, setFx] = useState<RobotFx | null>(null);
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const small = window.matchMedia("(pointer: coarse)").matches || Math.min(window.innerWidth, window.innerHeight) < 700;
    let made: RobotFx | null = null;
    const build = () => {
      made = RobotFx.create(gl, parts.scene, parts.fxU, small ? 14000 : 36000);
      setFx(made);
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    const id = w.requestIdleCallback ? w.requestIdleCallback(build, { timeout: 2500 }) : window.setTimeout(build, 1200);
    return () => {
      if (w.cancelIdleCallback) w.cancelIdleCallback(id);
      else clearTimeout(id);
      made?.dispose();
      setFx(null);
    };
  }, [gl, parts]);
  const pokeSeen = useRef(0);
  // A travel between corners is running (pokes don't hop over it).
  const traveling = useRef(false);
  const center = useMemo(() => new THREE.Vector3(), []);

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
    // Angry, smoothed toward its target: red-hot, brows down, trembling.
    angry: 0,
    angryT: 0,
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

      traveling.current = true;
      const tl = gsap.timeline({ onComplete: () => void (traveling.current = false), onInterrupt: () => void (traveling.current = false) });
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
      } else if (out === "bottom") {
        // A little hop, then drop out of sight below the bottom edge.
        tl.to(p, { hop: 0.2, sq: 1.08, duration: 0.18, ease: "power2.out" })
          .to(p, { hop: 0, duration: 0.12, ease: "power2.in" })
          .to(p, { y: h + size * 1.3, rz: p.x > w / 2 ? -0.2 : 0.2, duration: 0.45, ease: "power2.in" }, "<");
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
      anim.current.angryT = mood === "angry" ? 1 : 0;
      switch (mood) {
        case "angry":
          // Glaring: open eyes under the brows, a flat mouth, and a shudder.
          setFace({ eyes: "open", mouth: "closed" }, 60000);
          anim.current.shakeUntil = performance.now() + 500;
          break;
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
    parts.fxU.uClock.value = state.clock.elapsedTime;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (fullCam.aspect !== vw / vh) {
      fullCam.aspect = vw / vh;
      fullCam.updateProjectionMatrix();
    }

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
      const rest = targetFor(posKey.current, vw, vh);
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
    const yScreen = p.y - (posKey.current === "hero" ? heroShift(vh) : 0);
    const cam = camera as THREE.PerspectiveCamera;
    const worldH = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const wpp = worldH / vh;
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
        ? THREE.MathUtils.clamp(((pointer.current.x * vw - p.x) / vw) * 1.3, -0.55, 0.45)
        : 0;
    a.bodyYaw += (bodyT - a.bodyYaw) * (1 - Math.exp(-dt * 4));
    let jitter = 0;
    if (now < a.shakeUntil) jitter = (Math.random() - 0.5) * p.h * 0.02;
    // Angry: red-hot and trembling, brows down.
    a.angry += (a.angryT - a.angry) * (1 - Math.exp(-dt * 6));
    if (a.angry < 0.002) a.angry = 0;
    parts.fxU.uAngry.value = a.angry;
    if (a.angry > 0.3) jitter += (Math.random() - 0.5) * p.h * 0.006 * a.angry;
    if (parts.brows) {
      parts.brows.visible = a.angry > 0.05;
      parts.brows.children.forEach((b) => b.scale.set(1, Math.max(0.01, a.angry), 1));
    }
    g.position.set((p.x + jitter - vw / 2) * wpp, (vh / 2 - yScreen) * wpp + p.hop * p.h * wpp, 0);
    g.scale.set(scale * (2 - p.sq) ** 0.5, scale * p.sq, scale * (2 - p.sq) ** 0.5);
    g.position.y += bob * wpp;
    // While the pointer is on it, the robot also tilts toward it a little.
    const tilt = fx?.tilt ?? { x: 0, z: 0 };
    g.rotation.set(tilt.x, p.ry + p.spin + a.bodyYaw, p.rz + a.lean * (p.x > vw / 2 ? 1 : -1) + tilt.z);
    g.visible = !s.hidden && p.h > 0;

    // ── The canvas window around the robot ──────────────────────────────
    // Big enough for the hologram disc, a hop and (on the landing) the
    // particle cloud; resized only when the robot changes size by a lot,
    // moved every frame.
    {
      const hero = posKey.current === "hero";
      const needW = Math.ceil(p.h * (hero ? 1.6 : 1.75));
      const needH = Math.ceil(p.h * (hero ? 1.55 : 1.5));
      const b = box.current;
      const el = renderer.domElement.closest<HTMLElement>(".robot-canvas");
      if (el && (b.w < needW || b.h < needH || b.w > needW * 1.3 || b.h > needH * 1.3)) {
        b.w = Math.ceil(needW / 16) * 16;
        b.h = Math.ceil(needH / 16) * 16;
        el.style.width = `${b.w}px`;
        el.style.height = `${b.h}px`;
      }
      const ox = Math.round(p.x - b.w / 2);
      const oy = Math.round(yScreen + p.h * 0.12 - b.h);
      if (el) el.style.transform = `translate3d(${ox}px, ${oy}px, 0)`;
      cam.aspect = vw / vh;
      cam.setViewOffset(vw, vh, ox, oy, b.w, b.h);
      cam.updateProjectionMatrix();
    }

    // ── Look at the cursor ──────────────────────────────────────────────
    if (parts.head) {
      g.updateMatrixWorld(true);
      const head = parts.head;
      head.getWorldPosition(tmp.v);
      const hp = tmp.v.clone().project(fullCam);
      const hx = (hp.x * 0.5 + 0.5) * vw;
      const hy = (-hp.y * 0.5 + 0.5) * vh;
      robotScreen.headX = hx;
      robotScreen.headY = hy;

      const weight = a.seg === "idle" ? 1 : a.seg === "play" ? 0.15 : 0.45;
      const px = pointer.current.seen ? pointer.current.x * vw : hx - vw * 0.2;
      const py = pointer.current.seen ? pointer.current.y * vh : hy + 40;
      const yawT = THREE.MathUtils.clamp(((px - hx) / vw) * 1.8, -0.6, 0.6) * weight;
      const pitchT = THREE.MathUtils.clamp(((py - hy) / vh) * 1.3, -0.32, 0.42) * weight;
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

    // ── Clicks ──────────────────────────────────────────────────────────
    if (robotPoke.at > pokeSeen.current) {
      pokeSeen.current = robotPoke.at;
      fx?.poke(robotPoke.kind, robotPoke.x, robotPoke.y);
      if (!traveling.current) {
        gsap.killTweensOf(p, "hop,sq");
        if (robotPoke.kind === "teleport") {
          // Gone in a puff of particles, then back with a jump as it
          // reassembles (straight away if there are no particles).
          gsap
            .timeline({ delay: fx ? 0.62 : 0 })
            .to(p, { sq: 0.78, duration: 0.08, ease: "power2.out" })
            .add(() => sfx.jump())
            .to(p, { hop: 0.34, sq: 1.12, duration: 0.26, ease: "power2.out" })
            .to(p, { hop: 0, sq: 1, duration: 0.24, ease: "power2.in" })
            .add(() => sfx.land())
            .to(p, { sq: 0.8, duration: 0.07 })
            .to(p, { sq: 1, duration: 0.45, ease: "elastic.out(1, 0.45)" });
        } else {
          // Knocked back a little where it was clicked.
          gsap
            .timeline()
            .to(p, { hop: robotPoke.kind === "angry" ? 0.05 : 0.09, sq: 0.9, duration: 0.09, ease: "power2.out" })
            .to(p, { hop: 0, sq: 1, duration: 0.35, ease: "elastic.out(1, 0.5)" });
          if (robotPoke.kind === "angry") a.shakeUntil = now + 450;
        }
      }
    }

    // ── Hover effect: particles ─────────────────────────────────────────
    if (fx) {
      g.updateMatrixWorld(true);
      const unit = p.h * wpp;
      center.copy(g.position).y += unit * 0.5;
      fx.update(
        dt,
        {
          hoverEnabled: posKey.current === "hero" && g.visible,
          hover: robotHover.on,
          unit,
          center,
          heightPx: p.h * state.gl.getPixelRatio(),
          angry: a.angry,
          camera: fullCam,
        },
        state.size.height,
        state.gl.getPixelRatio()
      );
    }

    // ── Publish the screen box for the DOM overlays ─────────────────────
    robotScreen.visible = g.visible && yScreen > 0;
    robotScreen.width = p.h * 0.72;
    robotScreen.height = p.h;
    robotScreen.left = p.x - robotScreen.width / 2;
    robotScreen.top = yScreen - p.h;
    robotScreen.side = p.x > vw / 2 ? "right" : "left";
  });

  return (
    <>
      <group ref={rig}>
        <primitive object={parts.scene} />
      </group>
      {fx ? <primitive object={fx.points} /> : null}
    </>
  );
}

/** Soft studio reflections, generated on the GPU (no file to download), so
 *  the robot's metal parts catch light instead of reading flat. */
function Reflections() {
  const { gl, scene } = useThree();
  useEffect(() => {
    const pm = new THREE.PMREMGenerator(gl);
    const env = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    pm.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene]);
  return null;
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
      // Sized and moved every frame by the Robot to the box around it.
      style={{ position: "fixed", left: 0, top: 0, width: 320, height: 320, pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
        gl.outputColorSpace = THREE.SRGBColorSpace;
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.05;
      }}
    >
      <Lights />
      <Reflections />
      <Suspense fallback={null}>
        <Robot />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL, false, true);
