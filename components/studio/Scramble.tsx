"use client";

import { useEffect, useRef, type ElementType } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/**
 * Decodes a line of text out of random glyphs, left to right.
 *
 * The real text is server-rendered, so crawlers and screen readers always get
 * it; the scramble only runs on the client, and only once, when the element
 * first comes into view (or immediately with `auto`).
 */
export function scrambleInto(el: HTMLElement, text: string, duration = 900): () => void {
  let raf = 0;
  const start = performance.now();
  const len = text.length;
  const tick = (now: number) => {
    const p = Math.min(1, (now - start) / duration);
    const settled = Math.floor(p * len);
    let out = text.slice(0, settled);
    for (let i = settled; i < len; i++) {
      const ch = text[i];
      out += ch === " " ? " " : i < settled + 6 ? GLYPHS[(Math.random() * GLYPHS.length) | 0] : "";
    }
    el.textContent = out;
    if (p < 1) raf = requestAnimationFrame(tick);
    else el.textContent = text;
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    el.textContent = text;
  };
}

export default function Scramble({
  text,
  as: Tag = "span",
  className,
  duration = 900,
  delay = 0,
  auto = false,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  duration?: number;
  delay?: number;
  /** Start immediately instead of waiting to be scrolled into view. */
  auto?: boolean;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let stop: (() => void) | null = null;
    let timer = 0;
    const run = () => {
      el.style.visibility = "hidden";
      timer = window.setTimeout(() => {
        el.style.visibility = "";
        stop = scrambleInto(el, text, duration);
      }, delay);
    };

    if (auto) {
      run();
      return () => {
        clearTimeout(timer);
        stop?.();
      };
    }

    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        run();
      },
      { rootMargin: "0px 0px -10% 0px" }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      clearTimeout(timer);
      stop?.();
    };
  }, [text, duration, delay, auto]);

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}
