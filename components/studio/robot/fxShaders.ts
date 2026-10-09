/**
 * GLSL for the robot's hover effect (see RobotFx.ts): the shared dissolve
 * mask, the two GPU simulation passes, the particle draw pass, and the
 * snippets patched into the robot's own material.
 *
 * Everything works in world space. Particles are pinned to the robot's bones
 * (two influences each), so the cloud follows every wave and head turn, and
 * the simulation stores each particle's *offset* from that pinned anchor:
 * idle means offset == 0, so the robot always reforms exactly as it was.
 *
 * The mesh and the particles evaluate the same mask: where the mesh discards
 * a fragment, the particles sampled from that patch of surface show instead,
 * so the robot reads as turning into particles rather than as particles
 * appearing in front of it. The mask has three parts:
 *   - the cut: a hole around the pointer's ray, wider the faster it moves;
 *   - patches: flakes all over the body that come away while the robot is
 *     touched, more of them the more it is stirred, until none are left;
 *   - the ring: a ripple that sweeps out from the pointer when it arrives or
 *     clicks, breaking the robot into particles as it passes.
 */

/** The colours inside the robot: jewel tones that stay rich on a white page
 *  (teal, cobalt, violet, magenta), written in sRGB and returned linear. */
const FX_JEWEL = /* glsl */ `
vec3 fxJewel(float x) {
  float s = fract(x) * 4.0;
  vec3 c = mix(vec3(0.0, 0.74, 0.68), vec3(0.12, 0.38, 1.0), smoothstep(0.0, 1.0, s));
  c = mix(c, vec3(0.5, 0.22, 1.0), smoothstep(1.0, 2.0, s));
  c = mix(c, vec3(0.94, 0.2, 0.62), smoothstep(2.0, 3.0, s));
  c = mix(c, vec3(0.0, 0.74, 0.68), smoothstep(3.0, 4.0, s));
  return pow(c, vec3(2.2));
}
`;

/** Shared uniforms and helpers. Declared once per program. */
export const FX_COMMON = /* glsl */ `
uniform vec3 uRayO;
uniform vec3 uRayD;
uniform float uCut;
uniform float uUnit;
uniform float uClock;
uniform float uGlobal;
uniform float uWave;
uniform float uWaveW;
uniform float uAngry;

float fxHash(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.zyx + 31.32);
  return fract((p.x + p.y) * p.z);
}

float fxNoise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(fxHash(i), fxHash(i + vec3(1.0, 0.0, 0.0)), f.x),
        mix(fxHash(i + vec3(0.0, 1.0, 0.0)), fxHash(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
    mix(mix(fxHash(i + vec3(0.0, 0.0, 1.0)), fxHash(i + vec3(1.0, 0.0, 1.0)), f.x),
        mix(fxHash(i + vec3(0.0, 1.0, 1.0)), fxHash(i + vec3(1.0, 1.0, 1.0)), f.x), f.y),
    f.z);
}

/** Distance from p to the pointer's ray through the scene. A ray, not a
 *  point: the cursor pierces the robot, so front and back give way together. */
float fxRayDist(vec3 p) {
  vec3 v = p - uRayO;
  return length(v - uRayD * dot(v, uRayD));
}

/** Flakes all over the body: every place has its own threshold, so as
 *  uGlobal rises the robot comes apart in scattered patches rather than from
 *  one point. The field drifts slowly, so flakes come and go while it is
 *  held. 0 = solid, 1 = gone. */
float fxPatchMask(vec3 p) {
  if (uGlobal <= 0.0) return 0.0;
  vec3 q = p / uUnit + vec3(0.0, uClock * 0.06, 0.0);
  float cell = fxNoise(q * 10.0 + 17.3) * 0.72 + fxNoise(q * 27.0 + 3.1) * 0.28;
  float t = mix(0.14, 0.92, uGlobal);
  return 1.0 - smoothstep(t - 0.035, t + 0.035, cell);
}

/** The ripple sweeping out from the pointer; n frays its edges. */
float fxRingMask(vec3 p, float n) {
  if (uWave <= 0.0) return 0.0;
  float d = fxRayDist(p) + (n - 0.5) * uWaveW * 1.4;
  return 1.0 - smoothstep(uWaveW * 0.35, uWaveW, abs(d - uWave));
}

/** 0 = solid, 1 = dissolved: the cut, the patches and the ring together.
 *  The cut's edge is broken up by two octaves of noise scaled to its size,
 *  so it frays like burning paper. */
float fxMask(vec3 p) {
  float m = fxPatchMask(p);
  if (uCut <= 0.0 && uWave <= 0.0) return m;
  float n = fxNoise(p * (7.0 / uUnit) + vec3(0.0, uClock * 0.35, 0.0)) * 0.62
          + fxNoise(p * (19.0 / uUnit) - vec3(uClock * 0.2)) * 0.38;
  if (uCut > 0.0) {
    float d = fxRayDist(p) + (n - 0.5) * min(uCut, uUnit * 0.3) * 0.9;
    m = max(m, 1.0 - smoothstep(uCut * 0.8, uCut, d));
  }
  return max(m, fxRingMask(p, n));
}

/** Thin-film colour: the pearly cyan-violet-gold of a soap bubble. Used
 *  faintly, as a sheen on the robot itself. */
vec3 fxFilm(float x) {
  return 0.5 + 0.5 * cos(6.2831853 * (vec3(x) * vec3(1.0, 1.08, 1.16) + vec3(0.0, 0.27, 0.52)));
}

${FX_JEWEL}
`;

