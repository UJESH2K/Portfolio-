import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer.js";
import { OFFSET_SHADER, POINTS_FRAGMENT, POINTS_VERTEX, VELOCITY_SHADER } from "./fxShaders";

/**
 * The landing robot's hover effect: it comes apart into particles where the
 * pointer touches it and puts itself back together.
 *
 *   - Particles are sampled across the robot's surface and pinned to its
 *     bones, so the cloud follows the animation exactly.
 *   - Under the pointer the mesh dissolves with a frayed, glowing rim and the
 *     particles from that patch are thrown out, some of them as butterflies,
 *     coloured from a thin-film spectrum: the colours "inside" the robot.
 *   - The faster the pointer moves, the more comes apart; sustained fast
 *     hovering takes the whole robot apart. When the pointer slows or
 *     leaves, a spring brings every particle back to its own spot and the
 *     mesh heals behind them.
 *   - A GPU simulation (two ping-ponged float textures) does the physics;
 *     when nothing is happening it stops and the particles are not drawn,
 *     so at rest the effect costs nothing.
 *
 * Based on the particle character from the NEXR project (particles-archive),
 * reworked for a skinned, animated model.
 */

export type FxUniforms = ReturnType<typeof createFxUniforms>;

/** Uniforms shared by the robot's material, the simulation and the particles. */
export function createFxUniforms() {
  return {
    uRayO: { value: new THREE.Vector3() },
    uRayD: { value: new THREE.Vector3(0, 0, -1) },
    uCut: { value: 0 },
    uUnit: { value: 1 },
    uClock: { value: 0 },
    uActive: { value: 0 },
    uInnerR: { value: 0.3 },
    uPearl: { value: 1 },
  };
}

type Cloud = {
  count: number;
  l0: Float32Array;
  l1: Float32Array;
  aux: Float32Array;
  color: Float32Array;
  bones: THREE.Bone[];
};

type Decoded = { data: Uint8ClampedArray; w: number; h: number; flipY: boolean };

function decode(tex: THREE.Texture | null | undefined): Decoded | null {
  const img = tex?.image as (CanvasImageSource & { width: number; height: number }) | undefined;
  if (!tex || !img || !img.width || !img.height) return null;
  const s = Math.min(1, 512 / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * s));
  const h = Math.max(1, Math.round(img.height * s));
  try {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true });
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, w, h);
    return { data: ctx.getImageData(0, 0, w, h).data, w, h, flipY: tex.flipY };
  } catch {
    return null;
  }
}

function texel(t: Decoded, u: number, v: number, out: THREE.Color) {
  const fu = u - Math.floor(u);
  const fv = v - Math.floor(v);
  const x = Math.min(t.w - 1, (fu * t.w) | 0);
  const y = Math.min(t.h - 1, ((t.flipY ? 1 - fv : fv) * t.h) | 0);
  const i = (y * t.w + x) * 4;
  return out.setRGB(t.data[i] / 255, t.data[i + 1] / 255, t.data[i + 2] / 255, THREE.SRGBColorSpace);
}

/** Deterministic, so the cloud is the same on every visit. */
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Area-weighted samples over every body part of the robot (face decals and
 * the hologram are left out). Each sample keeps its two strongest bones and
 * its position in each bone's own space, which is all it takes to place it
 * on the animated robot: world = Σ w · boneWorld · local.
 */
