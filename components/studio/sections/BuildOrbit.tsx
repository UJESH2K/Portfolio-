"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { CAPABILITIES, CAPABILITY_MEDIA } from "@/lib/content";
import { Cta } from "../primitives";

/**
 * "What I build": a pinned frame where capability cards and photos fly out
 * of the distance, past a fixed heading, and off the edge of the screen.
 *
 * It is a sticky element inside a tall section, not a GSAP pin, so it
 * cannot fight Lenis. One scroll listener converts the section's progress
 * into a z-offset per tile and writes transforms directly.
 */

type Tile =
  | { kind: "card"; w: number; ratio: [number, number]; cap: (typeof CAPABILITIES)[number] }
  | { kind: "media"; w: number; ratio: [number, number]; media: (typeof CAPABILITY_MEDIA)[number] };

const SIZES: Array<{ w: number; ratio: [number, number] }> = [
  { w: 380, ratio: [16, 10] },
  { w: 330, ratio: [3, 2] },
  { w: 250, ratio: [4, 5] },
  { w: 290, ratio: [1, 1] },
  { w: 300, ratio: [1, 1] },
  { w: 400, ratio: [16, 9] },
  { w: 230, ratio: [3, 4] },
  { w: 340, ratio: [3, 2] },
  { w: 420, ratio: [16, 9] },
  { w: 290, ratio: [1, 1] },
];

function buildTiles(): Tile[] {
  const tiles: Tile[] = [];
  const n = Math.max(CAPABILITIES.length, CAPABILITY_MEDIA.length);
  for (let i = 0; i < n; i++) {
    if (CAPABILITY_MEDIA[i]) tiles.push({ kind: "media", ...SIZES[tiles.length % SIZES.length], media: CAPABILITY_MEDIA[i] });
    if (CAPABILITIES[i]) tiles.push({ kind: "card", ...SIZES[tiles.length % SIZES.length], cap: CAPABILITIES[i] });
  }
  return tiles;
}

const TILES = buildTiles();
const SPACING = 900;
const NEAR = 760;

export default function BuildOrbit() {
  const section = useRef<HTMLElement>(null);
  const tiles = useRef<Array<HTMLElement | null>>([]);
  const count = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Spread tiles around the centre on a loose spiral that avoids the title.
    const layout = TILES.map((_, i) => {
      const a = i * 2.39996 + 0.6;
      return { ax: Math.cos(a), ay: Math.sin(a) };
    });

    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const total = el.offsetHeight - vh;
      const p = Math.min(1, Math.max(0, -r.top / total));
      const travel = p * (TILES.length * SPACING + 1400);
      const mobile = vw < 810;
      const rx = mobile ? vw * 0.36 : vw * 0.33;
      const ry = mobile ? vh * 0.3 : vh * 0.3;
      let current = 0;
      TILES.forEach((t, i) => {
        const node = tiles.current[i];
        if (!node) return;
        const z = -2600 - i * SPACING + travel;
        const fadeIn = Math.min(1, Math.max(0, (z + 2900) / 900));
        const fadeOut = Math.min(1, Math.max(0, (NEAR - z) / 380));
        const o = fadeIn * fadeOut;
        if (z > -900 && z < NEAR) current = i;
        node.style.opacity = o.toFixed(3);
        node.style.visibility = o < 0.01 ? "hidden" : "visible";
        const s = mobile ? 0.62 : 1;
        node.style.transform = `translate3d(${(layout[i].ax * rx).toFixed(1)}px, ${(layout[i].ay * ry).toFixed(1)}px, ${z.toFixed(
          1
        )}px) scale(${s})`;
      });
      if (count.current) {
        const cards = TILES.slice(0, current + 1).filter((t) => t.kind === "card").length;
        count.current.textContent = `${String(Math.max(1, cards)).padStart(2, "0")} / ${String(CAPABILITIES.length).padStart(2, "0")}`;
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section id="build" className="orbit" ref={section} data-cue="build" aria-labelledby="build-title">
      <div className="orbit__pin">
        <div className="orbit__track" aria-hidden="false">
          {TILES.map((t, i) => {
            const style = {
              "--w": `${t.w}px`,
              "--ratio": `${t.ratio[0]} / ${t.ratio[1]}`,
              "--ar": t.ratio[0] / t.ratio[1],
            } as CSSProperties;
            return t.kind === "media" ? (
              <figure key={i} ref={(n) => {
                  tiles.current[i] = n;
                }} className="orbit__tile orbit__tile--media" style={style}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${t.media.src}-800.webp`} alt={t.media.alt} loading="lazy" decoding="async" />
              </figure>
            ) : (
              <article key={i} ref={(n) => {
                  tiles.current[i] = n;
                }} className="orbit__tile orbit__tile--card" style={style}>
                <p className="orbit__num">{t.cap.num}</p>
                <div>
                  <h3 className="orbit__title">{t.cap.title}</h3>
                  <p className="orbit__sub">{t.cap.sub}</p>
                  <p className="orbit__desc">{t.cap.text}</p>
                </div>
              </article>
            );
          })}
        </div>
        <div className="orbit__center">
          <h2 id="build-title" className="orbit__title-big">
            What I build.
          </h2>
          <Cta href="#skills" width={300}>
            See every skill
          </Cta>
        </div>
        <p className="orbit__count" ref={count} aria-hidden="true">
          01 / 05
        </p>
      </div>
    </section>
  );
}
