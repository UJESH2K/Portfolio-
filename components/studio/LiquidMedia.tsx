"use client";

import { useEffect } from "react";

/**
 * The "liquid" image effect: while the page scrolls, photos bend like a
 * sheet, ripple, and split slightly into red/blue at the edges; hovering one
 * sends a ripple out from the pointer. Still pages are left untouched.
 *
 * How it stays cheap:
 *   - Only elements marked `data-liquid` (with an <img> inside) take part.
 *   - A small pool of WebGL canvases is shared: a canvas is moved into a
 *     figure as it nears the viewport and taken back when it leaves, so
 *     there are never more than POOL contexts however many images exist.
 *   - One rAF loop draws only while something is moving; at rest it stops.
 *   - The <img> stays in place underneath and is only hidden once its
 *     canvas has drawn, so a failed context simply shows the photo.
 */

const VERT = `
attribute vec2 p;
varying vec2 vUv;
void main() {
  vUv = p * 0.5 + 0.5;
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uRes;
uniform vec2 uImg;
uniform float uVel;
uniform float uTime;
uniform vec2 uMouse;
uniform float uHover;

vec2 cover(vec2 uv) {
  float rc = uRes.x / uRes.y;
  float ri = uImg.x / uImg.y;
  vec2 s = rc > ri ? vec2(1.0, ri / rc) : vec2(rc / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

void main() {
  vec2 uv = vUv;
  float v = uVel;
  float a = abs(v);
  // Edges lag the centre, like a sheet dragged through water.
  uv.y += (uv.x - 0.5) * (uv.x - 0.5) * v * 0.36;
  // A ripple travelling down the image while it moves.
  uv.x += sin(uv.y * 12.0 + uTime * 5.0) * 0.010 * a + sin(uv.y * 4.0 - uTime * 2.3) * 0.006 * a;
  // Hover: rings spreading out from the pointer.
  vec2 dir = vUv - uMouse;
  float d = length(dir);
  uv += (dir / (d + 1e-4)) * sin(d * 30.0 - uTime * 6.0) * 0.005 * uHover * smoothstep(0.55, 0.0, d);
  vec2 c = cover(uv);
  float split = 0.012 * v;
  float r = texture2D(uTex, c + vec2(0.0, split)).r;
  float g = texture2D(uTex, c).g;
  float b = texture2D(uTex, c - vec2(0.0, split)).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}`;

type Slot = {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  tex: WebGLTexture;
  u: Record<string, WebGLUniformLocation | null>;
  target: HTMLElement | null;
  img: HTMLImageElement | null;
  imgW: number;
  imgH: number;
  ready: boolean;
  hover: number;
  hoverT: number;
  mouse: [number, number];
  dirty: boolean;
};

function makeSlot(): Slot | null {
  const canvas = document.createElement("canvas");
  canvas.className = "liquid-canvas";
  canvas.setAttribute("aria-hidden", "true");
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false });
  if (!gl) return null;
  const sh = (type: number, src: string) => {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram()!;
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  const tex = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  const u: Slot["u"] = {};
  for (const n of ["uTex", "uRes", "uImg", "uVel", "uTime", "uMouse", "uHover"]) u[n] = gl.getUniformLocation(prog, n);
  gl.uniform1i(u.uTex, 0);
  return {
    canvas, gl, tex, u, target: null, img: null, imgW: 1, imgH: 1,
    ready: false, hover: 0, hoverT: 0, mouse: [0.5, 0.5], dirty: true,
  };
}

