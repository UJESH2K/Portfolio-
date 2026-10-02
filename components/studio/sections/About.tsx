"use client";

import { useEffect, useRef, useState } from "react";
import { ABOUT, PROFILE } from "@/lib/content";
import { Cta, SplitWords } from "../primitives";
import Scramble from "../Scramble";

/**
 * The short version: a two-line heading, then a reel of screen recordings
 * beside a few paragraphs. Videos only load and play while on screen, and
 * advance by themselves; the tabs jump straight to one.
 */
export default function About() {
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const vids = useRef<Array<HTMLVideoElement | null>>([]);
  const bars = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    vids.current.forEach((v, i) => {
      if (!v) return;
      if (inView && i === idx) {
        if (v.preload !== "auto") v.preload = "auto";
        v.currentTime = 0;
        void v.play().catch(() => {});
      } else v.pause();
    });
  }, [idx, inView]);

  // Progress bar + auto-advance, driven by the playing video's own clock.
  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const v = vids.current[idx];
      const bar = bars.current[idx];
      if (!v || !bar || !v.duration) return;
      const limit = Math.min(v.duration, 12);
      const p = Math.min(1, v.currentTime / limit);
      bar.style.transform = `scaleX(${p})`;
      if (p >= 1) setIdx((i) => (i + 1) % ABOUT.reel.length);
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [idx, inView]);

  return (
    <section id="about" className="about" data-cue="about" aria-labelledby="about-title">
      <div className="wrap">
        <h2 id="about-title" className="about__h2" data-rv>
          {ABOUT.title.map((l, i) => (
            <span key={l} className="about__line">
              <SplitWords text={l} delay={i * 0.15} />
            </span>
          ))}
        </h2>

        <div className="about__stage">
          <div className="about__aside">
            <p className="about__label">{ABOUT.label}</p>
            <div className="about__text">
              {ABOUT.paragraphs.map((p) => (
                <Scramble key={p} as="p" text={p} duration={1400} />
              ))}
            </div>
            <div className="about__edu rv" data-rv>
              <strong>{ABOUT.education.degree}</strong>
              {ABOUT.education.school} · {ABOUT.education.period}
            </div>
            <div className="about__row">
              <Cta href={PROFILE.resumeUrl} width={230} download>
                Download résumé
              </Cta>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="about__portrait" src={`${ABOUT.portrait}-800.webp`} alt={ABOUT.portraitAlt} loading="lazy" />
            </div>
          </div>

          <div className="about__box" ref={box}>
            {ABOUT.reel.map((r, i) => (
              <video
                key={r.src}
                ref={(n) => {
                  vids.current[i] = n;
                }}
                className={i === idx ? "is-on" : ""}
                src={r.src}
                muted
                playsInline
                loop={false}
                preload={i === 0 ? "metadata" : "none"}
                aria-label={r.label}
              />
            ))}
            <div className="about__reelnav">
              {ABOUT.reel.map((r, i) => (
                <button key={r.src} type="button" className={i === idx ? "is-on" : ""} onClick={() => setIdx(i)}>
                  {r.label}
                  <i ref={(n) => {
                  bars.current[i] = n;
                }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
