"use client"

import * as React from "react"

/**
 * Keycap Orb — a ball of mechanical keycaps.
 *
 * Every cap is real geometry: a tapered, rounded body with a dished top and an
 * engraved legend, lit by a studio key light and a warm bounce from below,
 * and mirrored faintly into the floor. Ink, ash, ember and tan caps are opaque
 * plastic; glass caps are transparent and show the cross stem inside.
 *
 * Drag to spin it (it keeps the momentum), hover to lift a cap, press one and a
 * ripple runs round the ball. Focus it and type: the keys you press press the
 * caps that carry them.
 *
 * Adapted from the 21st.dev keycap orb for this site's light theme: the canvas
 * is transparent (the page is the background), the studio the caps reflect is
 * a bright warm room instead of a dark one, the palette is the site's ink,
 * paper and ember, and vertical swipes on touch screens scroll the page.
 *
 * Self-contained: raw WebGL2, React is the only import. The legends are drawn
 * at runtime into a texture atlas, so there are no images, fonts or files.
 */

export type KeycapFinish = "ink" | "ash" | "glass" | "cobalt" | "lime"

export type KeycapIcon =
  | "code"
  | "braces"
  | "chevrons"
  | "frame"
  | "quote"
  | "slash"
  | "at"
  | "pen"
  | "check"
  | "search"
  | "bolt"
  | "gear"
  | "shield"
  | "folder"
  | "cube"
  | "cursor"
  | "hash"
  | "terminal"
  | "layers"
  | "star"
  | "heart"
  | "arrow"
  | "plus"
  | "none"

export type Keycap = {
  /** A built-in glyph. Wins over `label` when both are set. */
  icon?: KeycapIcon
  /** Text printed on the cap: "HTML", "JS", "⌘", "Esc". Keep it short. */
  label?: string
  finish?: KeycapFinish
  /** A keyboard key that presses this cap while the orb has focus. */
  hotkey?: string
  /** Anything the page wants back when the cap is pressed. */
  meta?: string
}

export type KeycapPalette = Partial<Record<KeycapFinish | "stem" | "core", { cap?: string; legend?: string }>>

export type KeycapOrbProps = {
  /**
   * The caps, most important first. The first one sits dead centre facing
   * you, the next ones spiral outward from it, and the far side of the ball
   * reuses the list.
   */
  keys?: Keycap[]
  /** Override any finish's cap and legend colour. Hex. */
  palette?: KeycapPalette
  /** The bounce light on the caps and the tint of the floor reflection. Hex. */
  glow?: string
  /** Latitude rows from pole to pole. More rows, smaller caps. 5–15. */
  rings?: number
  /** How much of the shorter side the ball spans, 0.3–0.95. */
  scale?: number
  /** Slow spin when nobody is dragging it. */
  autoRotate?: boolean
  /** Spin speed multiplier. Negative spins the other way. */
  speed?: number
  /** The mirrored ball in the floor. */
  reflection?: boolean
  /** The wave that runs round the ball when a cap is pressed. */
  ripple?: boolean
  /** Explicit height: never a percentage, which collapses without a height chain. */
  height?: string
  /**
   * What the caps past the end of `keys` show: the list again ("repeat"), or
   * plain blank caps ("blank"), so every legend on the ball is unique.
   */
  fill?: "repeat" | "blank"
  onKeyPress?: (key: Keycap, index: number) => void
  /** A cap going down ("down") and coming back up ("up"), for a click sound. */
  onKeySound?: (phase: "down" | "up") => void
  /** The cap under the pointer, or null when it leaves the caps. */
  onKeyHover?: (key: Keycap | null, index: number) => void
  className?: string
  "aria-label"?: string
}

type Vec3 = [number, number, number]
type Quat = [number, number, number, number]
type Slot = { lat: number; lon: number; size: number; dir: Vec3; east: Vec3 }

// #region orb
/** Clamp, with NaN falling to the low end rather than leaking into a uniform. */
export const clamp = (v: number, lo: number, hi: number): number => (v > hi ? hi : v >= lo ? v : lo)

/** Small seeded PRNG, so the jitter is the same on every load. */
export const mulberry32 = (seed: number) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Where the caps sit: latitude rings from pole to pole, each holding as many
 * caps as its circumference fits at the equator's spacing, so the middle of
 * the ball is a near-square grid of caps, like a keyboard.
 */
export const layoutSlots = (rings: number): Slot[] => {
  const n = Math.round(clamp(rings, 5, 15))
  const step = Math.PI / (n - 1)
  const slots: Slot[] = []
  for (let r = 0; r < n; r++) {
    const lat = -Math.PI / 2 + r * step
    const ring = 2 * Math.PI * Math.cos(lat)
    const count = Math.max(1, Math.round(ring / step))
    const spacing = count === 1 ? step : ring / count
    const size = Math.min(1, spacing / step)
    for (let k = 0; k < count; k++) {
      const lon = (k / count) * 2 * Math.PI
      const c = Math.cos(lat)
      const dir: Vec3 = [c * Math.sin(lon), Math.sin(lat), c * Math.cos(lon)]
      const east: Vec3 = [Math.cos(lon), 0, -Math.sin(lon)]
      slots.push({ lat, lon, size, dir, east })
    }
  }
  return slots
}

/** The angle between two unit vectors, safe at the ends of acos. */
export const angleBetween = (a: Vec3, b: Vec3): number => Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1))

