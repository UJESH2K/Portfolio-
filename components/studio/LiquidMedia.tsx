"use client";

import { useEffect } from "react";

/**
 * The "liquid" image effect: while the page scrolls, photos bend like a
 * sheet, ripple, and split slightly into red/blue at the edges; hovering one
 * sends a ripple out from the pointer. Still pages are left untouched.
 *
 * Every photo marked `data-liquid` takes part, however many are on screen:
 *   - ONE shared WebGL context renders each photo in turn into an offscreen
 *     canvas, and the result is copied into a plain 2D canvas over that
 *     photo. Browsers allow only a handful of WebGL contexts per page, so a
 *     context per photo would leave most of a big photo wall flat.
 *   - Photos get a canvas as they near the viewport and give it back when
 *     they leave; textures are capped at 1024px and uploaded two a frame.
 *   - One rAF loop draws only while something is moving; at rest it draws
 *     nothing.
 *   - The <img> stays in place underneath and is only hidden once its
 *     canvas has drawn, so if WebGL is unavailable the photos just show.
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
  uv += (dir / (d + 1e-4)) * sin(d * 30.0 - uTime * 6.0) * 0.006 * uHover * smoothstep(0.6, 0.0, d);
  vec2 c = cover(uv);
  float split = 0.012 * v + 0.004 * uHover;
  float r = texture2D(uTex, c + vec2(0.0, split)).r;
  float g = texture2D(uTex, c).g;
  float b = texture2D(uTex, c - vec2(0.0, split)).b;
  gl_FragColor = vec4(r, g, b, 1.0);
}`;

type Slot = {
  target: HTMLElement;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  tex: WebGLTexture | null;
  imgW: number;
  imgH: number;
  ready: boolean;
  hover: number;
  hoverT: number;
  mouse: [number, number];
  dirty: boolean;
};

/** Longest side a texture is uploaded at; photos never show bigger. */
const MAX_TEX = 1024;

