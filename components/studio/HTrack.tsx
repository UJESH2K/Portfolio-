"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * A horizontal stretch in a vertical page: the section pins to the screen
 * and scrolling down slides its row of panels right to left, with a line
 * along the bottom filling as you go. Built like the build tunnel: a sticky frame
 * inside a section made exactly as tall as the row is wide, so it never
 * fights Lenis. Phones and reduced motion get the panels stacked normally.
 */
export default function HTrack({ children, label }: { children: ReactNode; label?: string }) {
  const outer = useRef<HTMLDivElement>(null);
  const rail = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const o = outer.current;
    const t = rail.current;
    if (!o || !t) return;
    const flat = window.matchMedia("(max-width: 809px), (prefers-reduced-motion: reduce)");
    let dist = 0;
    let raf = 0;

    const update = () => {
      raf = 0;
      if (!dist) return;
      const p = Math.min(1, Math.max(0, -o.getBoundingClientRect().top / dist));
      t.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
      o.style.setProperty("--hp", p.toFixed(4));
    };
    const measure = () => {
      if (flat.matches) {
        dist = 0;
        o.style.height = "";
        t.style.transform = "";
        return;
      }
      dist = Math.max(0, t.scrollWidth - window.innerWidth);
      o.style.height = `${window.innerHeight + dist}px`;
      update();
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure);
    flat.addEventListener("change", measure);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      flat.removeEventListener("change", measure);
    };
  }, []);

  return (
    <div ref={outer} className="htrack">
      <div className="htrack__pin">
        <div ref={rail} className="htrack__rail">
          {children}
        </div>
        <div className="htrack__bar" aria-hidden="true">
          {label ? <span className="htrack__label">{label}</span> : null}
          <i />
        </div>
      </div>
    </div>
  );
}