/** Slot indices ordered from the one facing the viewer outward. */
export const frontOrder = (slots: Slot[]): number[] => {
  const front: Vec3 = [0, 0, 1]
  const keyed = slots.map((s, i) => {
    const d = Math.round(angleBetween(s.dir, front) * 1000) / 1000
    const a = Math.atan2(s.dir[1], s.dir[0])
    const around = (((Math.PI - a) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
    return { i, d, around: Math.round(around * 1000) / 1000 }
  })
  keyed.sort((p, q) => p.d - q.d || p.around - q.around || p.i - q.i)
  return keyed.map((k) => k.i)
}

export const qMul = (a: Quat, b: Quat): Quat => [
  a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
  a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
  a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
  a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2],
]

export const qAxis = (axis: Vec3, angle: number): Quat => {
  const s = Math.sin(angle / 2)
  return [axis[0] * s, axis[1] * s, axis[2] * s, Math.cos(angle / 2)]
}

/** Renormalise, or come back to identity if the quaternion went bad. */
export const qNormalize = (q: Quat): Quat => {
  const l = Math.hypot(q[0], q[1], q[2], q[3])
  return l > 1e-9 && Number.isFinite(l) ? [q[0] / l, q[1] / l, q[2] / l, q[3] / l] : [0, 0, 0, 1]
}

export const qRotate = (q: Quat, v: Vec3): Vec3 => {
  const x = q[0],
    y = q[1],
    z = q[2],
    w = q[3]
  const tx = 2 * (y * v[2] - z * v[1])
  const ty = 2 * (z * v[0] - x * v[2])
  const tz = 2 * (x * v[1] - y * v[0])
  return [v[0] + w * tx + y * tz - z * ty, v[1] + w * ty + z * tx - x * tz, v[2] + w * tz + x * ty - y * tx]
}

/**
 * How far a cap moves (in cap heights, positive is out) when a ripple started
 * `elapsed` seconds ago at `distance` radians away.
 */
export const ripplePulse = (elapsed: number, distance: number): number => {
  const tau = elapsed - distance / 3.2
  if (tau <= 0 || tau > 2.4) return 0
  return Math.sin(tau * 13) * Math.exp(-tau * 4.2) * Math.exp(-distance * 0.55) * 0.42
}

/** Camera distance that makes a ball of `radius` span `fill` of the shorter side. */
export const fitDistance = (radius: number, fovY: number, aspect: number, fill: number): number => {
  const t = Math.tan(fovY / 2)
  const f = clamp(fill, 0.3, 0.95)
  return radius / (f * t * Math.min(1, aspect)) + radius * 0.35
}

/** Slab test of a ray against an axis-aligned box. Nearest hit, or -1. */
export const rayBox = (o: Vec3, d: Vec3, lo: Vec3, hi: Vec3): number => {
  let t0 = -Infinity
  let t1 = Infinity
  for (let a = 0; a < 3; a++) {
    if (Math.abs(d[a]) < 1e-12) {
      if (o[a] < lo[a] || o[a] > hi[a]) return -1
      continue
    }
    const ta = (lo[a] - o[a]) / d[a]
    const tb = (hi[a] - o[a]) / d[a]
    t0 = Math.max(t0, Math.min(ta, tb))
    t1 = Math.min(t1, Math.max(ta, tb))
  }
  if (t1 < Math.max(t0, 0)) return -1
  return t0 >= 0 ? t0 : t1
}

/** Nearest hit of a ray on a sphere at `c`, or -1. */
export const raySphere = (o: Vec3, d: Vec3, c: Vec3, r: number): number => {
  const ox = o[0] - c[0],
    oy = o[1] - c[1],
    oz = o[2] - c[2]
  const b = ox * d[0] + oy * d[1] + oz * d[2]
  const k = ox * ox + oy * oy + oz * oz - r * r
  const disc = b * b - k
  if (disc < 0) return -1
  const s = Math.sqrt(disc)
  const t = -b - s
  return t >= 0 ? t : -b + s >= 0 ? -b + s : -1
}

/** "#rgb" or "#rrggbb" to linear RGB. Anything else gives the fallback. */
export const hexToLinear = (hex: string | undefined, fallback: Vec3): Vec3 => {
  const m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec((hex ?? "").trim())
  if (!m) return fallback
  const h = m[1].length === 3 ? m[1].replace(/./g, (c) => c + c) : m[1]
  const lin = (v: number) => {
    const c = v / 255
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  }
  return [lin(parseInt(h.slice(0, 2), 16)), lin(parseInt(h.slice(2, 4), 16)), lin(parseInt(h.slice(4, 6), 16))]
}
// #endregion

const FINISH_ID: Record<KeycapFinish, number> = { ink: 0, ash: 1, glass: 2, cobalt: 3, lime: 4 }

/** The site's palette: ink, paper, warm glass, ember and tan; a dark brown core. */
const DEFAULT_PALETTE: Record<KeycapFinish | "stem" | "core", { cap: string; legend: string }> = {
  ink: { cap: "#1d1915", legend: "#efe9dc" },
  ash: { cap: "#ece6d8", legend: "#2a211a" },
  glass: { cap: "#ffd9c7", legend: "#ff5a1f" },
  cobalt: { cap: "#ff5a1f", legend: "#5a1a05" },
  lime: { cap: "#c9a27a", legend: "#2a1a0c" },
  stem: { cap: "#d9d2c3", legend: "#000000" },
  core: { cap: "#2a221b", legend: "#000000" },
}

/** Fallback caps: generic dev glyphs. */
export const DEFAULT_KEYS: Keycap[] = [
  { label: "CSS", finish: "cobalt", hotkey: "c" },
  { label: "HTML", finish: "ink", hotkey: "h" },
  { icon: "slash", finish: "ash" },
  { label: "JS", finish: "ink", hotkey: "j" },
  { icon: "bolt", finish: "ash" },
  { icon: "quote", finish: "ink" },
  { icon: "at", finish: "glass" },
  { icon: "gear", finish: "ink" },
  { icon: "search", finish: "ink" },
  { icon: "braces", finish: "ink" },
  { icon: "check", finish: "lime" },
  { icon: "terminal", finish: "ink" },
]

// Glyphs on a 24-unit grid. "f:" marks a filled path; everything else is
// stroked with round caps, so they read as one family at any size.
const gear = () => {
  let d = ""
  const teeth = 8
  for (let i = 0; i < teeth; i++) {
    const c = (i / teeth) * Math.PI * 2
    for (const [r, a] of [
      [7, c - 0.3],
      [9.4, c - 0.17],
      [9.4, c + 0.17],
      [7, c + 0.3],
    ]) {
      d += (d ? "L" : "M") + (12 + Math.cos(a) * r).toFixed(2) + " " + (12 + Math.sin(a) * r).toFixed(2)
    }
  }
  return d + "Z M15.2 12 A3.2 3.2 0 1 0 8.8 12 A3.2 3.2 0 1 0 15.2 12 Z"
}

const ICONS: Record<Exclude<KeycapIcon, "none">, string[]> = {
  code: ["M8 7 L3 12 L8 17", "M16 7 L21 12 L16 17", "M14 4 L10 20"],
  braces: [
    "M9 4 C7 4 6.5 5 6.5 7 V9.8 C6.5 11 5.8 12 4.5 12 C5.8 12 6.5 13 6.5 14.2 V17 C6.5 19 7 20 9 20",
    "M15 4 C17 4 17.5 5 17.5 7 V9.8 C17.5 11 18.2 12 19.5 12 C18.2 12 17.5 13 17.5 14.2 V17 C17.5 19 17 20 15 20",
  ],
  chevrons: ["M9.5 6.5 L4 12 L9.5 17.5", "M14.5 6.5 L20 12 L14.5 17.5"],
  frame: ["M6.5 6.5 H17.5 V17.5 H6.5 Z", "f:M4 4 H8 V8 H4 Z M16 4 H20 V8 H16 Z M4 16 H8 V20 H4 Z M16 16 H20 V20 H16 Z"],
  quote: [
    "f:M10.5 6 C6.5 6.5 4.5 9 4.5 12.5 V18 H10.5 V12 H7.5 C7.7 10 8.8 8.8 10.5 8.5 Z M19.5 6 C15.5 6.5 13.5 9 13.5 12.5 V18 H19.5 V12 H16.5 C16.7 10 17.8 8.8 19.5 8.5 Z",
  ],
  slash: ["M15.5 3.5 L8.5 20.5"],
  at: ["M16 12 A4 4 0 1 1 8 12 A4 4 0 1 1 16 12", "M16 8 V13.5 C16 15.3 17 16.3 18.5 16.3 C20 16.3 21 14.8 21 12 A9 9 0 1 0 17.4 19.2"],
  pen: ["M12 3 L18.5 12.5 L15 20.5 H9 L5.5 12.5 Z", "M12 3 V10.5", "M13.6 12 A1.6 1.6 0 1 1 10.4 12 A1.6 1.6 0 1 1 13.6 12"],
  check: ["M4.5 12.5 L9.8 17.8 L19.5 6.5"],
  search: ["M16.5 10.5 A6 6 0 1 1 4.5 10.5 A6 6 0 1 1 16.5 10.5", "M15 15 L20 20"],
  bolt: ["f:M13.5 2.5 L5 13.5 H11 L10 21.5 L19 10 H13 Z"],
  gear: ["f:" + gear()],
  shield: ["M12 3 L19.5 6 V11.5 C19.5 16 16.5 19.5 12 21.5 C7.5 19.5 4.5 16 4.5 11.5 V6 Z"],
  folder: [
    "M3.5 7 C3.5 6 4.2 5.2 5.2 5.2 H9.4 L11.4 7.3 H18.8 C19.8 7.3 20.5 8 20.5 9 V17 C20.5 18 19.8 18.8 18.8 18.8 H5.2 C4.2 18.8 3.5 18 3.5 17 Z",
  ],
  cube: ["M12 3 L19.8 7.5 V16.5 L12 21 L4.2 16.5 V7.5 Z", "M4.2 7.5 L12 12 L19.8 7.5", "M12 12 V21"],
  cursor: ["f:M5 3.5 L19 12 L12.6 13.4 L9.4 19.6 Z"],
  hash: ["M10 4 L8 20", "M16 4 L14 20", "M4.5 9 H20", "M4 15 H19.5"],
  terminal: ["M5 7 L10 12 L5 17", "M12.5 17.5 H19"],
  layers: ["M12 3.5 L20.5 8 L12 12.5 L3.5 8 Z", "M3.5 12 L12 16.5 L20.5 12", "M3.5 16 L12 20.5 L20.5 16"],
  star: ["f:M12 3 L14.6 8.9 L21 9.5 L16.2 13.8 L17.6 20.2 L12 16.9 L6.4 20.2 L7.8 13.8 L3 9.5 L9.4 8.9 Z"],
  heart: [
    "f:M12 20 C5 15.5 3 12.5 3 9.2 C3 6.6 5 4.6 7.5 4.6 C9.3 4.6 10.9 5.6 12 7.2 C13.1 5.6 14.7 4.6 16.5 4.6 C19 4.6 21 6.6 21 9.2 C21 12.5 19 15.5 12 20 Z",
  ],
  arrow: ["M4.5 12 H19.5", "M13.5 6 L19.5 12 L13.5 18"],
  plus: ["M12 5 V19", "M5 12 H19"],
}

// Characters that obviously belong to a glyph, for typing at the orb.
const ICON_KEYS: Partial<Record<string, KeycapIcon[]>> = {
  "/": ["slash"],
  "\\": ["slash"],
  "@": ["at"],
  "#": ["hash"],
  "{": ["braces"],
  "}": ["braces"],
  "<": ["code", "chevrons"],
  ">": ["chevrons", "code", "terminal"],
  '"': ["quote"],
  "'": ["quote"],
  "?": ["search"],
  "+": ["plus"],
  "*": ["star"],
  $: ["terminal"],
}

// Cap geometry, in cap widths.
const KEY_H = 0.6
const TOP_HALF = 0.37
const BEVEL = 0.055
const DISH = 0.028
const CELL = 128

type Mesh = { pos: Float32Array; nor: Float32Array; idx: Uint16Array }

const smoothNormals = (pos: number[], idx: number[]) => {
  const nor = new Float32Array(pos.length)
  for (let i = 0; i < idx.length; i += 3) {
    const a = idx[i] * 3,
      b = idx[i + 1] * 3,
      c = idx[i + 2] * 3
    const ux = pos[b] - pos[a],
      uy = pos[b + 1] - pos[a + 1],
      uz = pos[b + 2] - pos[a + 2]
    const vx = pos[c] - pos[a],
      vy = pos[c + 1] - pos[a + 1],
      vz = pos[c + 2] - pos[a + 2]
    const nx = uy * vz - uz * vy,
      ny = uz * vx - ux * vz,
      nz = ux * vy - uy * vx
    for (const v of [a, b, c]) {
      nor[v] += nx
      nor[v + 1] += ny
      nor[v + 2] += nz
    }
  }
  for (let i = 0; i < nor.length; i += 3) {
    const l = Math.hypot(nor[i], nor[i + 1], nor[i + 2]) || 1
    nor[i] /= l
    nor[i + 1] /= l
    nor[i + 2] /= l
  }
  return nor
}

/** The cap: a stack of rounded-square rings, stitched into one smooth shell. */
const buildKeycap = (): Mesh => {
  const SEG = 7
  const rings: [number, number, number][] = []
  const wallTop = KEY_H - BEVEL
  for (let i = 0; i <= 4; i++) {
    const t = i / 4
    rings.push([0.5 - (0.5 - TOP_HALF - BEVEL) * t, 0.11 + 0.03 * t, wallTop * t])
  }
  for (let i = 1; i <= 5; i++) {
    const a = (i / 5) * (Math.PI / 2)
    rings.push([TOP_HALF + BEVEL * Math.cos(a), 0.14 + 0.02 * (1 - Math.cos(a)), wallTop + BEVEL * Math.sin(a)])
  }
  for (let i = 1; i <= 6; i++) {
    const h = TOP_HALF * (1 - i / 6.2)
    const q = h / TOP_HALF
    rings.push([h, 0.16 * q, KEY_H - DISH * (1 - q * q)])
  }
  const pos: number[] = []
  const loop = 4 * (SEG + 1)
  for (const [half, rad, y] of rings) {
    const r = Math.min(rad, half)
    const c = half - r
    const corners: [number, number, number][] = [
      [c, c, 0],
      [-c, c, Math.PI / 2],
      [-c, -c, Math.PI],
      [c, -c, (3 * Math.PI) / 2],
    ]
    for (const [cx, cz, a0] of corners) {
      for (let s = 0; s <= SEG; s++) {
        const a = a0 + (s / SEG) * (Math.PI / 2)
        pos.push(cx + Math.cos(a) * r, y, cz + Math.sin(a) * r)
      }
    }
  }
  const idx: number[] = []
  for (let i = 0; i < rings.length - 1; i++) {
    for (let j = 0; j < loop; j++) {
      const a = i * loop + j
      const b = i * loop + ((j + 1) % loop)
      const c = (i + 1) * loop + ((j + 1) % loop)
      const d = (i + 1) * loop + j
      idx.push(a, d, c, a, c, b)
    }
  }
  const centre = pos.length / 3
  pos.push(0, KEY_H - DISH, 0)
  const last = (rings.length - 1) * loop
  for (let j = 0; j < loop; j++) idx.push(last + j, centre, last + ((j + 1) % loop))
  return { pos: new Float32Array(pos), nor: smoothNormals(pos, idx), idx: new Uint16Array(idx) }
}

/** Flat-shaded boxes, for the stem and switch housing seen through glass caps. */
const buildStem = (): Mesh => {
  const pos: number[] = []
  const nor: number[] = []
  const idx: number[] = []
  const box = (cx: number, cy: number, cz: number, hx: number, hy: number, hz: number) => {
    const faces: [Vec3, Vec3, Vec3][] = [
      [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
      [
        [-1, 0, 0],
        [0, 0, 1],
        [0, 1, 0],
      ],
      [
        [0, 1, 0],
        [0, 0, 1],
        [1, 0, 0],
      ],
      [
        [0, -1, 0],
        [1, 0, 0],
        [0, 0, 1],
      ],
      [
        [0, 0, 1],
        [1, 0, 0],
        [0, 1, 0],
      ],
      [
        [0, 0, -1],
        [0, 1, 0],
        [1, 0, 0],
      ],
    ]
    const h: Vec3 = [hx, hy, hz]
    for (const [n, u, v] of faces) {
      const base = pos.length / 3
      for (const [su, sv] of [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ]) {
        const p: Vec3 = [cx, cy, cz]
        for (let a = 0; a < 3; a++) p[a] += n[a] * h[a] + u[a] * su * h[a] + v[a] * sv * h[a]
        pos.push(p[0], p[1], p[2])
        nor.push(n[0], n[1], n[2])
      }
      idx.push(base, base + 1, base + 2, base, base + 2, base + 3)
    }
  }
  box(0, 0.05, 0, 0.36, 0.05, 0.36)
  box(0, 0.25, 0, 0.17, 0.2, 0.045)
  box(0, 0.25, 0, 0.045, 0.2, 0.17)
  return { pos: new Float32Array(pos), nor: new Float32Array(nor), idx: new Uint16Array(idx) }
}

/** The dark core the caps sit on, so the gaps between them read as depth. */
const buildCore = (): Mesh => {
  const LAT = 24
  const LON = 40
  const pos: number[] = []
  for (let i = 0; i <= LAT; i++) {
    const th = (i / LAT) * Math.PI
    for (let j = 0; j <= LON; j++) {
      const ph = (j / LON) * Math.PI * 2
      pos.push(Math.sin(th) * Math.cos(ph), Math.cos(th), Math.sin(th) * Math.sin(ph))
    }
  }
  const idx: number[] = []
  for (let i = 0; i < LAT; i++) {
    for (let j = 0; j < LON; j++) {
      const a = i * (LON + 1) + j
      const b = a + 1
      const d = a + LON + 1
      const c = d + 1
      idx.push(a, b, c, a, c, d)
    }
  }
  return { pos: new Float32Array(pos), nor: new Float32Array(pos), idx: new Uint16Array(idx) }
}

const legendKey = (k: Keycap) => (k.icon && k.icon !== "none" ? "i:" + k.icon : k.label && k.icon !== "none" ? "t:" + k.label : "")

/** Every distinct legend, drawn white on black into one atlas. */
const drawAtlas = (legends: string[]) => {
  const cells = Math.max(1, Math.ceil(Math.sqrt(legends.length)))
  const canvas = document.createElement("canvas")
  canvas.width = canvas.height = cells * CELL
  const ctx = canvas.getContext("2d")
  if (!ctx) return { canvas, cells }
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "#fff"
  ctx.strokeStyle = "#fff"
  ctx.lineCap = "round"
  ctx.lineJoin = "round"
  legends.forEach((id, n) => {
    const ox = (n % cells) * CELL
    const oy = Math.floor(n / cells) * CELL
    ctx.save()
    ctx.translate(ox, oy)
    if (id.startsWith("i:")) {
      const paths = ICONS[id.slice(2) as Exclude<KeycapIcon, "none">] ?? []
      const s = (CELL * 0.66) / 24
      ctx.translate(CELL * 0.17, CELL * 0.17)
      ctx.scale(s, s)
      ctx.lineWidth = 2.6
      for (const p of paths) {
        if (p.startsWith("f:")) ctx.fill(new Path2D(p.slice(2)), "evenodd")
        else ctx.stroke(new Path2D(p))
      }
    } else {
      const text = id.slice(2)
      let size = text.length <= 2 ? 64 : 46
      const family = 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
      ctx.font = "700 " + size + "px " + family
      while (ctx.measureText(text).width > CELL * 0.78 && size > 14) {
        size -= 2
        ctx.font = "700 " + size + "px " + family
      }
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(text, CELL / 2, CELL / 2 + size * 0.04)
    }
    ctx.restore()
  })
  return { canvas, cells }
}

// ---------------------------------------------------------------------------

const MESH_VERT = `#version 300 es
layout(location = 0) in vec3 aPos;
layout(location = 1) in vec3 aNor;
layout(location = 2) in vec4 aM0;
layout(location = 3) in vec4 aM1;
layout(location = 4) in vec4 aM2;
layout(location = 5) in vec4 aM3;
layout(location = 6) in vec4 aInfo;
uniform mat4 uViewProj;
uniform float uReflect;
uniform float uFloor;
out vec3 vWorld;
out vec3 vNormal;
out vec3 vLocal;
out vec3 vTx;
out vec3 vTz;
flat out vec4 vInfo;
void main() {
  mat4 m = mat4(aM0, aM1, aM2, aM3);
  vec4 w = m * vec4(aPos, 1.0);
  vec3 n = mat3(m) * aNor;
  vec3 tx = aM0.xyz;
  vec3 tz = aM2.xyz;
  if (uReflect > 0.5) {
    w.y = 2.0 * uFloor - w.y;
    n.y = -n.y;
    tx.y = -tx.y;
    tz.y = -tz.y;
  }
  vWorld = w.xyz;
  vNormal = n;
  vLocal = aPos;
  vTx = tx;
  vTz = tz;
  vInfo = aInfo;
  gl_Position = uViewProj * w;
}
`

const MESH_FRAG = `#version 300 es
precision highp float;
in vec3 vWorld;
in vec3 vNormal;
in vec3 vLocal;
in vec3 vTx;
in vec3 vTz;
flat in vec4 vInfo;
out vec4 fragColor;

uniform vec3 uCam;
uniform vec3 uCap[7];
uniform vec3 uInk[7];
uniform vec3 uGlow;
uniform sampler2D tLegend;
uniform float uCells;
uniform float uReflect;
uniform float uFloor;
uniform float uGlass;
uniform float uStem;
uniform float uCore;

const float KEY_H = 0.600;
const float TOP_HALF = 0.370;
const float CELL = 128.0;

vec3 tone(vec3 c) {
  c = (c * (2.51 * c + 0.03)) / (c * (2.43 * c + 0.59) + 0.14);
  return pow(clamp(c, 0.0, 1.0), vec3(1.0 / 2.2));
}

// The studio the caps reflect: a bright, warm room like the page around it,
// one big softbox high on the left, a strip on the right, a warm floor.
vec3 env(vec3 d) {
  vec3 c = mix(vec3(0.22, 0.19, 0.16), vec3(0.62, 0.58, 0.52), smoothstep(-0.3, 0.9, d.y));
  c += vec3(1.0, 0.97, 0.92) * smoothstep(0.84, 0.96, dot(d, normalize(vec3(-0.55, 0.78, 0.45)))) * 2.2;
  c += vec3(1.0, 0.95, 0.88) * smoothstep(0.93, 0.99, dot(d, normalize(vec3(0.85, 0.3, 0.25)))) * 0.9;
  c += uGlow * smoothstep(0.05, -0.55, d.y) * 0.35;
  return c;
}

void main() {
  int f = int(vInfo.x + 0.5);
  float hover = vInfo.z;
  vec3 base = uCap[f] * vInfo.w;
  vec3 ink = uInk[f];
  float rough = f == 0 ? 0.36 : f == 1 ? 0.46 : f == 2 ? 0.06 : f == 3 ? 0.3 : 0.42;
  if (uStem > 0.5) { base = uCap[5]; rough = 0.5; }
  if (uCore > 0.5) { base = uCap[6]; rough = 0.55; }

  vec3 N = normalize(vNormal);
  if (!gl_FrontFacing) N = -N;
  vec3 V = normalize(uCam - vWorld);

  float hasLegend = step(0.0, vInfo.y) * (1.0 - uStem) * (1.0 - uCore);
  vec2 uv = vec2(vLocal.x, -vLocal.z) / (2.0 * TOP_HALF) + 0.5;
  float inside = step(0.0, uv.x) * step(0.0, uv.y) * step(uv.x, 1.0) * step(uv.y, 1.0);
  float top = smoothstep(KEY_H - 0.07, KEY_H - 0.035, vLocal.y) * inside * hasLegend;
  float id = floor(max(vInfo.y, 0.0) + 0.5);
  float row = floor((id + 0.5) / uCells);
  vec2 cell = vec2(id - row * uCells, row);
  vec2 auv = (cell + clamp(vec2(uv.x, 1.0 - uv.y), 0.02, 0.98)) / uCells;
  float e = 1.5 / (uCells * CELL);
  float leg = texture(tLegend, auv).r * top;
  float gx = texture(tLegend, auv + vec2(e, 0.0)).r - texture(tLegend, auv - vec2(e, 0.0)).r;
  float gz = texture(tLegend, auv + vec2(0.0, e)).r - texture(tLegend, auv - vec2(0.0, e)).r;
  N = normalize(N + (normalize(vTx) * gx + normalize(vTz) * gz) * 0.45 * top);
  base = mix(base, ink, leg * (f == 2 ? 0.0 : 0.92));
  rough = mix(rough, 0.6, leg * 0.5);

  float ao = (uStem > 0.5 || uCore > 0.5) ? 0.55 : mix(0.38, 1.0, smoothstep(0.0, KEY_H * 0.85, vLocal.y));

  float ndv = max(dot(N, V), 0.0);
  float F = 0.04 + 0.96 * pow(1.0 - ndv, 5.0);
  float shin = mix(900.0, 22.0, rough);

  vec3 Ls[3];
  vec3 Cs[3];
  Ls[0] = normalize(vec3(-0.55, 0.85, 0.7));  Cs[0] = vec3(1.0, 0.96, 0.9) * 2.4;
  Ls[1] = normalize(vec3(0.2, -0.85, 0.5));   Cs[1] = uGlow * 0.9;
  Ls[2] = normalize(vec3(0.9, 0.35, -0.45));  Cs[2] = vec3(1.0, 0.94, 0.86) * 1.1;
  vec3 diff = vec3(0.0);
  vec3 spec = vec3(0.0);
  for (int i = 0; i < 3; i++) {
    float ndl = max(dot(N, Ls[i]), 0.0);
    vec3 H = normalize(Ls[i] + V);
    diff += Cs[i] * ndl;
    spec += Cs[i] * pow(max(dot(N, H), 0.0), shin) * (shin + 8.0) / 60.0 * ndl;
  }
  vec3 R = reflect(-V, N);
  vec3 envc = mix(env(R), env(N) * 0.5, rough);
  vec3 ambient = vec3(0.28, 0.25, 0.22) + uGlow * 0.08 * max(-N.y, 0.0);

  vec3 col;
  float alpha = 1.0;
  if (uGlass > 0.5) {
    alpha = clamp(0.18 + F * 0.95 + leg * 0.8, 0.0, 1.0);
    vec3 body = base * (diff * 0.25 + 0.2);
    col = body * alpha + envc * F * 1.2 + spec * 0.09;
    col += ink * leg * (0.5 + diff.r * 0.25);
    col += uGlow * hover * (0.25 + F) * 0.6;
  } else {
    col = base * (diff * 0.34 + ambient) * ao;
    col += (spec * 0.05 * (1.0 - rough * 0.7) + envc * F * (1.0 - rough * 0.55)) * mix(0.5, 1.0, ao);
    col += uGlow * hover * (0.06 + F * 1.1) * 0.7;
    col += ink * leg * hover * 0.35;
  }

  vec3 outc = tone(col);
  if (uReflect > 0.5) {
    float fade = exp(-max(uFloor - vWorld.y, 0.0) * 1.5) * 0.22;
    fragColor = vec4(outc * fade * alpha, fade * alpha);
  } else if (uGlass > 0.5) {
    fragColor = vec4(outc * alpha, alpha);
  } else {
    fragColor = vec4(outc, 1.0);
  }
}
`

const compile = (gl: WebGL2RenderingContext, type: number, src: string) => {
  const sh = gl.createShader(type)
  if (!sh) throw new Error("no shader")
  gl.shaderSource(sh, src)
  gl.compileShader(sh)
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh)
    gl.deleteShader(sh)
    throw new Error("shader: " + log)
  }
  return sh
}