export default function LiquidMedia() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const POOL = window.innerWidth < 810 ? 3 : 5;
    const slots: Slot[] = [];
    const bound = new Map<HTMLElement, Slot>();
    const waiting = new Set<HTMLElement>();
    let failed = false;
    const ro = new ResizeObserver(() => slots.forEach(sizeSlot));

    const sizeSlot = (s: Slot) => {
      if (!s.target) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.max(2, Math.round(s.target.clientWidth * dpr));
      const h = Math.max(2, Math.round(s.target.clientHeight * dpr));
      if (s.canvas.width !== w || s.canvas.height !== h) {
        s.canvas.width = w;
        s.canvas.height = h;
        s.gl.viewport(0, 0, w, h);
        s.dirty = true;
      }
    };

    const upload = (s: Slot) => {
      const img = s.img;
      if (!img || !img.complete || !img.naturalWidth) return;
      const { gl } = s;
      gl.bindTexture(gl.TEXTURE_2D, s.tex);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      } catch {
        return;
      }
      s.imgW = img.naturalWidth;
      s.imgH = img.naturalHeight;
      s.ready = true;
      s.dirty = true;
    };

    const attach = (target: HTMLElement) => {
      if (bound.has(target) || failed) return;
      const img = target.querySelector("img");
      if (!img) return;
      let slot = slots.find((s) => !s.target);
      if (!slot && slots.length < POOL) {
        const made = makeSlot();
        if (!made) {
          failed = true;
          return;
        }
        slots.push(made);
        slot = made;
      }
      if (!slot) {
        waiting.add(target);
        return;
      }
      slot.target = target;
      slot.img = img;
      slot.ready = false;
      img.after(slot.canvas);
      bound.set(target, slot);
      ro.observe(target);
      sizeSlot(slot);
      if (img.complete && img.naturalWidth) upload(slot);
      else img.addEventListener("load", () => slot!.target === target && upload(slot!), { once: true });
    };

    const detach = (target: HTMLElement) => {
      waiting.delete(target);
      const slot = bound.get(target);
      if (!slot) return;
      bound.delete(target);
      ro.unobserve(target);
      slot.img?.classList.remove("is-liquid");
      slot.canvas.remove();
      slot.target = null;
      slot.img = null;
      slot.ready = false;
      slot.hover = 0;
      const next = waiting.values().next().value as HTMLElement | undefined;
      if (next) {
        waiting.delete(next);
        attach(next);
      }
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const t = e.target as HTMLElement;
          if (e.isIntersecting) attach(t);
          else detach(t);
        }
      },
      { rootMargin: "25% 0px 25% 0px" }
    );
    const seen = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll<HTMLElement>("[data-liquid]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    const onResize = () => slots.forEach(sizeSlot);
    window.addEventListener("resize", onResize);

    const onMove = (e: PointerEvent) => {
      for (const s of slots) {
        if (!s.target) continue;
        const r = s.target.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        s.hoverT = inside ? 1 : 0;
        if (inside) s.mouse = [(e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height];
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let vel = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    const t0 = lastT;
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.max(1, now - lastT);
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      lastT = now;
      // Pixels per 16ms frame, normalised; positive when scrolling down.
      const target = Math.max(-1, Math.min(1, ((dy / dt) * 16) / 55));
      vel += (target - vel) * 0.12;
      if (Math.abs(vel) < 0.0008) vel = 0;
      const time = (now - t0) / 1000;
      for (const s of slots) {
        if (!s.target || !s.ready) continue;
        s.hover += (s.hoverT - s.hover) * 0.08;
        if (s.hover < 0.002) s.hover = 0;
        const moving = vel !== 0 || s.hover > 0;
        if (!moving && !s.dirty) continue;
        const { gl, u } = s;
        gl.uniform2f(u.uRes, s.canvas.width, s.canvas.height);
        gl.uniform2f(u.uImg, s.imgW, s.imgH);
        gl.uniform1f(u.uVel, vel);
        gl.uniform1f(u.uTime, time);
        gl.uniform2f(u.uMouse, s.mouse[0], s.mouse[1]);
        gl.uniform1f(u.uHover, s.hover);
        gl.bindTexture(gl.TEXTURE_2D, s.tex);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        if (s.dirty) {
          s.dirty = false;
          s.img?.classList.add("is-liquid");
        }
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onMove);
      for (const s of slots) {
        s.img?.classList.remove("is-liquid");
        s.canvas.remove();
        s.gl.getExtension("WEBGL_lose_context")?.loseContext();
      }
    };
  }, []);

  return null;
}
