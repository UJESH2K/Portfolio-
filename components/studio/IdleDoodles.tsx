"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRobot } from "@/lib/robot";

/**
 * Hand-drawn arrows that point at the landing page's controls when a visitor
 * sits still. Ported from the NEXR site's IdleHints/DoodleArrow, keeping its
 * rules: only a click dismisses them (looking toward an arrow must not make
 * it vanish), and they arrive one after another like someone talking you
 * through the page, never all at once.
 */

type Dir = "left-down" | "up-right" | "down-right" | "up-left";

const PATHS: Record<Dir, { line: string; head: string }> = {
  "left-down": { line: "M126 8c-13 27-37 45-70 47", head: "M56 55l15-7M56 55l13 9" },
  "up-right": { line: "M6 66c15-26 38-44 70-47", head: "M76 19l-15 5M76 19l-11 10" },
  "down-right": { line: "M6 8c15 26 38 44 70 47", head: "M76 55l-15-4M76 55l-10-11" },
  "up-left": { line: "M126 66c-15-26-38-44-70-47", head: "M56 19l15 5M56 19l11 10" },
};

function Doodle({ dir, width = 112 }: { dir: Dir; width?: number }) {
  const p = PATHS[dir];
  return (
    <svg viewBox="0 0 132 74" width={width} height={(width * 74) / 132} fill="none" className="doodle" aria-hidden="true">
      <path d={p.line} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="doodle-line" />
      <path d={p.head} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="doodle-head" />
    </svg>
  );
}

type Hint = { id: string; label: string; dir: Dir; x: number; y: number; labelFirst: boolean };

const IDLE_DELAY = 5000;

function measure(): Hint[] {
  const out: Hint[] = [];
  const w = window.innerWidth;
  const tingle = document.querySelector(".tingle-btn")?.getBoundingClientRect();
  if (tingle && tingle.width) {
    out.push({ id: "tingle", label: "press this. trust me.", dir: "up-left", x: tingle.right + 6, y: tingle.bottom - 6, labelFirst: false });
  }
  const chips = document.querySelector(".balloon--hero.is-on .balloon__chips")?.getBoundingClientRect();
  if (chips && chips.width && w >= 810) {
    out.push({ id: "chips", label: "pick a chapter", dir: "down-right", x: chips.left - 150, y: chips.top - 64, labelFirst: true });
  }
  const next = document.querySelector(".hero__next")?.getBoundingClientRect();
  if (next && next.width) {
    out.push({ id: "scroll", label: "or just scroll", dir: "up-left", x: next.right + 8, y: next.top - 4, labelFirst: false });
  }
  return out;
}

export default function IdleDoodles() {
  const introDone = useRobot((s) => s.introDone);
  const mode = useRobot((s) => s.mode);
  const tingle = useRobot((s) => s.tingle);
  const [hints, setHints] = useState<Hint[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!introDone || mode !== "hero" || dismissed) {
      setHints([]);
      return;
    }
    if (!window.matchMedia("(hover: hover)").matches) return;
    const timer = window.setTimeout(() => setHints(measure()), IDLE_DELAY + 4000);
    const dismiss = () => {
      clearTimeout(timer);
      setDismissed(true);
    };
    const onResize = () => setHints((h) => (h.length ? measure() : h));
    window.addEventListener("click", dismiss);
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("click", dismiss);
      window.removeEventListener("resize", onResize);
    };
  }, [introDone, mode, dismissed]);

  if (!hints.length) return null;

  return (
    <div className={`doodles${tingle ? " is-tingle" : ""}`} aria-hidden="true">
      {hints.map((h, i) => (
        <div
          key={h.id}
          className="doodles__hint"
          style={{ "--d": `${i * 0.45}s`, transform: `translate3d(${h.x}px, ${h.y}px, 0)` } as CSSProperties}
        >
          <div className="doodles__float">
            {h.labelFirst ? <span className="doodles__label">{h.label}</span> : null}
            <Doodle dir={h.dir} />
            {!h.labelFirst ? <span className="doodles__label">{h.label}</span> : null}
          </div>
        </div>
      ))}
    </div>
  );
}