/** Bone lookup and the pinned anchor, shared by the simulation and the draw
 *  pass. tBones holds one world matrix per bone, a column per texel. */
const BONES = /* glsl */ `
uniform sampler2D tBones;
uniform float uBoneRows;

mat4 fxBone(float i) {
  float v = (i + 0.5) / uBoneRows;
  return mat4(
    texture2D(tBones, vec2(0.125, v)),
    texture2D(tBones, vec2(0.375, v)),
    texture2D(tBones, vec2(0.625, v)),
    texture2D(tBones, vec2(0.875, v))
  );
}

/** l0/l1: position in each bone's space (.w of l0 is the first weight);
 *  aux: normal in the first bone's space, .w the two bone indices packed. */
vec3 fxAnchor(vec4 l0, vec4 l1, vec4 aux, out vec3 nrm) {
  float b1 = floor(aux.w / 128.0 + 0.001);
  float b0 = aux.w - b1 * 128.0;
  mat4 m0 = fxBone(b0);
  mat4 m1 = fxBone(b1);
  nrm = normalize(mat3(m0) * aux.xyz);
  return mix((m1 * vec4(l1.xyz, 1.0)).xyz, (m0 * vec4(l0.xyz, 1.0)).xyz, l0.w);
}

vec3 fxHash3(float s) {
  return fract(sin(vec3(s * 127.1, s * 311.7, s * 74.7)) * 43758.5453);
}
`;

/** Share of particles that are butterflies rather than dust. */
const BUTTERFLY_SHARE = "0.005";

