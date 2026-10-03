"use client";

import { useEffect } from "react";

/**
 * Small global touches that make the page feel alive:
 *   - magnetic buttons: CTAs, arrows and the burger lean toward the pointer;
 *   - the name marquee tilts with scroll speed and settles when you stop.
 * Mouse-only where it matters, and off entirely for reduced motion.
 */
const MAGNETIC = ".cta, .hero__next, .arrow, .chrome--burger";

export default function Delight() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    let active: HTMLElement | null = null;
    const onMove = (e: PointerEvent) => {
      const el = (e.target as HTMLElement | null)?.closest?.(MAGNETIC) as HTMLElement | null;
      if (active && active !== el) {
        active.style.transform = "";
        active = null;
      }
      if (!el) return;
      active = el;
      const r = el.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / Math.max(r.width, 1);
      const dy = (e.clientY - (r.top + r.height / 2)) / Math.max(r.height, 1);
      el.style.transform = `translate3d(${(dx * 10).toFixed(1)}px, ${(dy * 8).toFixed(1)}px, 0)`;
    };
    if (fine) window.addEventListener("pointermove", onMove, { passive: true });

    // Marquee tilt from scroll velocity.
    const marquee = document.querySelector<HTMLElement>(".marquee");
    let lastY = window.scrollY;
    let skew = 0;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const y = window.scrollY;
      const v = y - lastY;
      lastY = y;
      skew += (Math.max(-8, Math.min(8, -v * 0.25)) - skew) * 0.12;
      if (Math.abs(skew) < 0.01) skew = 0;
      if (marquee) marquee.style.setProperty("--skew", `${skew.toFixed(2)}deg`);
    };
    if (marquee) loop();

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      if (active) active.style.transform = "";
    };
  }, []);

  return null;
}
