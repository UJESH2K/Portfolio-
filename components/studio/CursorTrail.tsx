"use client";

import { useEffect, useRef } from "react";
import { robotHover } from "@/lib/robot";

/**
 * A short chain of dots that follows the pointer across the landing page,
 * each link springing after the one in front of it, in ink and ember on
 * the white landing page. Mouse only; touch devices never see it. It fades
 * out over the robot, where the particle effect takes over.
 */
const LINKS = 22;

export default function CursorTrail() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pts = Array.from({ length: LINKS }, () => ({ x: -100, y: -100 }));
    const target = { x: -100, y: -100, active: false };
    let lastMove = 0;
    let overRobot = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = e.clientX - r.left;
      target.y = e.clientY - r.top;
      if (!target.active) pts.forEach((p) => ((p.x = target.x), (p.y = target.y)));
      target.active = true;
      lastMove = performance.now();
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let onScreen = true;
    const io = new IntersectionObserver(([e]) => (onScreen = e.isIntersecting));
    io.observe(canvas);

    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (!onScreen) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (!target.active) return;
      overRobot += ((robotHover.on ? 1 : 0) - overRobot) * 0.15;
      const fade = Math.max(0, 1 - Math.max(0, now - lastMove - 900) / 700) * (1 - overRobot);
      if (fade <= 0) return;
      let px = target.x;
      let py = target.y;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        const k = i === 0 ? 0.42 : 0.38;
        p.x += (px - p.x) * k;
        p.y += (py - p.y) * k;
        px = p.x;
        py = p.y;
      }
      for (let i = pts.length - 1; i >= 0; i--) {
        const t = 1 - i / pts.length;
        const r = 1.2 + t * 4.2;
        ctx.globalAlpha = t * 0.85 * fade;
        ctx.fillStyle = i % 4 === 0 ? "#ff5a1f" : "#0d0d0d";
        ctx.beginPath();
        ctx.arc(pts[i].x, pts[i].y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} className="hero__trail" aria-hidden="true" />;
}
