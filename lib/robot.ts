"use client";

import { create } from "zustand";
import type { BalloonChip, RobotCorner, RobotMood } from "@/lib/content";

/**
 * One store for the robot, shared by the 3D scene, the speech balloon, the
 * click target and every section that cues it.
 *
 * React state holds only what changes a few times a minute (what it says,
 * where it lives). Anything that changes per frame — the robot's projected
 * screen position — lives in `robotScreen`, a plain mutable object the scene
 * writes and the DOM overlays read inside their own rAF loops, so nothing
 * re-renders at 60fps.
 */

export type RobotMode = "hero" | "companion";

export type Speech = {
  /** Bumped on every new line so the balloon can re-run its entrance. */
  key: number;
  text: string;
  chips?: BalloonChip[];
  /** "menu" lines stay up until dismissed; "line" lines time out. */
  kind: "line" | "menu";
};

type RobotState = {
  /** The preloader has lifted; the hero can start its entrance. */
  introDone: boolean;
  /** 0..1 load progress of the robot model, shown by the preloader. */
  progress: number;
  ready: boolean;
  mode: RobotMode;
  corner: RobotCorner;
  mood: RobotMood;
  /** Increments to ask the scene to play the current mood again. */
  moodTick: number;
  speech: Speech | null;
  muted: boolean;
  hidden: boolean;
  setIntroDone: () => void;
  setProgress: (p: number) => void;
  setReady: () => void;
  setMode: (mode: RobotMode) => void;
  /** Send the companion to a corner (it travels there), without speaking. */
  setCorner: (corner: RobotCorner) => void;
  say: (text: string, opts?: { mood?: RobotMood; chips?: BalloonChip[]; kind?: Speech["kind"]; corner?: RobotCorner }) => void;
  hush: () => void;
  /** Play a mood without saying anything (hover reactions, easter eggs). */
  react: (mood: RobotMood) => void;
  toggleMuted: () => void;
  setHidden: (hidden: boolean) => void;
};

let speechKey = 0;

export const useRobot = create<RobotState>((set) => ({
  introDone: false,
  progress: 0,
  ready: false,
  mode: "hero",
  corner: "br",
  mood: "wave",
  moodTick: 0,
  speech: null,
  muted: true,
  hidden: false,
  setIntroDone: () => set({ introDone: true }),
  setProgress: (progress) => set({ progress }),
  setReady: () => set({ ready: true, progress: 1 }),
  setMode: (mode) => set({ mode }),
  setCorner: (corner) => set({ corner }),
  say: (text, opts = {}) =>
    set((s) => ({
      speech: { key: ++speechKey, text, chips: opts.chips, kind: opts.kind ?? (opts.chips ? "menu" : "line") },
      mood: opts.mood ?? s.mood,
      // Only a line that asks for a move gets one; plain lines just talk.
      moodTick: opts.mood ? s.moodTick + 1 : s.moodTick,
      corner: opts.corner ?? s.corner,
    })),
  hush: () => set({ speech: null }),
  react: (mood) => set((s) => ({ mood, moodTick: s.moodTick + 1 })),
  toggleMuted: () => set((s) => ({ muted: !s.muted })),
  setHidden: (hidden) => set((s) => ({ hidden, speech: hidden ? null : s.speech })),
}));

/** Written by the scene every frame, read by DOM overlays. CSS pixels. */
export const robotScreen = {
  visible: false,
  /** Centre of the head. */
  headX: 0,
  headY: 0,
  /** Bounding box of the whole robot. */
  left: 0,
  top: 0,
  width: 0,
  height: 0,
  /** Which side of the screen it stands on, for balloon placement. */
  side: "right" as "left" | "right",
};

/**
 * Pointer over the robot, written by its hover target and read by the scene
 * for the colour-reveal effect. CSS pixels from the top-left of the window.
 */
export const robotHover = { on: false, x: 0, y: 0 };

/**
 * The latest click on the robot, for the scene's particle effects: `at` is
 * performance.now(), x/y are client pixels. "teleport" takes the robot apart
 * and brings it back with a jump; "poke" and "angry" burst it open just where
 * it was clicked.
 */
export const robotPoke: { at: number; x: number; y: number; kind: "teleport" | "poke" | "angry" } = {
  at: 0,
  x: 0,
  y: 0,
  kind: "poke",
};

/** Words that float up from the robot when it is clicked ("boop", "stop!"). */
export type RobotWord = { text: string; x: number; y: number; tone: "play" | "stop" | "angry" };
const wordListeners = new Set<(w: RobotWord) => void>();
export function robotWord(w: RobotWord) {
  wordListeners.forEach((fn) => fn(w));
}
export function onRobotWord(fn: (w: RobotWord) => void) {
  wordListeners.add(fn);
  return () => {
    wordListeners.delete(fn);
  };
}

/** Smooth-scroll to an in-page anchor through Lenis when it is running. */
export function goTo(href: string) {
  if (typeof window === "undefined") return;
  if (!href.startsWith("#")) {
    window.open(href, "_blank", "noopener");
    return;
  }
  const target = href === "#top" ? 0 : document.querySelector(href);
  if (target === null) return;
  const lenis = (window as unknown as { __lenis?: { scrollTo: (t: unknown, o?: unknown) => void } }).__lenis;
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.6 });
  } else if (target === 0) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    (target as HTMLElement).scrollIntoView({ behavior: "smooth" });
  }
}
