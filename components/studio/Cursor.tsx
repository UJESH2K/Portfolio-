"use client";

import { useEffect, useRef } from "react";

/**
 * The site's cursor: a small ink dot that sits exactly on the pointer and a
 * ring that follows it softly. Over anything clickable the ring grows and
 * fills with ember; over things you drag (the keycap ball, sliders) it says
 * "Drag"; over text fields the system caret comes back. Mouse and pen only:
 * touch screens never see it.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!fine.matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const d = dot.current;
    const r = ring.current;
    if (!d || !r) return;
    document.documentElement.classList.add("has-cursor");

    let x = -100,
      y = -100,
      rx = -100,
      ry = -100,
      raf = 0,
      shown = false;
    const tick = () => {
      rx += (x - rx) * 0.2;
      ry += (y - ry) * 0.2;
      r.style.transform = `translate3d(${rx.toFixed(1)}px, ${ry.toFixed(1)}px, 0)`;
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(tick) : 0;
    };
    const move = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      x = e.clientX;
      y = e.clientY;
      d.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      if (!shown) {
        shown = true;
        rx = x;
        ry = y;
        document.documentElement.classList.add("cursor-on");
      }
      if (!raf) raf = requestAnimationFrame(tick);
      const t = e.target as Element | null;
      const field = t?.closest("input, textarea, select, [contenteditable='true']");
      const drag = !field && t?.closest("[role='application'], canvas, .is-drag");
      const link = !field && !drag && t?.closest("a, button, summary, label, [role='button'], .faq__q");
      r.dataset.mode = field ? "text" : drag ? "drag" : link ? "link" : "";
    };
    const leave = () => {
      shown = false;
      document.documentElement.classList.remove("cursor-on");
    };
    const down = () => r.classList.add("is-down");
    const up = () => r.classList.remove("is-down");

    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerleave", leave);
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-cursor", "cursor-on");
      window.removeEventListener("pointermove", move);
      document.removeEventListener("pointerleave", leave);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cur-ring" aria-hidden="true">
        <span>Drag</span>
      </div>
      <div ref={dot} className="cur-dot" aria-hidden="true" />
    </>
  );
}