const link = (gl: WebGL2RenderingContext, vsSrc: string, fsSrc: string) => {
  const vs = compile(gl, gl.VERTEX_SHADER, vsSrc)
  const fs = compile(gl, gl.FRAGMENT_SHADER, fsSrc)
  const program = gl.createProgram()
  if (!program) throw new Error("no program")
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error("link: " + log)
  }
  return program
}

// Column-major 4×4 helpers.
const perspective = (fovY: number, aspect: number, near: number, far: number) => {
  const f = 1 / Math.tan(fovY / 2)
  const nf = 1 / (near - far)
  return [f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]
}

const sub = (a: Vec3, b: Vec3): Vec3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const cross = (a: Vec3, b: Vec3): Vec3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const norm = (a: Vec3): Vec3 => {
  const l = Math.hypot(a[0], a[1], a[2]) || 1
  return [a[0] / l, a[1] / l, a[2] / l]
}

const lookAt = (eye: Vec3, target: Vec3) => {
  const z = norm(sub(eye, target))
  const x = norm(cross([0, 1, 0], z))
  const y = cross(z, x)
  return {
    m: [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1],
    right: x,
    up: y,
    forward: [-z[0], -z[1], -z[2]] as Vec3,
  }
}

const mul4 = (a: number[], b: number[]) => {
  const o = new Array<number>(16)
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]
    }
  }
  return o
}

