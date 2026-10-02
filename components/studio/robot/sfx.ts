"use client";

import { useRobot } from "@/lib/robot";

/**
 * Tiny synthesised sounds, no audio files. Off until the visitor turns
 * Sound on in the bottom bar; the AudioContext is only created on that first
 * user gesture, which is what browsers require anyway.
 */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (useRobot.getState().muted) return null;
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function blip(freq: number, dur: number, type: OscillatorType = "square", gain = 0.035, slide = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime;
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(gain, t + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

export const sfx = {
  /** One chirp per few letters while a balloon types out. */
  chirp() {
    blip(520 + Math.random() * 420, 0.045, "square", 0.022);
  },
  jump() {
    blip(260, 0.22, "triangle", 0.06, 520);
  },
  land() {
    blip(140, 0.16, "sine", 0.08, -60);
  },
  tingle() {
    for (let i = 0; i < 6; i++) setTimeout(() => blip(900 + i * 140, 0.07, "sawtooth", 0.02), i * 45);
  },
  pop() {
    blip(700, 0.08, "sine", 0.05, 300);
  },
};