export default function LiquidMedia() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // ── The one shared renderer ─────────────────────────────────────────
    const glc = document.createElement("canvas");
    const gl = glc.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: true });
    if (!gl) return;
    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    const u: Record<string, WebGLUniformLocation | null> = {};
    for (const n of ["uTex", "uRes", "uImg", "uVel", "uTime", "uMouse", "uHover"]) u[n] = gl.getUniformLocation(prog, n);
    gl.uniform1i(u.uTex, 0);

    const slots = new Map<HTMLElement, Slot>();
    // Photos waiting for a texture. Uploads are spread over frames: arriving
    // at the wall would otherwise decode a dozen photos in one frame.
    const pending = new Set<Slot>();
    const UPLOADS_PER_FRAME = 2;
    let lost = false;
    const dpr = () => Math.min(window.devicePixelRatio || 1, 1.5);

    const sizeSlot = (s: Slot) => {
      const w = Math.max(2, Math.round(s.target.clientWidth * dpr()));
      const h = Math.max(2, Math.round(s.target.clientHeight * dpr()));
      if (s.canvas.width !== w || s.canvas.height !== h) {
        s.canvas.width = w;
        s.canvas.height = h;
        s.dirty = true;
      }
    };

    const upload = (s: Slot) => {
      const img = s.img;
      if (lost || !img.complete || !img.naturalWidth) return;
      // Downscale first: a full-size texture per photo would
      // cost hundreds of megabytes of GPU memory on a wall of 26 photos.
      const scale = Math.min(1, MAX_TEX / Math.max(img.naturalWidth, img.naturalHeight));
      const tw = Math.max(1, Math.round(img.naturalWidth * scale));
      const th = Math.max(1, Math.round(img.naturalHeight * scale));
      const tmp = document.createElement("canvas");
      tmp.width = tw;
      tmp.height = th;
      const tctx = tmp.getContext("2d");
      if (!tctx) return;
      tctx.drawImage(img, 0, 0, tw, th);
      if (!s.tex) s.tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, s.tex);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tmp);
      } catch {
        return;
      }
      s.imgW = img.naturalWidth;
      s.imgH = img.naturalHeight;
      s.ready = true;
      s.dirty = true;
    };

    const attach = (target: HTMLElement) => {
      if (slots.has(target) || lost) return;
      const img = target.querySelector("img");
      if (!img) return;
      const canvas = document.createElement("canvas");
      canvas.className = "liquid-canvas";
      canvas.setAttribute("aria-hidden", "true");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      img.after(canvas);
      const s: Slot = {
        target, img, canvas, ctx, tex: null, imgW: 1, imgH: 1,
        ready: false, hover: 0, hoverT: 0, mouse: [0.5, 0.5], dirty: true,
      };
      slots.set(target, s);
      ro.observe(target);
      sizeSlot(s);
      // decode() works off the main thread; drawing an undecoded photo into
      // the texture would decode it synchronously, mid-frame.
      const queue = () => slots.get(target) === s && pending.add(s);
      img.decode().then(queue, () => {
        if (img.complete && img.naturalWidth) queue();
        else img.addEventListener("load", queue, { once: true });
      });
    };

    const detach = (target: HTMLElement) => {
      const s = slots.get(target);
      if (!s) return;
      slots.delete(target);
      pending.delete(s);
      ro.unobserve(target);
      s.img.classList.remove("is-liquid");
      s.canvas.remove();
      if (s.tex && !lost) gl.deleteTexture(s.tex);
    };

    const ro = new ResizeObserver((entries) => {
      for (const e of entries) {
        const s = slots.get(e.target as HTMLElement);
        if (s) sizeSlot(s);
      }
    });

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
    let queued = 0;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    // If the GPU drops the context, step aside and show the plain photos.
    const onLost = (e: Event) => {
      e.preventDefault();
      lost = true;
      for (const t of Array.from(slots.keys())) detach(t);
    };
    glc.addEventListener("webglcontextlost", onLost);

    const onMove = (e: PointerEvent) => {
      for (const s of slots.values()) {
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
      if (lost) return;
      let budget = UPLOADS_PER_FRAME;
      for (const s of pending) {
        if (budget-- <= 0) break;
        pending.delete(s);
        upload(s);
      }
      const dt = Math.max(1, now - lastT);
      const dy = window.scrollY - lastY;
      lastY = window.scrollY;
      lastT = now;
      // Pixels per 16ms frame, normalised; positive when scrolling down.
      const target = Math.max(-1, Math.min(1, ((dy / dt) * 16) / 55));
      vel += (target - vel) * 0.12;
      if (Math.abs(vel) < 0.0008) vel = 0;
      const time = (now - t0) / 1000;

      for (const s of slots.values()) {
        if (!s.ready || !s.tex) continue;
        s.hover += (s.hoverT - s.hover) * 0.08;
        if (s.hover < 0.002) s.hover = 0;
        if (vel === 0 && s.hover === 0 && !s.dirty) continue;
        const w = s.canvas.width;
        const h = s.canvas.height;
        // Grow the shared drawing buffer when a bigger photo needs it.
        if (glc.width < w || glc.height < h) {
          glc.width = Math.max(glc.width, w);
          glc.height = Math.max(glc.height, h);
        }
        gl.viewport(0, 0, w, h);
        gl.uniform2f(u.uRes, w, h);
        gl.uniform2f(u.uImg, s.imgW, s.imgH);
        gl.uniform1f(u.uVel, vel);
        gl.uniform1f(u.uTime, time);
        gl.uniform2f(u.uMouse, s.mouse[0], s.mouse[1]);
        gl.uniform1f(u.uHover, s.hover);
        gl.bindTexture(gl.TEXTURE_2D, s.tex);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        // The viewport sits at the bottom-left of the drawing buffer.
        s.ctx.drawImage(glc, 0, glc.height - h, w, h, 0, 0, w, h);
        if (s.dirty) {
          s.dirty = false;
          s.img.classList.add("is-liquid");
        }
      }
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      cancelAnimationFrame(queued);
      io.disconnect();
      mo.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
      glc.removeEventListener("webglcontextlost", onLost);
      for (const t of Array.from(slots.keys())) detach(t);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return null;
}
