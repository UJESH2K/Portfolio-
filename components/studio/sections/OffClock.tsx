import type { CSSProperties } from "react";
import { OFF_CLOCK } from "@/lib/content";
import { Eyebrow } from "../primitives";

type Icon = (typeof OFF_CLOCK.items)[number]["icon"];

/** Hand-drawn-feeling line icons, one stroke weight, currentColor. */
function Glyph({ icon }: { icon: Icon }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (icon) {
    case "run":
      return (
        <svg viewBox="0 0 32 32" className="offclock__icon" aria-hidden="true">
          <circle cx="20" cy="5.5" r="2.6" {...common} />
          <path d="M11 13l5-3 5 3 3 5M16 10l-3 8 5 4-2 7M13 18l-6 1M21 13l-2 6" {...common} />
        </svg>
      );
    case "gym":
      return (
        <svg viewBox="0 0 32 32" className="offclock__icon" aria-hidden="true">
          <path d="M3 13v6M7 10v12M25 10v12M29 13v6M7 16h18" {...common} />
        </svg>
      );
    case "ball":
      return (
        <svg viewBox="0 0 32 32" className="offclock__icon" aria-hidden="true">
          <circle cx="16" cy="16" r="12" {...common} />
          <path d="M16 10l5 3.6-2 6h-6l-2-6zM16 10V4.5M21 13.6l5.5-1.8M19 19.6l3.3 4.7M13 19.6l-3.3 4.7M11 13.6l-5.5-1.8" {...common} />
        </svg>
      );
    case "dance":
      return (
        <svg viewBox="0 0 32 32" className="offclock__icon" aria-hidden="true">
          <circle cx="15" cy="5.5" r="2.6" {...common} />
          <path d="M15 9l1 9-5 10M16 18l6 4 1 6M15 11l-7-3M15 11l8-5" {...common} />
        </svg>
      );
    case "game":
      return (
        <svg viewBox="0 0 32 32" className="offclock__icon" aria-hidden="true">
          <path d="M9 11h14a6 6 0 0 1 5.6 8.2l-1.4 3.4a3 3 0 0 1-4.9 1L19 21h-6l-3.3 2.6a3 3 0 0 1-4.9-1l-1.4-3.4A6 6 0 0 1 9 11z" {...common} />
          <path d="M10 14v4M8 16h4M21 15.5h.01M24 17.5h.01" {...common} />
        </svg>
      );
  }
}

export default function OffClock() {
  return (
    <section id="offclock" className="offclock" data-cue="offclock" aria-labelledby="offclock-title">
      <div className="wrap">
        <div className="offclock__row">
          <div>
            <Eyebrow>{OFF_CLOCK.eyebrow}</Eyebrow>
            <h2 id="offclock-title" className="offclock__title rv" data-rv>
              {OFF_CLOCK.title}
            </h2>
          </div>
          <ul className="offclock__list">
            {OFF_CLOCK.items.map((it, i) => (
              <li key={it.label} className="offclock__item rv" data-rv style={{ "--d": `${i * 0.06}s` } as CSSProperties}>
                <Glyph icon={it.icon} />
                <b>{it.label}</b>
                <span>{it.detail}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