const STRIDE = 20 // floats per instance: a 4×4 model matrix, then info
const RADIUS = 2
const FOV = (28 * Math.PI) / 180

export default function KeycapOrb({
  keys = DEFAULT_KEYS,
  palette,
  glow = "#ff7a3d",
  rings = 9,
  scale = 0.62,
  autoRotate = true,
  speed = 1,
  reflection = true,
  ripple = true,
  height = "560px",
  fill = "repeat",
  onKeyPress,
  onKeyHover,
  onKeySound,
  className = "",
  "aria-label": ariaLabel = "A ball of keycaps. Drag to spin it, press a cap, or focus it and type.",
}: KeycapOrbProps) {
  const rootRef = React.useRef<HTMLDivElement | null>(null)
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null)
  const [failed, setFailed] = React.useState(false)
  const [generation, setGeneration] = React.useState(0)
  const [reduced, setReduced] = React.useState(false)
  const [announce, setAnnounce] = React.useState("")

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduced(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  // Colours and motion are read every frame, so changing them never rebuilds
  // the GL state. Only the keys and the ring count change the geometry.
  const tuning = React.useRef({ palette, glow, scale, autoRotate, speed, reflection, ripple, reduced, onKeyPress, onKeyHover, onKeySound })
  tuning.current = { palette, glow, scale, autoRotate, speed, reflection, ripple, reduced, onKeyPress, onKeyHover, onKeySound }

  const layoutSig = React.useMemo(() => Math.round(clamp(rings, 5, 15)) + "|" + fill + "|" + JSON.stringify(keys ?? []), [rings, fill, keys])

  React.useEffect(() => {
    const canvas = canvasRef.current
    const root = rootRef.current
    if (!canvas || !root) return

    // Transparent: the page behind is the background.
    const gl = canvas.getContext("webgl2", { alpha: true, antialias: true, premultipliedAlpha: true })
    if (!gl) {
      setFailed(true)
      return
    }

    // ---- layout ---------------------------------------------------------
    const ringCount = Math.round(clamp(rings, 5, 15))
    const slots = layoutSlots(ringCount)
    const order = frontOrder(slots)
    const list = keys && keys.length ? keys : DEFAULT_KEYS
    const count = slots.length
    const step = Math.PI / (ringCount - 1)
    const capWorld = RADIUS * step * 0.92

    const assigned: Keycap[] = new Array(count)
    order.forEach((slot, rank) => {
      assigned[slot] =
        rank < list.length
          ? list[rank]
          : fill === "blank"
            ? { icon: "none", finish: rank % 3 ? "ash" : "ink" }
            : list[(rank * 7) % list.length]
    })

    const legends: string[] = []
    const cellOf = new Map<string, number>()
    for (const k of assigned) {
      const id = legendKey(k)
      if (id && !cellOf.has(id) && legends.length < 256) {
        cellOf.set(id, legends.length)
        legends.push(id)
      }
    }

    const rand = mulberry32(0x6b657963)
    const frames = slots.map((s, i) => {
      const n = s.dir
      const e = s.east
      const nth: Vec3 = norm(cross(n, e))
      const tilt = (rand() - 0.5) * 0.09
      const tiltDir = rand() * Math.PI * 2
      const roll = (rand() - 0.5) * 0.08
      const axis = norm([
        e[0] * Math.cos(tiltDir) + nth[0] * Math.sin(tiltDir),
        e[1] * Math.cos(tiltDir) + nth[1] * Math.sin(tiltDir),
        e[2] * Math.cos(tiltDir) + nth[2] * Math.sin(tiltDir),
      ])
      const q = qMul(qAxis(axis, tilt), qAxis(n, roll))
      const y = qRotate(q, n)
      const x = qRotate(q, e)
      const z = cross(x, y)
      const pop = rand() < 0.12 ? 0.18 + rand() * 0.12 : (rand() - 0.3) * 0.06
      const finish = assigned[i]?.finish ?? "ink"
      return {
        x,
        y,
        z,
        dir: n,
        size: capWorld * s.size,
        pop: finish === "glass" ? Math.max(pop, 0.1) : pop,
        finish: FINISH_ID[finish] ?? 0,
        cell: cellOf.get(legendKey(assigned[i] ?? {})) ?? -1,
        shade: 0.92 + rand() * 0.16,
      }
    })
    const glassIdx = frames.map((f, i) => (f.finish === 2 ? i : -1)).filter((i) => i >= 0)
    const solidIdx = frames.map((f, i) => (f.finish !== 2 ? i : -1)).filter((i) => i >= 0)

    // ---- GL resources ----------------------------------------------------
    let meshProgram: WebGLProgram | null = null
    const buffers: WebGLBuffer[] = []
    const vaos: WebGLVertexArrayObject[] = []
    let atlas: WebGLTexture | null = null
    let raf = 0
    let disposed = false
    let visible = true

    const onLost = (e: Event) => {
      e.preventDefault()
      cancelAnimationFrame(raf)
      raf = 0
    }
    const onRestored = () => setGeneration((g) => g + 1)
    canvas.addEventListener("webglcontextlost", onLost)
    canvas.addEventListener("webglcontextrestored", onRestored)

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.round(canvas.clientWidth * dpr)
      const h = Math.round(canvas.clientHeight * dpr)
      if (w === 0 || h === 0) return
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    // WebGL2 has no base-instance draw, so a sub-range of the instance buffer
    // is drawn by moving the attribute pointers to it.
    const pointInstances = (buf: WebGLBuffer | null, first: number) => {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      for (let a = 0; a < 5; a++) {
        gl.vertexAttribPointer(2 + a, 4, gl.FLOAT, false, STRIDE * 4, first * STRIDE * 4 + a * 16)
      }
    }

    const meshVao = (mesh: Mesh, inst: WebGLBuffer | null) => {
      const vao = gl.createVertexArray()
      if (!vao) throw new Error("no vao")
      vaos.push(vao)
      gl.bindVertexArray(vao)
      const pb = gl.createBuffer()
      const nb = gl.createBuffer()
      const ib = gl.createBuffer()
      if (!pb || !nb || !ib) throw new Error("no buffer")
      buffers.push(pb, nb, ib)
      gl.bindBuffer(gl.ARRAY_BUFFER, pb)
      gl.bufferData(gl.ARRAY_BUFFER, mesh.pos, gl.STATIC_DRAW)
      gl.enableVertexAttribArray(0)
      gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ARRAY_BUFFER, nb)
      gl.bufferData(gl.ARRAY_BUFFER, mesh.nor, gl.STATIC_DRAW)
      gl.enableVertexAttribArray(1)
      gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0)
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib)
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.idx, gl.STATIC_DRAW)
      for (let a = 0; a < 5; a++) {
        gl.enableVertexAttribArray(2 + a)
        gl.vertexAttribDivisor(2 + a, 1)
      }
      pointInstances(inst, 0)
      gl.bindVertexArray(null)
      return { vao, count: mesh.idx.length }
    }

    const inst = new Float32Array(count * STRIDE)
    const coreInst = new Float32Array(STRIDE)
    let u: Record<string, WebGLUniformLocation | null> = {}
    let capVao = { vao: null as WebGLVertexArrayObject | null, count: 0 }
    let stemVao = { vao: null as WebGLVertexArrayObject | null, count: 0 }
    let coreVao = { vao: null as WebGLVertexArrayObject | null, count: 0 }
    let instBuf: WebGLBuffer | null = null
    let coreBuf: WebGLBuffer | null = null
    let atlasCells = 1

    try {
      meshProgram = link(gl, MESH_VERT, MESH_FRAG)
      for (const name of ["uViewProj", "uReflect", "uFloor", "uCam", "uCap", "uInk", "uGlow", "tLegend", "uCells", "uGlass", "uStem", "uCore"]) {
        u[name] = gl.getUniformLocation(meshProgram, name)
      }
      instBuf = gl.createBuffer()
      coreBuf = gl.createBuffer()
      if (!instBuf || !coreBuf) throw new Error("no buffer")
      buffers.push(instBuf, coreBuf)
      gl.bindBuffer(gl.ARRAY_BUFFER, instBuf)
      gl.bufferData(gl.ARRAY_BUFFER, inst.byteLength, gl.DYNAMIC_DRAW)
      gl.bindBuffer(gl.ARRAY_BUFFER, coreBuf)
      gl.bufferData(gl.ARRAY_BUFFER, coreInst.byteLength, gl.DYNAMIC_DRAW)
      capVao = meshVao(buildKeycap(), instBuf)
      stemVao = meshVao(buildStem(), instBuf)
      coreVao = meshVao(buildCore(), coreBuf)

      const { canvas: atlasCanvas, cells } = drawAtlas(legends)
      atlasCells = cells
      atlas = gl.createTexture()
      gl.bindTexture(gl.TEXTURE_2D, atlas)
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas)
      gl.generateMipmap(gl.TEXTURE_2D)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    } catch {
      setFailed(true)
      return
    }

    // ---- motion state ----------------------------------------------------
    let q: Quat = qAxis([1, 0, 0], -0.14)
    let vel: [number, number] = [0, 0]
    let tilt: [number, number] = [0, 0]
    const hoverAmt = new Float32Array(count)
    const pressAmt = new Float32Array(count)
    const pressHeld = new Uint8Array(count)
    const ripples: { origin: Vec3; t0: number }[] = []
    const started = performance.now()
    let last = started
    let hover = -1
    const setHover = (i: number) => {
      if (i === hover) return
      hover = i
      const k = i >= 0 ? assigned[i] : null
      tuning.current.onKeyHover?.(k && legendKey(k) ? k : null, i)
    }
    let pointer = { x: 0, y: 0, inside: false }
    let drag = { active: false, moved: false, id: -1, sx: 0, sy: 0, lx: 0, ly: 0, lt: 0, key: -1 }
    let keyboardKey = new Map<string, number>()
    let center: Vec3 = [0, 0, 0]
    let cam = { eye: [0, 0, 10] as Vec3, right: [1, 0, 0] as Vec3, up: [0, 1, 0] as Vec3, forward: [0, 0, -1] as Vec3, aspect: 1 }
    const world = frames.map(() => ({ x: [0, 0, 0] as Vec3, y: [0, 0, 0] as Vec3, z: [0, 0, 0] as Vec3, p: [0, 0, 0] as Vec3, s: 1 }))

    // ---- picking ---------------------------------------------------------
    const ray = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect()
      const nx = ((clientX - r.left) / Math.max(r.width, 1)) * 2 - 1
      const ny = 1 - ((clientY - r.top) / Math.max(r.height, 1)) * 2
      const t = Math.tan(FOV / 2)
      const d = norm([
        cam.forward[0] + cam.right[0] * nx * t * cam.aspect + cam.up[0] * ny * t,
        cam.forward[1] + cam.right[1] * nx * t * cam.aspect + cam.up[1] * ny * t,
        cam.forward[2] + cam.right[2] * nx * t * cam.aspect + cam.up[2] * ny * t,
      ])
      return { o: cam.eye, d }
    }

    const pick = (clientX: number, clientY: number) => {
      const { o, d } = ray(clientX, clientY)
      let best = -1
      let bestT = raySphere(o, d, center, RADIUS * 0.98)
      if (bestT < 0) bestT = Infinity
      for (let i = 0; i < count; i++) {
        const w = world[i]
        const rel = sub(o, w.p)
        const s2 = w.s * w.s
        const lo: Vec3 = [dot(rel, w.x) / s2, dot(rel, w.y) / s2, dot(rel, w.z) / s2]
        const ld: Vec3 = [dot(d, w.x) / s2, dot(d, w.y) / s2, dot(d, w.z) / s2]
        const t = rayBox(lo, ld, [-0.5, 0, -0.5], [0.5, KEY_H, 0.5])
        if (t >= 0 && t < bestT) {
          bestT = t
          best = i
        }
      }
      return best
    }

    // ---- pressing --------------------------------------------------------
    const fire = (i: number) => {
      const now = (performance.now() - started) / 1000
      if (tuning.current.ripple && !tuning.current.reduced) {
        ripples.push({ origin: frames[i].dir, t0: now })
        if (ripples.length > 6) ripples.shift()
      }
      const k = assigned[i]
      const name = k?.label || (k?.icon && k.icon !== "none" ? k.icon : "blank")
      setAnnounce(name + " pressed")
      tuning.current.onKeyPress?.(k ?? {}, i)
    }

    const facing = (i: number) => dot(norm(world[i].y), norm(sub(cam.eye, world[i].p)))

    const facingIndex = () => {
      let best = 0
      let bestDot = -Infinity
      for (let i = 0; i < count; i++) {
        const f = facing(i)
        if (f > bestDot) {
          bestDot = f
          best = i
        }
      }
      return best
    }

    const keyFor = (key: string) => {
      const lower = key.toLowerCase()
      const candidates: number[] = []
      assigned.forEach((k, i) => {
        if (k.hotkey && k.hotkey.toLowerCase() === lower) candidates.push(i)
      })
      if (!candidates.length && key.length === 1) {
        const icons = ICON_KEYS[key] ?? []
        assigned.forEach((k, i) => {
          if (k.icon && icons.includes(k.icon)) candidates.push(i)
          else if (k.label && k.label.toLowerCase().startsWith(lower)) candidates.push(i)
        })
      }
      let best = -1
      let bestDot = -Infinity
      for (const i of candidates) {
        const f = facing(i)
        if (f > bestDot) {
          bestDot = f
          best = i
        }
      }
      if (best >= 0 || key.length !== 1) return best
      const front: number[] = []
      for (let i = 0; i < count; i++) if (facing(i) > 0.55) front.push(i)
      return front.length ? front[key.codePointAt(0)! % front.length] : facingIndex()
    }

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === "mouse") return
      const k = pick(e.clientX, e.clientY)
      drag = { active: true, moved: false, id: e.pointerId, sx: e.clientX, sy: e.clientY, lx: e.clientX, ly: e.clientY, lt: performance.now(), key: k }
      vel = [0, 0]
      if (k >= 0) {
        pressHeld[k] = 1
        tuning.current.onKeySound?.("down")
      }
      if (e.pointerType === "mouse") root.setPointerCapture?.(e.pointerId)
      root.style.cursor = "grabbing"
    }

    const onPointerMove = (e: PointerEvent) => {
      const r = root.getBoundingClientRect()
      pointer = {
        x: ((e.clientX - r.left) / Math.max(r.width, 1)) * 2 - 1,
        y: ((e.clientY - r.top) / Math.max(r.height, 1)) * 2 - 1,
        inside: true,
      }
      if (drag.active && e.pointerId === drag.id) {
        const dx = e.clientX - drag.lx
        const dy = e.clientY - drag.ly
        if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6) {
          drag.moved = true
          if (drag.key >= 0) {
            pressHeld[drag.key] = 0
            tuning.current.onKeySound?.("up")
          }
        }
        if (drag.moved) {
          const k = (Math.PI * 1.2) / Math.max(Math.min(r.width, r.height), 1)
          q = qNormalize(qMul(qMul(qAxis([0, 1, 0], dx * k), qAxis(cam.right, dy * k)), q))
          const now = performance.now()
          const dt = Math.max(now - drag.lt, 1) / 1000
          vel = [vel[0] * 0.6 + ((dx * k) / dt) * 0.4, vel[1] * 0.6 + ((dy * k) / dt) * 0.4]
          drag.lt = now
        }
        drag.lx = e.clientX
        drag.ly = e.clientY
      } else if (e.pointerType === "mouse") {
        setHover(pick(e.clientX, e.clientY))
        root.style.cursor = hover >= 0 ? "pointer" : "grab"
      }
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!drag.active || e.pointerId !== drag.id) return
      if (performance.now() - drag.lt > 80) vel = [0, 0]
      if (!drag.moved && drag.key >= 0) {
        pressHeld[drag.key] = 0
        tuning.current.onKeySound?.("up")
        fire(drag.key)
      }
      drag.active = false
      root.releasePointerCapture?.(e.pointerId)
      root.style.cursor = hover >= 0 ? "pointer" : "grab"
    }

    // A vertical swipe on a touch screen becomes a page scroll (touch-action:
    // pan-y), which cancels the pointer: let go of anything held.
    const onPointerCancel = (e: PointerEvent) => {
      if (drag.key >= 0) pressHeld[drag.key] = 0
      if (e.pointerId === drag.id) drag.active = false
    }

    const onPointerLeave = () => {
      pointer.inside = false
      if (!drag.active) setHover(-1)
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const spin = 1.6
      if (e.key === "ArrowLeft") vel = [-spin, vel[1]]
      else if (e.key === "ArrowRight") vel = [spin, vel[1]]
      else if (e.key === "ArrowUp") vel = [vel[0], -spin]
      else if (e.key === "ArrowDown") vel = [vel[0], spin]
      else if (e.key === "Tab" || e.key === "Escape" || e.key === "Shift") return
      else {
        if (e.repeat) {
          e.preventDefault()
          return
        }
        const i = e.key === "Enter" || e.key === " " ? facingIndex() : keyFor(e.key)
        if (i < 0) return
        pressHeld[i] = 1
        tuning.current.onKeySound?.("down")
        keyboardKey.set(e.key.toLowerCase(), i)
      }
      e.preventDefault()
    }

    const onKeyUp = (e: KeyboardEvent) => {
      const i = keyboardKey.get(e.key.toLowerCase())
      if (i === undefined) return
      keyboardKey.delete(e.key.toLowerCase())
      pressHeld[i] = 0
      tuning.current.onKeySound?.("up")
      fire(i)
    }

    const onBlur = () => {
      keyboardKey.forEach((i) => (pressHeld[i] = 0))
      keyboardKey = new Map()
    }

    root.addEventListener("pointerdown", onPointerDown)
    root.addEventListener("pointermove", onPointerMove)
    root.addEventListener("pointerup", onPointerUp)
    root.addEventListener("pointercancel", onPointerCancel)
    root.addEventListener("pointerleave", onPointerLeave)
    root.addEventListener("keydown", onKeyDown)
    root.addEventListener("keyup", onKeyUp)
    root.addEventListener("blur", onBlur)

    // ---- frame -----------------------------------------------------------
    const capColors = new Float32Array(21)
    const inkColors = new Float32Array(21)
    const finishes: (KeycapFinish | "stem" | "core")[] = ["ink", "ash", "glass", "cobalt", "lime", "stem", "core"]
    const drawOrder: number[] = []

    const frame = () => {
      raf = 0
      if (disposed || !visible) return
      const t = tuning.current
      const nowMs = performance.now()
      const dt = Math.min((nowMs - last) / 1000, 0.05)
      last = nowMs
      const now = (nowMs - started) / 1000
      const calm = t.reduced

      resize()
      const W = canvas.width
      const H = canvas.height
      if (W === 0 || H === 0) {
        raf = requestAnimationFrame(frame)
        return
      }

      // Spin: momentum after a drag, settling back into the idle spin.
      if (!drag.active) {
        if (Math.abs(vel[0]) + Math.abs(vel[1]) > 1e-4) {
          q = qNormalize(qMul(qMul(qAxis([0, 1, 0], vel[0] * dt), qAxis(cam.right, vel[1] * dt)), q))
          const damp = Math.exp(-dt * 2.2)
          vel = [vel[0] * damp, vel[1] * damp]
        }
        if (t.autoRotate && !calm) {
          q = qNormalize(qMul(qAxis([0, 1, 0], 0.16 * clamp(t.speed, -6, 6) * dt), q))
        }
      }

      // The pointer leans the ball a few degrees toward itself.
      const goal: [number, number] = pointer.inside && !drag.active ? [pointer.x * 0.12, pointer.y * 0.1] : [0, 0]
      const ease = 1 - Math.exp(-dt * 4)
      tilt = [tilt[0] + (goal[0] - tilt[0]) * ease, tilt[1] + (goal[1] - tilt[1]) * ease]
      const view = qNormalize(qMul(qMul(qAxis([0, 1, 0], tilt[0]), qAxis([1, 0, 0], tilt[1])), q))

      // ---- camera
      const aspect = W / H
      const reach = RADIUS + capWorld * KEY_H
      const dist = fitDistance(reach, FOV, aspect, t.scale)
      const bob = calm ? 0 : Math.sin(now * 0.9) * 0.05
      center = [0, bob, 0]
      const floorY = -reach * 1.16
      const eye: Vec3 = [0, dist * 0.12, dist]
      const target: Vec3 = [0, -reach * 0.12, 0]
      const la = lookAt(eye, target)
      const viewProj = mul4(perspective(FOV, aspect, 0.1, dist * 4), la.m)
      cam = { eye, right: la.right, up: la.up, forward: la.forward, aspect }

      // ---- caps: hover, press, ripple, then their world frames
      while (ripples.length && now - ripples[0].t0 > 3.5) ripples.shift()
      const kHover = 1 - Math.exp(-dt * 10)
      const kPress = 1 - Math.exp(-dt * 18)
      for (let i = 0; i < count; i++) {
        const f = frames[i]
        hoverAmt[i] += ((i === hover ? 1 : 0) - hoverAmt[i]) * kHover
        pressAmt[i] += ((pressHeld[i] ? 1 : 0) - pressAmt[i]) * kPress
        let wave = 0
        for (const r of ripples) wave += ripplePulse(now - r.t0, angleBetween(f.dir, r.origin))
        const lift = f.pop + hoverAmt[i] * 0.22 - pressAmt[i] * 0.3 + wave
        const x = qRotate(view, f.x)
        const y = qRotate(view, f.y)
        const z = qRotate(view, f.z)
        const dir = qRotate(view, f.dir)
        const s = f.size
        const out = RADIUS * 0.97 + lift * KEY_H * s
        const w = world[i]
        w.x = [x[0] * s, x[1] * s, x[2] * s]
        w.y = [y[0] * s, y[1] * s, y[2] * s]
        w.z = [z[0] * s, z[1] * s, z[2] * s]
        w.p = [center[0] + dir[0] * out, center[1] + dir[1] * out, center[2] + dir[2] * out]
        w.s = s
      }

      // Instances: the solid caps, then the glass ones back to front.
      glassIdx.sort((a, b) => {
        const da = sub(world[a].p, eye)
        const db = sub(world[b].p, eye)
        return dot(db, db) - dot(da, da)
      })
      drawOrder.length = 0
      drawOrder.push(...solidIdx, ...glassIdx)
      drawOrder.forEach((i, n) => {
        const w = world[i]
        const o = n * STRIDE
        inst.set(w.x, o)
        inst[o + 3] = 0
        inst.set(w.y, o + 4)
        inst[o + 7] = 0
        inst.set(w.z, o + 8)
        inst[o + 11] = 0
        inst.set(w.p, o + 12)
        inst[o + 15] = 1
        inst[o + 16] = frames[i].finish
        inst[o + 17] = frames[i].cell
        inst[o + 18] = hoverAmt[i] + pressAmt[i] * 0.4
        inst[o + 19] = frames[i].shade
      })
      const cr = RADIUS * 0.97
      coreInst.set([cr, 0, 0, 0, 0, cr, 0, 0, 0, 0, cr, 0, center[0], center[1], center[2], 1, 0, -1, 0, 1])
      gl.bindBuffer(gl.ARRAY_BUFFER, instBuf)
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, inst)
      gl.bindBuffer(gl.ARRAY_BUFFER, coreBuf)
      gl.bufferSubData(gl.ARRAY_BUFFER, 0, coreInst)

      // ---- colours
      finishes.forEach((fname, n) => {
        const p = t.palette?.[fname]
        const d = DEFAULT_PALETTE[fname]
        capColors.set(hexToLinear(p?.cap ?? d.cap, [0.5, 0.5, 0.5]), n * 3)
        inkColors.set(hexToLinear(p?.legend ?? d.legend, [0, 0, 0]), n * 3)
      })
      const glowLin = hexToLinear(t.glow, [1, 0.3, 0.1])

      // ---- draw
      gl.viewport(0, 0, W, H)
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
      gl.enable(gl.DEPTH_TEST)
      gl.enable(gl.CULL_FACE)
      gl.useProgram(meshProgram)
      gl.uniformMatrix4fv(u.uViewProj, false, viewProj)
      gl.uniform3fv(u.uCam, eye)
      gl.uniform3fv(u.uCap, capColors)
      gl.uniform3fv(u.uInk, inkColors)
      gl.uniform3fv(u.uGlow, glowLin)
      gl.uniform1f(u.uFloor, floorY)
      gl.uniform1f(u.uCells, atlasCells)
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, atlas)
      gl.uniform1i(u.tLegend, 0)

      const nSolid = solidIdx.length
      const nGlass = glassIdx.length
      const drawCaps = (glass: boolean) => {
        gl.bindVertexArray(capVao.vao)
        pointInstances(instBuf, glass ? nSolid : 0)
        gl.uniform1f(u.uGlass, glass ? 1 : 0)
        gl.drawElementsInstanced(gl.TRIANGLES, capVao.count, gl.UNSIGNED_SHORT, 0, glass ? nGlass : nSolid)
      }
      const drawStems = () => {
        if (!nGlass) return
        gl.bindVertexArray(stemVao.vao)
        pointInstances(instBuf, nSolid)
        gl.uniform1f(u.uStem, 1)
        gl.drawElementsInstanced(gl.TRIANGLES, stemVao.count, gl.UNSIGNED_SHORT, 0, nGlass)
        gl.uniform1f(u.uStem, 0)
      }
      const drawCore = () => {
        gl.bindVertexArray(coreVao.vao)
        gl.uniform1f(u.uCore, 1)
        gl.drawElementsInstanced(gl.TRIANGLES, coreVao.count, gl.UNSIGNED_SHORT, 0, 1)
        gl.uniform1f(u.uCore, 0)
      }

      // The reflection: the ball mirrored through the floor, faint, blended.
      if (t.reflection) {
        gl.uniform1f(u.uReflect, 1)
        gl.frontFace(gl.CW)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        gl.uniform1f(u.uGlass, 0)
        drawCore()
        drawCaps(false)
        gl.clear(gl.DEPTH_BUFFER_BIT)
        gl.frontFace(gl.CCW)
        gl.uniform1f(u.uReflect, 0)
      }

      // The ball: core, solid caps, stems, then glass blended on top.
      gl.disable(gl.BLEND)
      gl.uniform1f(u.uGlass, 0)
      drawCore()
      drawCaps(false)
      drawStems()
      if (nGlass) {
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
        gl.depthMask(false)
        drawCaps(true)
        gl.depthMask(true)
        gl.disable(gl.BLEND)
      }
      gl.bindVertexArray(null)

      raf = requestAnimationFrame(frame)
    }

    // Nothing draws while the orb is scrolled out of view.
    const io = new IntersectionObserver((entries) => {
      visible = entries.some((e) => e.isIntersecting)
      if (visible && !raf && !disposed) {
        last = performance.now()
        raf = requestAnimationFrame(frame)
      }
    })
    io.observe(root)

    return () => {
      disposed = true
      cancelAnimationFrame(raf)
      observer.disconnect()
      io.disconnect()
      canvas.removeEventListener("webglcontextlost", onLost)
      canvas.removeEventListener("webglcontextrestored", onRestored)
      root.removeEventListener("pointerdown", onPointerDown)
      root.removeEventListener("pointermove", onPointerMove)
      root.removeEventListener("pointerup", onPointerUp)
      root.removeEventListener("pointercancel", onPointerCancel)
      root.removeEventListener("pointerleave", onPointerLeave)
      root.removeEventListener("keydown", onKeyDown)
      root.removeEventListener("keyup", onKeyUp)
      root.removeEventListener("blur", onBlur)
      if (!gl.isContextLost()) {
        buffers.forEach((b) => gl.deleteBuffer(b))
        vaos.forEach((v) => gl.deleteVertexArray(v))
        if (atlas) gl.deleteTexture(atlas)
        if (meshProgram) gl.deleteProgram(meshProgram)
      }
    }
    // The geometry depends only on the layout signature; everything else is
    // read live through `tuning`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layoutSig, generation])

  const list = keys && keys.length ? keys : DEFAULT_KEYS
  return (
    <div
      ref={rootRef}
      tabIndex={0}
      role="application"
      aria-label={ariaLabel}
      className={className}
      style={{ position: "relative", height, touchAction: "pan-y", outline: "none", cursor: "grab", userSelect: "none" }}
    >
      <canvas ref={canvasRef} style={{ display: "block", width: "100%", height: "100%" }} />
      {failed ? (
        <ul style={{ position: "absolute", inset: 0, display: "flex", flexWrap: "wrap", alignContent: "center", justifyContent: "center", gap: 8 }}>
          {list
            .filter((k) => k.label)
            .map((k, i) => (
              <li key={i} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid currentColor" }}>
                {k.label}
              </li>
            ))}
        </ul>
      ) : null}
      <span aria-live="polite" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        {announce}
      </span>
    </div>
  )
}
