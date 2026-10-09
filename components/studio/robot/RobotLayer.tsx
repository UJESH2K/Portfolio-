"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { EASTER_EGGS, ROBOT_IDLE_LINES, ROBOT_LINES, ROBOT_MENU } from "@/lib/content";
import { goTo, robotHover, robotTap, robotScreen, useRobot } from "@/lib/robot";
import { sfx } from "./sfx";
import { burst } from "../confetti";

const RobotScene = dynamic(() => import("./RobotScene"), { ssr: false });

/** If WebGL or the model fails, the site carries on without the robot. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useRobot.getState().setReady();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

/**
 * Speech balloon. Types its line out, then shows any chapter chips. It is
 * positioned every frame from `robotScreen`, so it rides along with jumps.
 */
function Balloon() {
  const speech = useRobot((s) => s.speech);
  const mode = useRobot((s) => s.mode);
  const hush = useRobot((s) => s.hush);
  const ref = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState("");
  const [done, setDone] = useState(false);
  const [side, setSide] = useState<"left" | "right">("left");

  // Type the line out.
  useEffect(() => {
    if (!speech) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setDone(false);
    if (reduced) {
      setTyped(speech.text);
      setDone(true);
      return;
    }
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setTyped(speech.text.slice(0, i));
      if (i % 3 === 0) sfx.chirp();
      if (i >= speech.text.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 26);
    return () => clearInterval(id);
  }, [speech]);

  // Menus close themselves after a while unless the pointer is resting on
  // them, so the page never stays parked on an open menu.
  const hovering = useRef(false);
  useEffect(() => {
    if (!speech || speech.kind !== "menu" || !done) return;
    const key = speech.key;
    let id = 0;
    const check = () => {
      id = window.setTimeout(() => {
        if (useRobot.getState().speech?.key !== key) return;
        if (hovering.current) check();
        else hush();
      }, 15000);
    };
    check();
    return () => clearTimeout(id);
  }, [speech, done, hush]);

  // Plain lines go away by themselves; menus wait for a choice.
  useEffect(() => {
    if (!speech || speech.kind !== "line" || !done) return;
    const key = speech.key;
    const id = window.setTimeout(() => {
      if (useRobot.getState().speech?.key === key) hush();
      // Phones have less room, so lines clear sooner there.
    }, window.innerWidth < 810 ? Math.max(2400, speech.text.length * 45) : Math.max(3200, speech.text.length * 60));
    return () => clearTimeout(id);
  }, [speech, done, hush]);

  // Follow the robot.
  useEffect(() => {
    let raf = 0;
    let shownSide: "left" | "right" = "left";
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const el = ref.current;
      if (!el) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const mobile = w < 810;
      const bw = el.offsetWidth;
      const bh = el.offsetHeight;
      const st = useRobot.getState();
      let x: number;
      let y: number;
      let next: "left" | "right";
      if (!robotScreen.visible) {
        // No robot (yet): park the balloon where the hero robot would stand.
        x = mobile ? (w - bw) / 2 : w * 0.56 - bw;
        y = mobile ? h * 0.2 : h * 0.3;
        next = "left";
      } else if (st.mode === "hero" && mobile) {
        x = (w - bw) / 2;
        y = robotScreen.top - bh - 14;
        next = "left";
      } else if (robotScreen.side === "right") {
        x = robotScreen.headX - robotScreen.height * (st.mode === "hero" ? 0.2 : 0.16) - bw;
        y = robotScreen.headY - bh - robotScreen.height * (st.mode === "hero" ? 0.12 : 0.06);
        next = "left";
      } else {
        x = robotScreen.headX + robotScreen.height * 0.16;
        y = robotScreen.headY - bh - robotScreen.height * 0.06;
        next = "right";
      }
      // In a top corner there is no room above its head: talk from the side.
      if (st.mode === "companion" && robotScreen.visible && robotScreen.top + robotScreen.height < h * 0.5) {
        y = robotScreen.headY - bh * 0.35;
      }
      x = Math.max(12, Math.min(w - bw - 12, x));
      // Keep clear of the two-column nav while it shows in the hero.
      const top = mobile ? 70 : st.mode === "hero" ? 128 : 96;
      y = Math.max(top, Math.min(h - bh - 60, y));
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
      if (next !== shownSide) {
        shownSide = next;
        setSide(next);
      }
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);

  const visible = !!speech;
  const hero = mode === "hero";

  return (
    <div
      ref={ref}
      className={`balloon balloon--${side === "left" ? "left" : "right"}${hero ? " balloon--hero" : ""}${
        visible ? " is-on" : ""
      }`}
      role="status"
      aria-live="polite"
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      <div className="balloon__in" key={speech?.key}>
        <p className="balloon__text">
          {typed}
          <span className="balloon__ghost" aria-hidden="true">
            {speech?.text.slice(typed.length)}
          </span>
        </p>
        {speech?.chips?.length ? (
          <div className={`balloon__chips${done ? " is-in" : ""}`}>
            {speech.chips.map((c, i) => (
              <button
                key={c.href + c.label}
                type="button"
                style={{ "--i": i } as CSSProperties}
                onClick={() => {
                  sfx.pop();
                  if (c.href === "#hide") {
                    useRobot.getState().setHidden(true);
                    return;
                  }
                  if (!hero) hush();
                  goTo(c.href);
                }}
              >
                {c.label}
                <span aria-hidden="true">→</span>
              </button>
            ))}
          </div>
        ) : null}
        {!hero && visible ? (
          <button type="button" className="balloon__x" aria-label="Close" onClick={hush}>
            ×
          </button>
        ) : null}
      </div>
      <svg className="balloon__tail" viewBox="0 0 40 30" aria-hidden="true">
        <path d="M2 0 C 10 12, 22 22, 38 28 C 26 16, 22 8, 22 0 Z" />
      </svg>
    </div>
  );
}

/** Invisible button over the companion robot. */
function HitArea() {
  const hidden = useRobot((s) => s.hidden);
  const ref = useRef<HTMLButtonElement>(null);
  const lastHappy = useRef(0);
  // Easter egg: five quick clicks and it spins itself dizzy.
  const clicks = useRef<number[]>([]);
  const dizzyUntil = useRef(0);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const el = ref.current;
      if (!el) return;
      el.style.width = `${robotScreen.width}px`;
      el.style.height = `${robotScreen.height * 0.85}px`;
      el.style.transform = `translate3d(${robotScreen.left}px, ${robotScreen.top + robotScreen.height * 0.05}px, 0)`;
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <button
      ref={ref}
      type="button"
      className="robot-hit"
      hidden={hidden}
      aria-label="Ask the robot where to go"
      // Hovering takes the robot apart into particles (RobotFx, on the
      // landing page) and gets a happy face, at most once every couple of
      // seconds; a tap does the same on touch screens.
      onPointerEnter={(e) => {
        robotHover.on = true;
        robotHover.x = e.clientX;
        robotHover.y = e.clientY;
        const now = performance.now();
        if (now - lastHappy.current > 2200) {
          lastHappy.current = now;
          useRobot.getState().react("happy");
        }
      }}
      onPointerMove={(e) => {
        robotHover.x = e.clientX;
        robotHover.y = e.clientY;
      }}
      onPointerLeave={() => {
        robotHover.on = false;
      }}
      onPointerDown={(e) => {
        if (e.pointerType !== "mouse") robotTap.at = performance.now();
      }}
      onClick={(e) => {
        sfx.pop();
        const now = performance.now();
        if (now < dizzyUntil.current) return;
        clicks.current = [...clicks.current.filter((t) => now - t < 2000), now];
        if (clicks.current.length >= 5) {
          dizzyUntil.current = now + 2600;
          clicks.current = [];
          burst(e.clientX, e.clientY, 50);
          useRobot.getState().say(EASTER_EGGS.dizzy, { mood: "dizzy" });
          return;
        }
        useRobot.getState().say(ROBOT_MENU.prompt, {
          mood: "happy",
          chips: [...ROBOT_MENU.stops, { label: "Hide the robot", href: "#hide" }],
          kind: "menu",
        });
      }}
    />
  );
}

