"use client";

import { useRobot } from "@/lib/robot";

/**
 * Tiny synthesised sounds, no audio files. Off until the visitor turns
 * Sound on in the bottom bar; the AudioContext is only created on that first
 * user gesture, which is what browsers require anyway.
 */

let ctx: AudioContext | null = null;

/** Parts of the page that ask for quiet while the pointer is on them (the
 *  projects carousel): no sounds play while any of them holds. */
const holds = new Set<string>();
export function setSfxHold(key: string, on: boolean) {
  if (on) holds.add(key);
  else holds.delete(key);
}

function audio(direct = false): AudioContext | null {
  const { muted, soundChosen } = useRobot.getState();
  // A sound the visitor triggers by hand (a key press) plays unless they have
  // switched Sound off themselves; the ambient ones wait for Sound on.
  if (direct ? muted && soundChosen : muted || holds.size) return null;
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

let noise: AudioBuffer | null = null;
function noiseBuffer(a: AudioContext) {
  if (!noise) {
    noise = a.createBuffer(1, Math.floor(a.sampleRate * 0.12), a.sampleRate);
    const d = noise.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noise;
}

/** A filtered burst of noise: the clack of plastic on plastic. */
function burst(a: AudioContext, t: number, type: BiquadFilterType, freq: number, q: number, gain: number, dur: number) {
  const src = a.createBufferSource();
  src.buffer = noiseBuffer(a);
  src.playbackRate.value = 0.9 + Math.random() * 0.2;
  const f = a.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  f.Q.value = q;
  const g = a.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(a.destination);
  src.start(t);
  src.stop(t + dur + 0.01);
}

/** The low, rounded "thock" of the keycap bottoming out. */
function thock(a: AudioContext, t: number, freq: number, gain: number, dur: number) {
  const o = a.createOscillator();
  const g = a.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(freq, t);
  o.frequency.exponentialRampToValueAtTime(freq * 0.55, t + dur);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(a.destination);
  o.start(t);
  o.stop(t + dur + 0.01);
}

export const sfx = {
  /** A mechanical key: the click and thock going down, a lighter clack coming up. */
  key(phase: "down" | "up" = "down") {
    const a = audio(true);
    if (!a) return;
    const t = a.currentTime;
    const v = 0.85 + Math.random() * 0.3;
    if (phase === "down") {
      burst(a, t, "highpass", 3200 * v, 0.7, 0.32, 0.012);
      burst(a, t + 0.004, "bandpass", 1500 * v, 1.4, 0.4, 0.045);
      thock(a, t + 0.006, 190 * v, 0.34, 0.07);
    } else {
      burst(a, t, "bandpass", 2400 * v, 1.2, 0.2, 0.03);
      thock(a, t, 260 * v, 0.12, 0.04);
    }
  },
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
  pop() {
    blip(700, 0.08, "sine", 0.05, 300);
  },
};
