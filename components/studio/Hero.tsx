"use client";

import { useEffect, useRef, useState } from "react";
import { HERO, LANDING, type BalloonBeat } from "@/lib/content";
import { goTo, useRobot } from "@/lib/robot";
import HeroSmoke from "./HeroSmoke";
import CursorTrail from "./CursorTrail";

/**
 * The landing page: red-black smoke, the headline typing out on the left,
 * and the robot (drawn by the fixed RobotLayer) standing on the right. The
 * robot opens with three speech-balloon beats; the last holds chapter chips.
 */
export default function Hero() {
  const introDone = useRobot((s) => s.introDone);
  const [typed, setTyped] = useState("");
  // Balloon beats are cancelled and replaced as the visitor moves around;
  // the headline typing is not, so they keep separate timer lists.
  const timers = useRef<number[]>([]);
  const typing = useRef<number[]>([]);

  const runBeats = (beats: BalloonBeat[], gap = 2900) => {
    timers.current.forEach(clearTimeout);
    timers.current = beats.map((b, i) =>
      window.setTimeout(() => {
        const st = useRobot.getState();
        if (st.mode !== "hero") return;
        st.say(b.text, { mood: b.mood, chips: b.chips, kind: b.chips ? "menu" : "line" });
      }, i * gap)
    );
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
    typing.current.push(window.setTimeout(() => runBeats(LANDING.intro), 900));
    const t = typing.current;
    return () => {
      t.forEach((x) => clearTimeout(x));
      timers.current.forEach((x) => clearTimeout(x));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introDone]);

  // Leaving the landing cancels queued beats; coming back re-opens the menu.
  useEffect(() => {
    let last = useRobot.getState().mode;
    return useRobot.subscribe((s) => {
      if (s.mode === last) return;
      last = s.mode;
      if (s.mode !== "hero") {
        timers.current.forEach(clearTimeout);
        timers.current = [];
        return;
      }
      if (!s.introDone) return;
      const final = LANDING.intro[LANDING.intro.length - 1];
      timers.current.push(
        window.setTimeout(() => {
          if (useRobot.getState().mode === "hero")
            useRobot.getState().say(final.text, { mood: final.mood, chips: final.chips, kind: "menu" });
        }, 1500)
      );
    });
  }, []);

  const done = typed.length === HERO.hello.length;

  return (
    <section id="top" className="hero" data-cue="hero" aria-label="Introduction">
      <HeroSmoke active />
      <CursorTrail />

      <div className="wrap hero__content">
        <p className="hero__eyebrow">{LANDING.eyebrow}</p>
        <h1 className="hero__title">
          <span className="sr-only">{HERO.hello}</span>
          <span aria-hidden="true">
            {typed || " "}
            <span className="caret" />
          </span>
        </h1>
        <p className={`hero__lead${done ? " is-in" : ""}`}>{HERO.lead}</p>
        <div className={`hero__actions${done ? " is-in" : ""}`}>
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
