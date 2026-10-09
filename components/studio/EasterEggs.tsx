"use client";

import { useEffect } from "react";
import { EASTER_EGGS } from "@/lib/content";
import { robotScreen, useRobot } from "@/lib/robot";
import { burst } from "./confetti";

/**
 * Hidden extras, all optional:
 *   - the classic cheat code (↑ ↑ ↓ ↓ ← → ← → B A): confetti from the robot;
 *   - typing "ujesh" anywhere: the robot cheers for its human;
 *   - a hello in the developer console;
 *   - leave the page alone for a while and the robot dozes off; any input
 *     wakes it up again.
 * (Clicking the robot five times fast lives in RobotLayer's HitArea.)
 */

const CHEAT = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
const NAME = "ujesh";
const SLEEP_AFTER = 45000;

function robotCentre() {
  if (robotScreen.visible) return { x: robotScreen.left + robotScreen.width / 2, y: robotScreen.top + robotScreen.height * 0.35 };
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

export default function EasterEggs() {
  useEffect(() => {
    // Console hello.
    const [first, ...rest] = EASTER_EGGS.console;
    console.log(`%c${first}`, "font: 600 15px sans-serif; color: #ff5a1f");
    rest.forEach((l) => console.log(`%c${l}`, "font: 13px sans-serif; color: #5c5a55"));

    let cheatAt = 0;
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName))) return;
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      // Cheat code: advance on the right key, restart on the wrong one.
      if (key === CHEAT[cheatAt]) {
        cheatAt++;
        if (cheatAt === CHEAT.length) {
          cheatAt = 0;
          const c = robotCentre();
          burst(c.x, c.y, 110);
          useRobot.getState().say(EASTER_EGGS.cheatCode, { mood: "cheer" });
        }
      } else cheatAt = key === CHEAT[0] ? 1 : 0;

      // Typing the name.
      if (key.length === 1) {
        typed = (typed + key).slice(-NAME.length);
        if (typed === NAME) {
          typed = "";
          const c = robotCentre();
          burst(c.x, c.y, 60);
          useRobot.getState().say(EASTER_EGGS.name, { mood: "cheer" });
        }
      }
    };
    window.addEventListener("keydown", onKey);

    // Dozing off when nothing happens for a while; waking on any input.
    let asleep = false;
    let timer = 0;
    const arm = () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        const st = useRobot.getState();
        if (!st.introDone || st.hidden || st.speech?.kind === "menu") return arm();
        asleep = true;
        // No words: the robot just nods off, Z's and all (SleepZ).
        st.hush();
        st.react("sleep");
      }, SLEEP_AFTER);
    };
    const activity = () => {
      if (asleep) {
        asleep = false;
        useRobot.getState().say(EASTER_EGGS.wake, { mood: "happy" });
      }
      arm();
    };
    arm();
    const events: (keyof WindowEventMap)[] = ["pointermove", "pointerdown", "keydown", "scroll", "touchstart"];
    events.forEach((ev) => window.addEventListener(ev, activity, { passive: true }));

    return () => {
      window.removeEventListener("keydown", onKey);
      events.forEach((ev) => window.removeEventListener(ev, activity));
      clearTimeout(timer);
    };
  }, []);

  return null;
}