/**
 * Asleep: a stream of Z's rising from the robot's head, drifting away from
 * the nearest screen edge and sized to the robot. Shown for as long as the
 * "sleep" mood lasts (any input wakes it, see EasterEggs).
 */
function SleepZ() {
  const on = useRobot((s) => s.mood === "sleep" && !s.hidden);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const el = ref.current;
      if (!el) return;
      const dir = robotScreen.side === "right" ? -1 : 1;
      el.style.setProperty("--dir", String(dir));
      el.style.setProperty("--s", String(Math.min(2.2, Math.max(1, robotScreen.height / 160))));
      el.style.transform = `translate3d(${robotScreen.headX + dir * robotScreen.width * 0.36}px, ${robotScreen.headY - robotScreen.height * 0.15}px, 0)`;
      el.style.opacity = robotScreen.visible ? "1" : "0";
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [on]);
  if (!on) return null;
  return (
    <div ref={ref} className="sleepz" aria-hidden="true">
      <span>Z</span>
      <span>z</span>
      <span>Z</span>
    </div>
  );
}

/**
 * Switches hero ↔ companion on scroll, fires each section's line as it
 * crosses the middle of the screen, and nudges idle visitors.
 */
/**
 * Decides where the companion is and what it says:
 *   - hero ↔ companion switches at half-way down the landing page;
 *   - it follows the section that sits at the middle of the screen, but only
 *     once the visitor has settled on it, so flicking past sections doesn't
 *     send it bouncing around or leave it reading out the wrong one;
 *   - each section has a set corner (ROBOT_LINES); it travels there first and
 *     speaks after it has landed;
 *   - a long quiet stretch gets a short nudge, without moving.
 */