export const VELOCITY_SHADER = /* glsl */ `
${FX_COMMON}
${BONES}
uniform sampler2D tL0;
uniform sampler2D tL1;
uniform sampler2D tAux;
uniform float uDt;
uniform float uTime;
uniform vec3 uDrag;
uniform vec3 uCenter;
uniform float uActive;
uniform float uEnergy;
uniform float uBurst;
uniform float uBlast;
uniform float uRadius;
uniform float uStrength;
uniform float uTurb;
uniform float uStiff;
uniform float uDamp;
uniform float uScatter;

vec3 fxField(vec3 p) {
  return vec3(fxNoise(p), fxNoise(p + vec3(31.4, 17.7, 5.2)), fxNoise(p + vec3(-9.1, 23.3, 41.3))) * 2.0 - 1.0;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 l1 = texture2D(tL1, uv);
  vec3 nrm;
  vec3 anchor = fxAnchor(texture2D(tL0, uv), l1, texture2D(tAux, uv), nrm);
  float seed = l1.w;

  vec3 offset = texture2D(textureOffset, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  vec3 pos = anchor + offset;
  vec3 rnd = fxHash3(seed);
  float fly = step(seed, ${BUTTERFLY_SHARE});
  float excite = clamp(length(offset) / max(uScatter, 1e-4), 0.0, 1.0);

  // Away from the pointer's ray, lifted off the surface, thrown the way the
  // pointer travelled, and a little toward the camera so the cloud opens up
  // in depth (that is where the parallax comes from).
  vec3 v = anchor - uRayO;
  vec3 axis = uRayO + uRayD * dot(v, uRayD);
  float rd = length(anchor - axis);
  vec3 radial = (anchor - axis) / max(rd, 1e-4);
  vec3 dir = normalize(mix(radial, nrm, 0.45) + uDrag * (0.3 + 0.9 * uEnergy) + (rnd - 0.5) * 0.9 - uRayD * 0.4);

  // Pointer speed dominates: resting on the robot barely lifts it, a fast
  // sweep tears it open.
  float region = (1.0 - smoothstep(uRadius * 0.3, uRadius, rd)) * uActive;
  vec3 acc = dir * uStrength * (0.45 + 1.1 * seed) * (0.12 + 1.88 * uEnergy) * region;

  // Arriving on (or clicking) the robot breaks a patch open once.
  acc += dir * uStrength * uBurst * (0.7 + 0.9 * seed) * (1.0 - smoothstep(0.0, uRadius * 1.5, rd));

  // Flakes: particles under a patch that has come away drift off the body
  // like ash, a little way out and up, and settle back as it heals.
  float patchM = fxPatchMask(anchor);
  vec3 lift = normalize(nrm * 0.9 + vec3(0.0, 0.55, 0.0) + (rnd - 0.5) * 0.7 - uRayD * 0.2);
  acc += lift * uStrength * 0.38 * patchM * (1.0 - smoothstep(0.35, 0.7, excite));

  // The ripple throws what it passes outward.
  acc += normalize(radial + nrm * 0.6 - uRayD * 0.3) * uStrength * 0.55 * fxRingMask(anchor, 0.5);

  // Blast: sustained fast hovering takes the whole body apart, outward from
  // its centre and swirling round it, so the cloud keeps a ghost of the
  // robot's shape instead of spreading into static.
  vec3 fromCentre = anchor - uCenter;
  vec3 outward = normalize(fromCentre + (rnd - 0.5) * uUnit * 0.35 + nrm * uUnit * 0.12);
  vec3 swirl = normalize(cross(vec3(0.0, 1.0, 0.0), fromCentre) + vec3(1e-4));
  acc += (outward * 0.8 + swirl * 0.9) * uStrength * uBlast * (0.5 + seed);

  // Butterflies, once free, flutter up and away while the robot is being
  // touched; after that the spring calls them home with everything else.
  acc += vec3(0.0, 1.0, 0.0) * fly * uStrength * 0.5 * smoothstep(0.05, 0.4, excite) * max(uActive, uBlast);

  // Turbulence only stirs what has already broken away; squared so the
  // spring always wins the last stretch and the cloud settles exactly.
  vec3 turb = fxField(pos * (8.0 / uUnit) + vec3(0.0, uTime * 0.22, uTime * 0.13) + seed * 6.283);
  acc += turb * uTurb * (excite * excite * 1.6 + region * 0.6 + fly * excite * 1.5 * max(uActive, uBlast));

  // Spring home, with a per-particle stiffness so the reform is staggered;
  // stiffer once the pointer has gone, so the robot reforms briskly.
  acc -= offset * uStiff * (0.7 + 0.6 * seed) * mix(1.8, 1.0, uActive);

  // Leash, so nothing wanders off for good.
  float maxOff = uScatter * (0.45 + 1.1 * seed) * (1.0 + fly * 1.8);
  float over = length(offset) - maxOff;
  if (over > 0.0) acc -= normalize(offset) * over * 22.0;

  vel += acc * uDt;
  vel *= exp(-uDamp * (0.85 + 0.3 * seed) * mix(1.35, 1.0, uActive) * uDt);
  gl_FragColor = vec4(vel, seed);
}
`;

export const OFFSET_SHADER = /* glsl */ `
uniform float uDt;
uniform float uSnap;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec3 offset = texture2D(textureOffset, uv).xyz;
  vec3 vel = texture2D(textureVelocity, uv).xyz;
  offset += vel * uDt;
  // Snap the last sliver to exactly zero so the robot is literally whole again.
  if (dot(offset, offset) < uSnap * uSnap && dot(vel, vel) < uSnap * uSnap * 100.0) offset = vec3(0.0);
  gl_FragColor = vec4(offset, 1.0);
}
`;