function sampleRobot(root: THREE.Object3D, count: number): Cloud | null {
  const meshes: THREE.SkinnedMesh[] = [];
  root.traverse((o) => {
    const m = o as THREE.SkinnedMesh;
    if (!m.isSkinnedMesh || (m.material as THREE.Material).name !== "material") return;
    const g = m.geometry;
    const tris = (g.index ? g.index.count : g.attributes.position.count) / 3;
    // The eyes and mouths are a few triangles each and swap by scaling bones
    // to zero; they are not worth particles.
    if (tris < 50) return;
    meshes.push(m);
  });
  if (!meshes.length) return null;
  const bones = meshes[0].skeleton.bones;
  const boneIndex = new Map<THREE.Object3D, number>(bones.map((b, i) => [b, i]));
  if (bones.length > 127) return null;

  const mat = meshes[0].material as THREE.MeshStandardMaterial;
  const base = decode(mat.map);
  const glow = decode(mat.emissiveMap);

  type Src = { mesh: THREE.SkinnedMesh; p0: Float32Array; n0: Float32Array };
  const srcs: Src[] = [];
  const tri: { s: number; a: number; b: number; c: number }[] = [];
  const cum: number[] = [];
  let area = 0;
  const va = new THREE.Vector3();
  const vb = new THREE.Vector3();
  const vc = new THREE.Vector3();
  for (const mesh of meshes) {
    const g = mesh.geometry;
    const pos = g.attributes.position;
    const nor = g.attributes.normal;
    const nm = new THREE.Matrix3().getNormalMatrix(mesh.bindMatrix);
    const p0 = new Float32Array(pos.count * 3);
    const n0 = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      va.fromBufferAttribute(pos, i).applyMatrix4(mesh.bindMatrix).toArray(p0, i * 3);
      if (nor) va.fromBufferAttribute(nor, i).applyMatrix3(nm).normalize().toArray(n0, i * 3);
    }
    const s = srcs.push({ mesh, p0, n0 }) - 1;
    const idx = g.index;
    const n = idx ? idx.count : pos.count;
    for (let t = 0; t < n; t += 3) {
      const a = idx ? idx.getX(t) : t;
      const b = idx ? idx.getX(t + 1) : t + 1;
      const c = idx ? idx.getX(t + 2) : t + 2;
      va.fromArray(p0, a * 3);
      vb.fromArray(p0, b * 3).sub(va);
      vc.fromArray(p0, c * 3).sub(va);
      const ar = vb.cross(vc).length() * 0.5;
      if (!(ar > 0)) continue;
      area += ar;
      tri.push({ s, a, b, c });
      cum.push(area);
    }
  }
  if (!tri.length) return null;

  const l0 = new Float32Array(count * 4);
  const l1 = new Float32Array(count * 4);
  const aux = new Float32Array(count * 4);
  const color = new Float32Array(count * 3);
  const random = rng(0x5eed);
  const p = new THREE.Vector3();
  const nrm = new THREE.Vector3();
  const tmp = new THREE.Vector3();
  const local = new THREE.Vector3();
  const nmat = new THREE.Matrix3();
  const col = new THREE.Color();
  const sc = new THREE.Color();
  const uv = new THREE.Vector2();
  const uvA = new THREE.Vector2();
  const uvB = new THREE.Vector2();
  const uvC = new THREE.Vector2();
  const tint = mat.color ?? new THREE.Color(1, 1, 1);

  for (let i = 0; i < count; i++) {
    // Binary search the cumulative area table.
    const x = random() * area;
    let lo = 0;
    let hi = cum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cum[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    const { s, a, b, c } = tri[lo];
    const { mesh, p0, n0 } = srcs[s];
    const su = Math.sqrt(random());
    const wa = 1 - su;
    const wb = random() * su;
    const wc = 1 - wa - wb;
    p.set(0, 0, 0)
      .addScaledVector(tmp.fromArray(p0, a * 3), wa)
      .addScaledVector(tmp.fromArray(p0, b * 3), wb)
      .addScaledVector(tmp.fromArray(p0, c * 3), wc);
    nrm.set(0, 0, 0)
      .addScaledVector(tmp.fromArray(n0, a * 3), wa)
      .addScaledVector(tmp.fromArray(n0, b * 3), wb)
      .addScaledVector(tmp.fromArray(n0, c * 3), wc)
      .normalize();

    // Bones from the corner nearest the sample; the robot's parts are
    // nearly rigid, so two influences reproduce it exactly.
    const v = wa >= wb && wa >= wc ? a : wb >= wc ? b : c;
    const g = mesh.geometry;
    const si = g.attributes.skinIndex;
    const sw = g.attributes.skinWeight;
    const inf = [0, 1, 2, 3]
      .map((k) => ({ j: si.getComponent(v, k), w: sw.getComponent(v, k) }))
      .sort((m, n) => n.w - m.w);
    const top = inf[0];
    const next = inf[1].w > 0 ? inf[1] : inf[0];
    const sum = top.w + (next === top ? 0 : next.w) || 1;
    const w0 = next === top ? 1 : top.w / sum;
    const g0 = boneIndex.get(mesh.skeleton.bones[top.j]) ?? 0;
    const g1 = boneIndex.get(mesh.skeleton.bones[next.j]) ?? g0;

    local.copy(p).applyMatrix4(mesh.skeleton.boneInverses[top.j]);
    l0.set([local.x, local.y, local.z, w0], i * 4);
    local.copy(p).applyMatrix4(mesh.skeleton.boneInverses[next.j]);
    l1.set([local.x, local.y, local.z, random()], i * 4);
    nmat.getNormalMatrix(mesh.skeleton.boneInverses[top.j]);
    tmp.copy(nrm).applyMatrix3(nmat).normalize();
    aux.set([tmp.x, tmp.y, tmp.z, g0 + g1 * 128], i * 4);

    // Colour: the surface's own base colour plus its glowing lines.
    col.copy(tint);
    const uva = g.attributes.uv as THREE.BufferAttribute | undefined;
    if (uva) {
      uv.set(0, 0)
        .addScaledVector(uvA.fromBufferAttribute(uva, a), wa)
        .addScaledVector(uvB.fromBufferAttribute(uva, b), wb)
        .addScaledVector(uvC.fromBufferAttribute(uva, c), wc);
      if (base) col.multiply(texel(base, uv.x, uv.y, sc));
      if (glow) col.add(texel(glow, uv.x, uv.y, sc).multiplyScalar(0.8));
    }
    col.toArray(color, i * 3);
  }
  return { count, l0, l1, aux, color, bones };
}