const SETTLE_MS = 350;
const LAND_MS = 1500;

function sectionAtCentre(): string {
  const y = window.innerHeight * 0.45;
  let found = "";
  document.querySelectorAll<HTMLElement>("[data-cue]").forEach((el) => {
    if (el.id === "top") return;
    const r = el.getBoundingClientRect();
    if (r.top <= y && r.bottom > y) found = el.dataset.cue ?? "";
  });
  return found;
}

function Director() {
  useEffect(() => {
    const hero = document.getElementById("top");
    let current = "";
    let pending = "";
    let settleTimer = 0;
    let speakTimer = 0;

    const present = (key: string, moving: boolean) => {
      const line = ROBOT_LINES[key];
      if (!line) return;
      current = key;
      clearTimeout(speakTimer);
      speakTimer = window.setTimeout(
        () => {
          const st = useRobot.getState();
          if (st.mode !== "companion" || st.hidden || current !== key) return;
          // A menu the visitor opened stays until they choose.
          if (st.speech?.kind === "menu") return;
          st.say(line.line, { mood: line.mood });
        },
        moving ? LAND_MS : 250
      );
    };

    // Phones keep the robot in one corner: on short sections a leap per
    // section reads as jitter, not a tour.
    const cornerOf = (line: (typeof ROBOT_LINES)[string]) => (window.innerWidth < 810 ? "br" : line.corner);

    const visit = (key: string) => {
      const line = ROBOT_LINES[key];
      if (!line) return;
      const st = useRobot.getState();
      const corner = cornerOf(line);
      const moving = corner !== st.corner;
      st.hush();
      if (moving) st.setCorner(corner);
      present(key, moving);
    };

    const update = () => {
      const st = useRobot.getState();
      if (!st.introDone) return;
      const past = hero ? window.scrollY > hero.offsetHeight * 0.5 : window.scrollY > 400;
      const mode = past ? "companion" : "hero";
      if (mode !== st.mode) {
        st.hush();
        clearTimeout(speakTimer);
        clearTimeout(settleTimer);
        pending = "";
        if (mode === "companion") {
          // Pick the first section's corner before switching, so the robot
          // makes one move off the landing page, not two.
          const key = sectionAtCentre() || "signals";
          const line = ROBOT_LINES[key];
          if (line) st.setCorner(cornerOf(line));
          st.setMode("companion");
          present(key, true);
        } else {
          current = "";
          st.setMode("hero");
        }
        return;
      }
      if (mode !== "companion" || st.hidden) return;
      const key = sectionAtCentre();
      if (!key || key === current || key === pending) return;
      pending = key;
      clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        pending = "";
        if (sectionAtCentre() === key && useRobot.getState().mode === "companion") visit(key);
      }, SETTLE_MS);
    };

    let raf = 0;
    const onScroll = () => {
      if (!raf)
        raf = requestAnimationFrame(() => {
          raf = 0;
          update();
        });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const unsubIntro = useRobot.subscribe((s, prev) => {
      if (s.introDone && !prev.introDone) onScroll();
      // Brought back after being hidden: present wherever the page is now.
      if (!s.hidden && prev.hidden) {
        current = "";
        onScroll();
      }
    });

    // Idle nudge: a long quiet stretch in the companion gets one short line.
    let idleTimer = 0;
    let idleIdx = 0;
    const arm = () => {
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        const st = useRobot.getState();
        if (st.mode === "companion" && !st.speech && !st.hidden) {
          st.say(ROBOT_IDLE_LINES[idleIdx++ % ROBOT_IDLE_LINES.length]);
        }
        arm();
      }, 30000);
    };
    arm();
    const activity = () => arm();
    window.addEventListener("scroll", activity, { passive: true });
    window.addEventListener("pointerdown", activity);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", activity);
      window.removeEventListener("pointerdown", activity);
      cancelAnimationFrame(raf);
      clearTimeout(idleTimer);
      clearTimeout(settleTimer);
      clearTimeout(speakTimer);
      unsubIntro();
    };
  }, []);
  return null;
}

function RestoreButton() {
  const hidden = useRobot((s) => s.hidden);
  if (!hidden) return null;
  return (
    <button
      type="button"
      className="robot-restore"
      onClick={() => {
        const st = useRobot.getState();
        st.setHidden(false);
        st.say("I'm back! Did you miss me?", { mood: "cheer" });
      }}
    >
      Bring the robot back
    </button>
  );
}

export default function RobotLayer() {
  const [canRender, setCanRender] = useState(false);
  useEffect(() => {
    if (webglOk()) setCanRender(true);
    else useRobot.getState().setReady();
  }, []);

  return (
    <>
      <div className="robot-layer" aria-hidden="true">
        {canRender ? (
          <SceneBoundary>
            <RobotScene />
          </SceneBoundary>
        ) : null}
      </div>
      <HitArea />
      <SleepZ />
      <Balloon />
      <RestoreButton />
      <Director />
    </>
  );
}
