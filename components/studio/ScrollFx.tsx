"use client";

import { useEffect } from "react";

/**
 * Scroll progress for type effects. Every `[data-sfx]` element on screen gets
 * `--p`: 0 as it enters at the bottom of the screen, 1 as it leaves at the
 * top. CSS does the rest (highlighter bands drifting, big background words
 * sliding sideways). One observer, one rAF per scroll, nothing off screen.
 */
export default function ScrollFx() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const live = new Set<HTMLElement>();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) live.add(e.target as HTMLElement);
        else live.delete(e.target as HTMLElement);
      }
      onScroll();
    });
    const seen = new WeakSet<Element>();
    const scan = () =>
      document.querySelectorAll("[data-sfx]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        io.observe(el);
      });

    let raf = 0;
    const update = () => {
      raf = 0;
      const vh = window.innerHeight;
      live.forEach((el) => {
        const r = el.getBoundingClientRect();
        const p = Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height)));
        el.style.setProperty("--p", p.toFixed(3));
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    scan();
    const mo = new MutationObserver(() => requestAnimationFrame(scan));
    mo.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  return null;
}
