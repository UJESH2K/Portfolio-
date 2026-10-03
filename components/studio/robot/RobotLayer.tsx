"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { EASTER_EGGS, ROBOT_IDLE_LINES, ROBOT_LINES, ROBOT_MENU, type RobotCorner } from "@/lib/content";
import { goTo, robotHover, robotScreen, useRobot } from "@/lib/robot";
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
      // Hovering paints a colour reveal across the robot (RobotScene) and
      // gets a happy face, at most once every couple of seconds.
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
      onClick={(e) => {
        sfx.pop();
        const now = performance.now();
        clicks.current = [...clicks.current.filter((t) => now - t < 2000), now];
        if (clicks.current.length >= 5) {
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
 * Switches hero ↔ companion on scroll, fires each section's line as it
 * crosses the middle of the screen, and nudges idle visitors.
 */
const CORNERS: RobotCorner[] = ["tl", "tr", "bl", "br"];

/** A random corner, never the one the robot is already in. */
function nextCorner(): RobotCorner {
  const here = useRobot.getState().corner;
  const options = CORNERS.filter((c) => c !== here);
  return options[Math.floor(Math.random() * options.length)];
}

function Director() {
  useEffect(() => {
    const hero = document.getElementById("top");
    let lastCue = "";
    let lastCueAt = 0;

    const onScroll = () => {
      const st = useRobot.getState();
      if (!st.introDone) return;
      const past = hero ? window.scrollY > hero.offsetHeight * 0.5 : window.scrollY > 400;
      const next = past ? "companion" : "hero";
      if (next !== st.mode) {
        st.setMode(next);
        // Whatever the robot was saying belongs to where it just was.
        useRobot.getState().hush();
        if (next === "companion" && !lastCue) {
          lastCue = "signals";
          lastCueAt = performance.now();
          const l = ROBOT_LINES.signals;
          // Speak once it has landed in the corner.
          window.setTimeout(() => {
            if (useRobot.getState().mode === "companion") useRobot.getState().say(l.line, { mood: l.mood, corner: nextCorner() });
          }, 1400);
        }
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const key = (e.target as HTMLElement).dataset.cue ?? "";
          const st = useRobot.getState();
          if (!st.introDone || st.mode !== "companion" || st.hidden) continue;
          if (key === lastCue) continue;
          const line = ROBOT_LINES[key];
          if (!line) continue;
          const now = performance.now();
          if (now - lastCueAt < 1800) continue;
          // A menu the visitor opened stays until they choose.
          if (st.speech?.kind === "menu") continue;
          lastCue = key;
          lastCueAt = now;
          st.say(line.line, { mood: line.mood, corner: nextCorner() });
        }
      },
      { rootMargin: "-48% 0px -48% 0px" }
    );
    const observe = () => document.querySelectorAll("[data-cue]").forEach((el) => io.observe(el));
    observe();
    const mo = new MutationObserver(observe);
    mo.observe(document.body, { childList: true, subtree: true });

    // Idle nudge: long quiet stretch while in companion mode.
    let idleTimer = 0;
    let idleIdx = 0;
    const arm = () => {
      clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => {
        const st = useRobot.getState();
        if (st.mode === "companion" && !st.speech && !st.hidden) {
          st.say(ROBOT_IDLE_LINES[idleIdx++ % ROBOT_IDLE_LINES.length], {
            mood: idleIdx % 2 ? "peek" : "wave",
            corner: nextCorner(),
          });
        }
        arm();
      }, 16000);
    };
    arm();
    const activity = () => arm();
    window.addEventListener("scroll", activity, { passive: true });
    window.addEventListener("pointerdown", activity);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", activity);
      window.removeEventListener("pointerdown", activity);
      clearTimeout(idleTimer);
      io.disconnect();
      mo.disconnect();
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
      <Balloon />
      <RestoreButton />
      <Director />
    </>
  );
}