function dataTexture(size: number, src: Float32Array) {
  const data = new Float32Array(size * size * 4);
  data.set(src.subarray(0, Math.min(src.length, data.length)));
  const t = new THREE.DataTexture(data, size, size, THREE.RGBAFormat, THREE.FloatType);
  t.minFilter = THREE.NearestFilter;
  t.magFilter = THREE.NearestFilter;
  t.needsUpdate = true;
  return t;
}

export type FxInput = {
  /** Effect allowed (the robot is on the landing page and motion is OK). */
  enabled: boolean;
  /** Pointer over the robot's hit area. */
  hover: boolean;
  /** A tap on touch screens: shatter once. */
  tap: boolean;
  /** Robot height and centre, world units. */
  unit: number;
  center: THREE.Vector3;
  camera: THREE.Camera;
};

const FULL_SPEED = 2.4;

export class RobotFx {
  readonly points: THREE.Points;
  private gpu: GPUComputationRenderer;
  private velocity: ReturnType<GPUComputationRenderer["addVariable"]>;
  private offset: ReturnType<GPUComputationRenderer["addVariable"]>;
  private material: THREE.ShaderMaterial;
  private boneTex: THREE.DataTexture;
  private bones: THREE.Bone[];
  private disposables: Array<{ dispose: () => void }> = [];
  private ray = new THREE.Raycaster();
  private ndc = new THREE.Vector2();
  private ptr = { x: 0, y: 0, px: 0, py: 0, moved: false, dx: 0, dy: 0, speed: 0, inside: false };
  private state = { active: 0, energy: 0, burst: 0, blast: 0, cut: 0, quiet: 0, running: false, hoverWas: false, time: 0 };
  private onMove: (e: PointerEvent) => void;
  private v = { right: new THREE.Vector3(), up: new THREE.Vector3(), fwd: new THREE.Vector3(), drag: new THREE.Vector3() };
  /** Tilt toward the pointer while it is on the robot, for the rig. */
  readonly tilt = { x: 0, z: 0 };

