"use client";

import { useEffect, useRef } from "react";
import { STATEMENT } from "@/lib/content";

/**
 * One sentence that inks itself in as you scroll: each character switches
 * from faint to solid as the paragraph travels from the bottom of the screen
 * to the upper third. Driven by a scroll listener writing classes directly.
 */
export default function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.querySelectorAll(".ch").forEach((c) => c.classList.add("on"));
      return;
    }
    const chars = Array.from(el.querySelectorAll<HTMLElement>(".ch"));
    let raf = 0;
    let lastOn = -1;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const start = vh * 0.9;
      const end = vh * 0.3;
      const p = Math.min(1, Math.max(0, (start - r.top) / (start - end + r.height * 0.6)));
      const on = Math.round(p * chars.length);
      if (on === lastOn) return;
      lastOn = on;
      chars.forEach((c, i) => c.classList.toggle("on", i < on));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const words = STATEMENT.split(" ");
  return (
    <section className="statement" aria-label="In one sentence">
      <div className="wrap">
        <p className="scrub" ref={ref} aria-label={STATEMENT}>
          {words.map((w, wi) => (
            <span key={wi} aria-hidden="true" style={{ display: "inline-block", whiteSpace: "nowrap" }}>
              {Array.from(w).map((c, ci) => (
                <span key={ci} className="ch">
                  {c}
                </span>
              ))}
              {wi < words.length - 1 ? <span className="ch">&nbsp;</span> : null}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
