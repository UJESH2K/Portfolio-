"use client";

import { useEffect, useRef, useState } from "react";
import { STATS, WINS, WINS_INTRO } from "@/lib/content";
import { Img, SplitWords } from "../primitives";
import { scrambleInto } from "../Scramble";

const DURATION = 5200;

/**
 * A stat that counts up from zero the first time it scrolls into view. The
 * real value is server-rendered, so it reads correctly without JavaScript.
 */
function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    const m = value.match(/^(\d+)(.*)$/);
    if (!el || !m || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = Number(m[1]);
    const suffix = m[2];
    el.textContent = `0${suffix}`;
    let raf = 0;
    const io = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / 1400);
          const eased = 1 - Math.pow(1 - p, 3);
          el.textContent = `${Math.round(target * eased)}${suffix}`;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      el.textContent = value;
    };
  }, [value]);
  return <b ref={ref}>{value}</b>;
}

/**
 * Wins: a full-bleed stage cycling through results, each name decoding in
 * huge type over its photo (or over an outlined numeral when there is no
 * photo to show). Auto-advances only while on screen; hover pauses; the
 * segmented bar doubles as navigation.
 */
export default function Wins() {
  const [idx, setIdx] = useState(0);
  const [running, setRunning] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const fills = useRef<Array<HTMLElement | null>>([]);
  const paused = useRef(false);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setRunning(e.isIntersecting), { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = WINS[idx].name;
      return;
    }
    return scrambleInto(el, WINS[idx].name, 650);
  }, [idx]);

  useEffect(() => {
    fills.current.forEach((f, i) => {
      if (!f) return;
      f.style.transition = "none";
      f.style.transform = `scaleX(${i < idx ? 1 : 0})`;
    });
    if (!running) return;
    let start = performance.now();
    let acc = 0;
    let raf = 0;
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      if (paused.current) {
        start = now - acc;
        return;
      }
      acc = now - start;
      const p = Math.min(1, acc / DURATION);
      const f = fills.current[idx];
      if (f) f.style.transform = `scaleX(${p})`;
      if (p >= 1) setIdx((i) => (i + 1) % WINS.length);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [idx, running]);

  const win = WINS[idx];

  return (
    <section id="wins" className="wins" data-cue="wins" aria-labelledby="wins-title">
      <div
        className="wins__stage"
        ref={stage}
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
      >
        {WINS.map((w, i) => (
          <div key={w.name} className={`wins__slide${i === idx ? " is-on" : ""}`} aria-hidden={i !== idx}>
            {w.image ? (
              <Img src={w.image} alt={w.imageAlt ?? w.name} sizes="100vw" />
            ) : (
              <div className="wins__type">
                <span>{String(i + 1).padStart(2, "0")}</span>
              </div>
            )}
          </div>
        ))}
        <div className="wins__veil" aria-hidden="true" />

        <div className="wins__dots" role="tablist" aria-label="Results">
          {WINS.map((w, i) => (
            <button
              key={w.name}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={`${w.name}: ${w.result}`}
              onClick={() => setIdx(i)}
            >
              <i ref={(n) => {
                  fills.current[i] = n;
                }} />
            </button>
          ))}
        </div>

        <p className="wins__name" aria-live="polite">
          <span className="wins__result">
            {win.result} · {win.detail}
          </span>
          <span ref={nameRef}>{win.name}</span>
        </p>
      </div>

      <div className="wrap wins__bar">
        <div>
          <p className="eyebrow">{WINS_INTRO.eyebrow}</p>
          <h2 id="wins-title" className="wins__title" data-rv>
            <SplitWords text={WINS_INTRO.title} />
          </h2>
        </div>
        <p className="wins__text">{WINS_INTRO.text}</p>
      </div>

      <div className="wrap">
        <dl className="wins__stats">
          {STATS.map((s) => (
            <div key={s.label} className="wins__stat rv" data-rv>
              <dt className="sr-only">{s.label}</dt>
              <dd style={{ margin: 0 }}>
                <CountUp value={s.value} />
                <span>{s.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