export const POINTS_VERTEX = /* glsl */ `
${FX_COMMON}
${BONES}
attribute vec2 aSimUv;
attribute vec4 aL0;
attribute vec4 aL1;
attribute vec4 aAux;
attribute vec3 aColor;

uniform sampler2D tOffset;
uniform sampler2D tVelocity;
uniform float uSize;
uniform float uViewH;
uniform float uScatter;
uniform float uActive;
uniform float uInnerR;
uniform float uTime;
uniform float uBlastV;
uniform float uKeep;

varying vec3 vColor;
varying float vAlpha;
varying float vGlow;
varying float vFly;
varying float vFlap;
varying float vAng;
varying float vHue;

void main() {
  vec3 nrm;
  vec3 anchor = fxAnchor(aL0, aL1, aAux, nrm);
  float seed = aL1.w;
  vec3 offset = texture2D(tOffset, aSimUv).xyz;
  float speed = length(texture2D(tVelocity, aSimUv).xyz);
  float excite = clamp(length(offset) / max(uScatter, 1e-4), 0.0, 1.0);
  float rush = clamp(speed / (uUnit * 0.9), 0.0, 1.0);

  // Shown where the body has come apart, and wherever a particle is well
  // clear of it; a mote just off an intact patch stays hidden, so the robot
  // never looks like a fuzz of dots over itself. On a small robot only a
  // share of the cloud is drawn, so a burst reads as specks, not a blur.
  float mask = fxMask(anchor);
  float vis = max(mask, smoothstep(0.28, 0.5, excite)) * step(fract(seed * 7.77), uKeep);
  vec4 mv = viewMatrix * vec4(anchor + offset, 1.0);
  gl_Position = projectionMatrix * mv;

  // Butterflies only once they are properly free, not while a flake hovers
  // just off the body.
  float fly = step(seed, ${BUTTERFLY_SHARE}) * smoothstep(0.55, 0.8, excite);
  vFly = fly;
  vFlap = 0.24 + 0.76 * abs(sin(uTime * (7.0 + seed * 400.0) + seed * 40.0));
  vAng = (fract(seed * 91.7) - 0.5) * 0.9 + sin(uTime * 1.3 + seed * 300.0) * 0.25;

  // Device pixels per world unit at this depth.
  float ppu = projectionMatrix[1][1] * uViewH * 0.5 / max(-mv.z, 0.001);
  float size = uSize * (0.55 + 0.9 * fract(seed * 7.13)) * (1.0 + excite * 0.5 + rush * 0.3);
  size = mix(size, uSize * 8.0, fly);
  float px = size * ppu * uUnit;
  gl_PointSize = vis < 0.01 ? 0.0 : max(px, 1.0);
  // Far-flung dust fades while the robot is blown apart, so it reads as
  // disappearing into a faint swirl, then visibly gathers back.
  float fade = mix(1.0, 0.78, excite) * (1.0 - smoothstep(0.3, 1.0, excite) * uBlastV * 0.85);
  vAlpha = vis * clamp(px, 0.0, 1.0) * mix(fade, 1.0, fly);

  // Lit like the mesh: a key light from the upper right and a soft fill.
  vec3 lightDir = normalize(vec3(0.45, 0.75, 0.6));
  float diffuse = max(dot(nrm, lightDir), 0.0) * 0.75 + 0.45;
  vec3 base = aColor * diffuse;

  // The colours inside: every particle carries its own place on the
  // thin-film spectrum, revealed as it breaks away and flares as it rushes.
  float inner = (1.0 - smoothstep(0.0, uInnerR, fxRayDist(anchor))) * uActive;
  float hue = seed * 0.85 + uClock * 0.06 + excite * 0.3 + dot(anchor, vec3(0.31, 0.53, 0.17)) / uUnit * 0.5;
  vec3 jewel = fxJewel(hue);
  float shift = clamp(excite * 1.4 + inner * 0.55 + rush * 0.6 + mask * 0.35, 0.0, 1.0);
  vColor = mix(base, jewel, shift * 0.9);
  vGlow = clamp(rush * 0.8 + inner * inner * 0.7, 0.0, 1.0);
  vColor += jewel * vGlow * vGlow * 0.5;
  // Angry: embers instead of jewels.
  vColor = mix(vColor, pow(vec3(1.0, 0.3, 0.1), vec3(2.2)) * (0.55 + 0.7 * diffuse), uAngry * 0.85);
  // Butterflies: blue-morpho iridescence, each a little to the teal or violet.
  vHue = 0.12 + fract(seed * 13.7) * 0.4;
}
`;

export const POINTS_FRAGMENT = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vGlow;
varying float vFly;
varying float vFlap;
varying float vAng;
varying float vHue;

${FX_JEWEL}

