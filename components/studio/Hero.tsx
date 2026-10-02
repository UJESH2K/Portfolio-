"use client";

import { useEffect, useRef, useState } from "react";
import { HERO, LANDING, type BalloonBeat } from "@/lib/content";
import { goTo, useRobot } from "@/lib/robot";
import HeroSmoke from "./HeroSmoke";
import CursorTrail from "./CursorTrail";
import { sfx } from "./robot/sfx";

/**
 * The comic-book landing page.
 *
 * Calm state: paper, halftone and an inked panel the robot stands in (and
 * breaks out of — the canvas sits above the panel border). The robot opens
 * with three balloon beats; the last one holds chapter chips.
 *
 * "Tingle!" flips the page: panels shake, the paper goes to red-black smoke,
 * alert lines burst around the robot's head and it has something urgent to
 * say. "Calm down" puts it all back.
 */
export default function Hero() {
  const introDone = useRobot((s) => s.introDone);
  const tingle = useRobot((s) => s.tingle);
  const setTingle = useRobot((s) => s.setTingle);
  const [typed, setTyped] = useState("");
  const [shake, setShake] = useState(0);
  // Balloon beats are cancelled and replaced as the visitor plays; the
  // headline typing is not, so they keep separate timer lists.
  const timers = useRef<number[]>([]);
  const typing = useRef<number[]>([]);

  const runBeats = (beats: BalloonBeat[], gap = 2600) => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    beats.forEach((b, i) => {
      timers.current.push(
        window.setTimeout(() => {
          const st = useRobot.getState();
          if (st.mode !== "hero") return;
          st.say(b.text, { mood: b.mood, chips: b.chips, kind: b.chips ? "menu" : "line" });
        }, i * gap)
      );
    });
  };

  // Type the headline and start the robot's intro once the curtain lifts.
  useEffect(() => {
    if (!introDone) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) setTyped(HERO.hello);
    else {
      let i = 0;
      const id = window.setInterval(() => {
        i++;
        setTyped(HERO.hello.slice(0, i));
        if (i >= HERO.hello.length) clearInterval(id);
      }, 55);
      typing.current.push(id as unknown as number);
    }
    typing.current.push(window.setTimeout(() => runBeats(LANDING.intro), 700));
    const t = typing.current;
    return () => {
      t.forEach((x) => clearTimeout(x));
      timers.current.forEach((x) => clearTimeout(x));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introDone]);

  // Coming back up to the hero re-opens the chapter menu.
  useEffect(() => {
    let last = useRobot.getState().mode;
    return useRobot.subscribe((s) => {
      if (s.mode === last) return;
      last = s.mode;
      if (s.mode === "hero" && s.introDone) {
        const beats = s.tingle ? LANDING.tingled : LANDING.intro;
        const final = beats[beats.length - 1];
        timers.current.push(
          window.setTimeout(() => {
            if (useRobot.getState().mode === "hero")
              useRobot.getState().say(final.text, { mood: final.mood, chips: final.chips, kind: "menu" });
          }, 1400)
        );
      }
    });
  }, []);

  const toggleTingle = () => {
    const next = !tingle;
    setTingle(next);
    if (next) {
      sfx.tingle();
      setShake((n) => n + 1);
      runBeats(LANDING.tingled, 1900);
    } else {
      const last = LANDING.intro[LANDING.intro.length - 1];
      useRobot.getState().say(last.text, { mood: last.mood, chips: last.chips, kind: "menu" });
    }
  };

  return (
    <section
      id="top"
      className={`hero comic${tingle ? " is-tingle" : ""}`}
      data-cue="hero"
      aria-label="Introduction"
    >
      <HeroSmoke active={tingle} />
      <div className="comic__halftone" aria-hidden="true" />
      <CursorTrail />

      <div className={`comic__page${shake ? " is-shaking" : ""}`} key={shake} aria-hidden="true">
        <div className="comic__stage">
          <span className="comic__burst" />
        </div>
        <div className="comic__strip" />
      </div>

      <div className="wrap hero__content">
        <p className="comic__caption">{tingle ? LANDING.tingleCaption : LANDING.caption}</p>
        <h1 className="hero__title">
          <span className="sr-only">{HERO.hello}</span>
          <span aria-hidden="true">
            {typed || " "}
            <span className="caret" />
          </span>
        </h1>
        <p className={`hero__lead${typed.length === HERO.hello.length ? " is-in" : ""}`}>{HERO.lead}</p>
        <div className={`hero__actions${typed.length === HERO.hello.length ? " is-in" : ""}`}>
          <button type="button" className={`tingle-btn${tingle ? " is-on" : ""}`} onClick={toggleTingle} aria-pressed={tingle}>
            <svg className="tingle-btn__burst" viewBox="0 0 200 120" aria-hidden="true">
              <path d="M100 4 L116 30 L148 10 L146 42 L192 36 L164 60 L196 84 L150 82 L156 114 L120 94 L100 118 L82 92 L46 112 L52 80 L6 86 L36 60 L4 36 L50 40 L46 8 L82 30 Z" />
            </svg>
            <span className="tingle-btn__label">{tingle ? LANDING.calm : LANDING.tingle}</span>
          </button>
          <a
            className="hero__next"
            href="#story"
            onClick={(e) => {
              e.preventDefault();
              goTo("#story");
            }}
          >
            {LANDING.scrollHint}
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M6 1v10M1.5 6.5L6 11l4.5-4.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