  static create(renderer: THREE.WebGLRenderer, root: THREE.Object3D, u: FxUniforms, count: number) {
    if (!renderer.capabilities.isWebGL2) return null;
    const gl = renderer.getContext();
    const float = !!gl.getExtension("EXT_color_buffer_float");
    const half = float || !!gl.getExtension("EXT_color_buffer_half_float");
    if (!half) return null;
    const cloud = sampleRobot(root, count);
    if (!cloud) return null;
    try {
      return new RobotFx(renderer, cloud, u, float);
    } catch {
      return null;
    }
  }

  private constructor(
    renderer: THREE.WebGLRenderer,
    cloud: Cloud,
    private u: FxUniforms,
    float: boolean
  ) {
    const size = Math.ceil(Math.sqrt(cloud.count));
    this.bones = cloud.bones;
    const rows = cloud.bones.length;
    this.boneTex = new THREE.DataTexture(new Float32Array(rows * 16), 4, rows, THREE.RGBAFormat, THREE.FloatType);
    this.boneTex.minFilter = THREE.NearestFilter;
    this.boneTex.magFilter = THREE.NearestFilter;

    const tL0 = dataTexture(size, cloud.l0);
    const tL1 = dataTexture(size, cloud.l1);
    const tAux = dataTexture(size, cloud.aux);

    const gpu = new GPUComputationRenderer(size, size, renderer);
    gpu.setDataType(float ? THREE.FloatType : THREE.HalfFloatType);
    const off0 = gpu.createTexture();
    const vel0 = gpu.createTexture();
    this.offset = gpu.addVariable("textureOffset", OFFSET_SHADER, off0);
    this.velocity = gpu.addVariable("textureVelocity", VELOCITY_SHADER, vel0);
    gpu.setVariableDependencies(this.offset, [this.offset, this.velocity]);
    gpu.setVariableDependencies(this.velocity, [this.offset, this.velocity]);
    Object.assign(this.offset.material.uniforms, { uDt: { value: 0 }, uSnap: { value: 0.002 } });
    Object.assign(this.velocity.material.uniforms, {
      ...u,
      tBones: { value: this.boneTex },
      uBoneRows: { value: rows },
      tL0: { value: tL0 },
      tL1: { value: tL1 },
      tAux: { value: tAux },
      uDt: { value: 0 },
      uTime: { value: 0 },
      uDrag: { value: new THREE.Vector3() },
      uCenter: { value: new THREE.Vector3() },
      uEnergy: { value: 0 },
      uBurst: { value: 0 },
      uBlast: { value: 0 },
      uRadius: { value: 0.3 },
      uStrength: { value: 2 },
      uTurb: { value: 1 },
      uStiff: { value: 11.5 },
      uDamp: { value: 2.6 },
      uScatter: { value: 0.3 },
    });
    const err = gpu.init();
    if (err) throw new Error(err);
    this.gpu = gpu;

    const simUv = new Float32Array(cloud.count * 2);
    for (let i = 0; i < cloud.count; i++) {
      simUv[i * 2] = ((i % size) + 0.5) / size;
      simUv[i * 2 + 1] = (Math.floor(i / size) + 0.5) / size;
    }
    const geo = new THREE.BufferGeometry();
    const dummy = new Float32Array(cloud.count * 3);
    geo.setAttribute("position", new THREE.BufferAttribute(dummy, 3));
    geo.setAttribute("aSimUv", new THREE.BufferAttribute(simUv, 2));
    geo.setAttribute("aL0", new THREE.BufferAttribute(cloud.l0, 4));
    geo.setAttribute("aL1", new THREE.BufferAttribute(cloud.l1, 4));
    geo.setAttribute("aAux", new THREE.BufferAttribute(cloud.aux, 4));
    geo.setAttribute("aColor", new THREE.BufferAttribute(cloud.color, 3));

    this.material = new THREE.ShaderMaterial({
      vertexShader: POINTS_VERTEX,
      fragmentShader: POINTS_FRAGMENT,
      uniforms: {
        ...u,
        tBones: { value: this.boneTex },
        uBoneRows: { value: rows },
        tOffset: { value: null },
        tVelocity: { value: null },
        uSize: { value: 0.0056 },
        uViewH: { value: 1 },
        uScatter: { value: 0.3 },
        uTime: { value: 0 },
        uBlastV: { value: 0 },
      },
      transparent: true,
      depthWrite: true,
      depthTest: true,
    });
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    this.points.visible = false;
    // World space: the anchors already carry the rig's transform.
    this.points.matrixAutoUpdate = false;
    this.points.renderOrder = 2;

    this.disposables.push(geo, this.material, this.boneTex, tL0, tL1, tAux, off0, vel0, gpu);

    this.onMove = (e: PointerEvent) => {
      if (!this.ptr.inside) {
        // First event: start the speed estimate here, not from the corner.
        this.ptr.inside = true;
        this.ptr.px = e.clientX;
        this.ptr.py = e.clientY;
      }
      this.ptr.x = e.clientX;
      this.ptr.y = e.clientY;
      this.ptr.moved = true;
    };
    window.addEventListener("pointermove", this.onMove, { passive: true });

    // Compile the simulation now, and draw the (fully hidden) particles for
    // the first frames so their shader compiles too: otherwise the first
    // hover would hitch while the GPU programs are built.
    this.gpu.compute();
    this.resetSim();
    this.warm = 3;
  }

