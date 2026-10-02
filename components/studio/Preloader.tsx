"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { PRELOADER } from "@/lib/content";
import { useRobot } from "@/lib/robot";
import { scrambleInto } from "./Scramble";

/**
 * Black curtain with two blocks of status lines decoding in turn, a progress
 * rule tied to the robot model's download, then a wipe upwards.
 *
 * It never waits on the network for long: after MAX_WAIT the curtain lifts
 * whatever the model is doing, and the hero simply starts without it.
 */
const MIN_SHOW = 2600;
const MAX_WAIT = 6500;

export default function Preloader() {
  const progress = useRobot((s) => s.progress);
  const ready = useRobot((s) => s.ready);
  const setIntroDone = useRobot((s) => s.setIntroDone);
  const [phase, setPhase] = useState<"intro" | "boot" | "done">("intro");
  const introRef = useRef<HTMLDivElement>(null);
  const bootRef = useRef<HTMLDivElement>(null);
  const t0 = useRef(0);

  // Lock scrolling while the curtain is down.
  useEffect(() => {
    t0.current = performance.now();
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  // Decode the intro lines, then swap to the boot block.
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stops: Array<() => void> = [];
    const timers: number[] = [];
    const run = (root: HTMLDivElement | null, lines: string[], gap: number) => {
      if (!root) return;
      root.querySelectorAll("p").forEach((p, i) => {
        p.textContent = "";
        timers.push(
          window.setTimeout(() => {
            if (reduced) p.textContent = lines[i];
            else stops.push(scrambleInto(p as HTMLElement, lines[i], 520));
          }, i * gap)
        );
      });
    };
    run(introRef.current, PRELOADER.intro, 260);
    timers.push(window.setTimeout(() => setPhase("boot"), 1500));
    return () => {
      timers.forEach(clearTimeout);
      stops.forEach((s) => s());
    };
  }, []);

  useEffect(() => {
    if (phase !== "boot") return;
    const timers: number[] = [];
    const stops: Array<() => void> = [];
    bootRef.current?.querySelectorAll("p").forEach((p, i) => {
      p.textContent = "";
      timers.push(
        window.setTimeout(() => {
          stops.push(scrambleInto(p as HTMLElement, PRELOADER.boot[i], 420));
        }, i * 260)
      );
    });
    return () => {
      timers.forEach(clearTimeout);
      stops.forEach((s) => s());
    };
  }, [phase]);

  // Lift once the minimum show time has passed and the model is in (or we gave up).
  useEffect(() => {
    if (phase === "done") return;
    const elapsed = performance.now() - t0.current;
    const wait = ready ? Math.max(0, MIN_SHOW + 600 - elapsed) : Math.max(0, MAX_WAIT - elapsed);
    const id = window.setTimeout(() => {
      setPhase("done");
      document.documentElement.style.overflow = "";
      window.scrollTo(0, 0);
      setIntroDone();
    }, wait);
    return () => clearTimeout(id);
  }, [ready, phase, setIntroDone]);

  const shown = phase === "done" ? 1 : Math.max(progress, phase === "boot" ? 0.35 : 0.08);

  return (
    <div className={`pl${phase === "done" ? " is-done" : ""}`} aria-hidden="true">
      <div className="pl__stack">
        <div className="pl__block" ref={introRef} style={{ visibility: phase === "intro" ? "visible" : "hidden" }}>
          {PRELOADER.intro.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
        <div
          className="pl__block pl__block--boot"
          ref={bootRef}
          style={{ visibility: phase === "intro" ? "hidden" : "visible" }}
        >
          {PRELOADER.boot.map((l) => (
            <p key={l}>{l}</p>
          ))}
        </div>
        <div className="pl__logo">
          <span>Ujesh Yadav</span>
          <span className="pl__bar" style={{ "--p": shown } as CSSProperties}>
            <i />
          </span>
          <span>{Math.round(shown * 100).toString().padStart(3, "0")}</span>
        </div>
      </div>
    </div>
  );
}