void main() {
  vec2 p = gl_PointCoord * 2.0 - 1.0;
  float a;
  vec3 col = vColor;
  if (vFly > 0.5) {
    // A butterfly, tilted a little and swaying: two pairs of wings that flap
    // by narrowing in x, bright iridescent blue at the root shading to a dark
    // edge, on a dark body.
    float c = cos(vAng);
    float sn = sin(vAng);
    p = vec2(c * p.x - sn * p.y, sn * p.x + c * p.y);
    vec2 q = vec2(abs(p.x) / vFlap, p.y);
    float upper = length((q - vec2(0.42, -0.24)) / vec2(0.44, 0.42));
    float lower = length((q - vec2(0.28, 0.34)) / vec2(0.3, 0.28));
    float w = min(upper, lower);
    float wing = 1.0 - smoothstep(0.86, 1.0, w);
    float body = (1.0 - smoothstep(0.035, 0.07, abs(p.x))) * (1.0 - smoothstep(0.48, 0.6, abs(p.y)));
    a = max(wing, body);
    // Iridescence: the colour slides along the spectrum as the wings fold.
    vec3 root = fxJewel(vHue + (1.0 - vFlap) * 0.16) * (1.1 + (1.0 - vFlap) * 0.35);
    vec3 edge = pow(vec3(0.04, 0.06, 0.2), vec3(2.2));
    col = mix(root, edge, smoothstep(0.55, 0.96, w));
    col = mix(col, edge, body);
  } else {
    float d = length(p);
    if (d > 1.0) discard;
    float core = 1.0 - smoothstep(0.5, 1.0, d);
    float halo = exp(-d * d * 1.8) * 0.5;
    a = clamp(core + halo * vGlow, 0.0, 1.0);
    // A slightly darker rim keeps each mote crisp against the white page.
    col *= mix(1.0, 0.72, smoothstep(0.35, 0.95, d));
  }
  a *= vAlpha;
  if (a < 0.01) discard;
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`;

/** Patched into the robot's own material (MeshStandardMaterial). */
export const MESH_VERTEX_HEAD = /* glsl */ `
varying vec3 vFxWorld;
`;
export const MESH_VERTEX_BODY = /* glsl */ `
vFxWorld = (modelMatrix * vec4(transformed, 1.0)).xyz;
`;
export const MESH_FRAGMENT_HEAD = /* glsl */ `
varying vec3 vFxWorld;
uniform float uActive;
uniform float uInnerR;
uniform float uPearl;
${FX_COMMON}
`;
/** Early in main(): the dissolved part of the mesh is simply not drawn. */
export const MESH_FRAGMENT_CUT = /* glsl */ `
float fxDis = fxMask(vFxWorld);
if (fxDis > 0.5) discard;
`;
/** End of main(): a pearly sheen always, the spectrum glowing from inside
 *  around the pointer, and a bright frayed rim where the mesh is coming
 *  apart. `normal` and vViewPosition are the material's own (view space). */
export const MESH_FRAGMENT_COLOUR = /* glsl */ `
{
  vec3 fxV = normalize(vViewPosition);
  float fxFres = pow(1.0 - clamp(abs(dot(normalize(normal), fxV)), 0.0, 1.0), 2.2);
  float fxT = fxFres * 0.9 + dot(vFxWorld, vec3(0.31, 0.53, 0.17)) / uUnit * 0.8 + uClock * 0.1;
  vec3 fxIrid = fxFilm(fxT);
  gl_FragColor.rgb += fxIrid * fxFres * 0.22 * uPearl;
  float fxInner = (1.0 - smoothstep(0.0, uInnerR, fxRayDist(vFxWorld))) * uActive;
  vec3 fxGem = fxJewel(fxT * 0.6 + uClock * 0.05);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, gl_FragColor.rgb * 0.45 + fxGem * 1.1, fxInner * fxInner * 0.8);
  // While it is touched the whole body shimmers like a hologram: bands of
  // colour climbing it, so the change reads across the robot, not just
  // under the pointer.
  float fxScan = pow(0.5 + 0.5 * sin(vFxWorld.y * (90.0 / uUnit) - uClock * 7.0), 6.0);
  gl_FragColor.rgb += fxJewel(fxT + 0.15) * (0.06 + 0.22 * fxScan) * uActive;
  float fxRim = smoothstep(0.1, 0.5, fxDis);
  gl_FragColor.rgb = mix(gl_FragColor.rgb, fxJewel(fxT + 0.3) * 1.6 + 0.15, fxRim);
  // Angry: red-hot, pulsing as if it is boiling.
  if (uAngry > 0.001) {
    float fxL = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
    float fxBoil = 0.85 + 0.15 * sin(uClock * 9.0 + vFxWorld.y * (14.0 / uUnit));
    vec3 fxHot = vec3(fxL * 1.75 + 0.06, fxL * 0.38 + 0.01, fxL * 0.24) * fxBoil;
    gl_FragColor.rgb = mix(gl_FragColor.rgb, fxHot, uAngry * 0.8);
  }
}
`;