  private warm = 0;

  /** Copy the bones' world matrices into the texture both passes read. */
  private writeBones() {
    const d = this.boneTex.image.data as Float32Array;
    for (let i = 0; i < this.bones.length; i++) d.set(this.bones[i].matrixWorld.elements, i * 16);
    this.boneTex.needsUpdate = true;
  }

  private resetSim() {
    const z0 = this.gpu.createTexture();
    const z1 = this.gpu.createTexture();
    for (const v of [this.offset, this.velocity]) {
      this.gpu.renderTexture(v === this.offset ? z0 : z1, v.renderTargets[0]);
      this.gpu.renderTexture(v === this.offset ? z0 : z1, v.renderTargets[1]);
    }
    z0.dispose();
    z1.dispose();
  }

  update(rawDt: number, input: FxInput, viewH: number, pixelRatio: number) {
    const dt = Math.min(rawDt, 0.1);
    const s = this.state;
    const u = this.u;
    const ptr = this.ptr;
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Pointer speed in screen widths per second, as in the original.
    if (ptr.moved) {
      const dx = (ptr.x - ptr.px) / w;
      const dy = (ptr.y - ptr.py) / h;
      ptr.px = ptr.x;
      ptr.py = ptr.y;
      ptr.moved = false;
      const travel = Math.hypot(dx, dy * 0.6);
      ptr.speed = travel / Math.max(dt, 1e-3);
      if (travel > 1e-5) {
        ptr.dx = dx / travel;
        ptr.dy = dy / travel;
      }
    } else {
      ptr.speed *= 0.82;
    }

    const hover = input.enabled && input.hover;
    if (hover && !s.hoverWas && s.active < 0.35) s.burst = 1;
    if (input.enabled && input.tap) {
      s.burst = 1;
      s.blast = 1;
    }
    s.hoverWas = hover;
    s.burst *= Math.exp(-2.6 * dt);
    if (s.burst < 1e-3) s.burst = 0;
    const eT = hover ? Math.min(1, ptr.speed / FULL_SPEED) : 0;
    s.energy = THREE.MathUtils.damp(s.energy, eT, eT > s.energy ? 11 : 3.2, dt);
    s.active = THREE.MathUtils.damp(s.active, hover ? 1 : 0, hover ? 13 : 4.5, dt);
    // Sustained fast movement takes the whole robot apart; slowing down or
    // leaving lets it come back together.
    const rise = hover && s.energy > 0.42 ? (s.energy - 0.3) * 1.5 : 0;
    s.blast = THREE.MathUtils.clamp(s.blast + (rise - (rise > 0 ? 0 : hover ? 0.45 : 0.7)) * dt, 0, 1);

    const unit = Math.max(input.unit, 1e-3);
    const k = unit / 3.6;
    const radius = 0.62 * k;
    const cutT = Math.max(radius * s.active * (0.3 + 0.95 * s.energy) + radius * 0.8 * s.burst * s.active, unit * 1.7 * s.blast ** 1.4);
    s.cut = THREE.MathUtils.damp(s.cut, cutT, cutT > s.cut ? 9 : 2.2, dt);
    if (s.cut < radius * 0.02 && cutT === 0) s.cut = 0;

    const busy = s.active > 0.01 || s.blast > 0.001 || s.burst > 0 || s.cut > 0;
    s.quiet = busy ? 0 : s.quiet + dt;
    // Keep simulating for a few seconds after the last touch so everything
    // can fly home, then stop for good until the next one.
    const run = busy || s.quiet < 3.5;
    this.tilt.x = THREE.MathUtils.damp(this.tilt.x, hover ? -(ptr.y / h - 0.5) * 0.22 : 0, 5, dt);
    this.tilt.z = THREE.MathUtils.damp(this.tilt.z, hover ? (ptr.x / w - 0.5) * 0.16 : 0, 5, dt);

    u.uActive.value = s.active;
    u.uCut.value = s.cut;
    u.uUnit.value = unit;
    u.uInnerR.value = radius * 1.8;
    s.time += dt;
    u.uClock.value = s.time;

    if (!run) {
      if (s.running) {
        this.resetSim();
        s.running = false;
      }
      // Warm-up frames: drawn, but every particle is hidden at rest.
      this.points.visible = this.warm > 0;
      if (this.warm > 0) {
        this.warm--;
        this.writeBones();
        this.material.uniforms.tOffset.value = this.gpu.getCurrentRenderTarget(this.offset).texture;
        this.material.uniforms.tVelocity.value = this.gpu.getCurrentRenderTarget(this.velocity).texture;
      }
      return;
    }
    s.running = true;

    // The pointer as a ray through the scene.
    this.ndc.set((ptr.x / w) * 2 - 1, -(ptr.y / h) * 2 + 1);
    this.ray.setFromCamera(this.ndc, input.camera);
    u.uRayO.value.copy(this.ray.ray.origin);
    u.uRayD.value.copy(this.ray.ray.direction);

    // Pointer travel in world space, for throwing particles downrange.
    input.camera.matrixWorld.extractBasis(this.v.right, this.v.up, this.v.fwd);
    this.v.drag.set(0, 0, 0).addScaledVector(this.v.right, ptr.dx).addScaledVector(this.v.up, -ptr.dy);
    if (this.v.drag.lengthSq() > 1e-8) this.v.drag.normalize();

    this.writeBones();
    const scatter = 0.48 * k * (1 + 1.1 * s.blast);
    const vu = this.velocity.material.uniforms;
    const step = Math.min(dt, 1 / 30);
    vu.uDt.value = step;
    vu.uTime.value = s.time;
    vu.uDrag.value.copy(this.v.drag);
    vu.uCenter.value.copy(input.center);
    vu.uEnergy.value = s.energy;
    vu.uBurst.value = s.burst * 0.9;
    vu.uBlast.value = s.blast;
    vu.uRadius.value = radius;
    vu.uStrength.value = 6.9 * k;
    vu.uTurb.value = 3.9 * k;
    vu.uStiff.value = 11.56 * (1 - 0.55 * s.blast);
    vu.uDamp.value = 2.6;
    vu.uScatter.value = scatter;
    this.offset.material.uniforms.uDt.value = step;
    this.offset.material.uniforms.uSnap.value = 0.002 * k;
    this.gpu.compute();

    const mu = this.material.uniforms;
    mu.tOffset.value = this.gpu.getCurrentRenderTarget(this.offset).texture;
    mu.tVelocity.value = this.gpu.getCurrentRenderTarget(this.velocity).texture;
    mu.uScatter.value = scatter;
    mu.uTime.value = s.time;
    mu.uBlastV.value = s.blast;
    mu.uViewH.value = viewH * pixelRatio;
    this.points.visible = true;
  }

  dispose() {
    window.removeEventListener("pointermove", this.onMove);
    for (const d of this.disposables) d.dispose();
  }
}
