"use client";

/**
 * A tiny confetti burst for the easter eggs. Creates a fixed full-screen
 * canvas on demand and removes it when the last piece has fallen, so it
 * costs nothing until something calls `burst`.
 */

const COLORS = ["#ff5a1f", "#3fe3cb", "#ffd23f", "#0d0d0d", "#ff7a3d"];

type Bit = { x: number; y: number; vx: number; vy: number; r: number; vr: number; s: number; c: string; life: number };

let canvas: HTMLCanvasElement | null = null;
let bits: Bit[] = [];
let raf = 0;

function frame() {
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  bits = bits.filter((b) => b.life > 0 && b.y < window.innerHeight + 40);
  for (const b of bits) {
    b.vy += 0.32;
    b.vx *= 0.99;
    b.x += b.vx;
    b.y += b.vy;
    b.r += b.vr;
    b.life -= 1;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.r);
    ctx.globalAlpha = Math.min(1, b.life / 30);
    ctx.fillStyle = b.c;
    ctx.fillRect(-b.s / 2, -b.s / 4, b.s, b.s / 2);
    ctx.restore();
  }
  if (bits.length) raf = requestAnimationFrame(frame);
  else {
    canvas.remove();
    canvas = null;
  }
}

export function burst(x: number, y: number, count = 70) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.setAttribute("aria-hidden", "true");
    Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "80" });
    document.body.appendChild(canvas);
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  for (let i = 0; i < count; i++) {
    const a = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
    const v = 7 + Math.random() * 9;
    bits.push({
      x,
      y,
      vx: Math.cos(a) * v,
      vy: Math.sin(a) * v,
      r: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      s: 7 + Math.random() * 7,
      c: COLORS[i % COLORS.length],
      life: 110 + Math.random() * 60,
    });
  }
  cancelAnimationFrame(raf);
  raf = requestAnimationFrame(frame);
}
