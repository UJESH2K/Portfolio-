"use client";

import { motion, useReducedMotion, useMotionValue, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A perspective tunnel: cards fly out of the distance toward the viewer,
 * spread round the centre on a golden-angle spiral, while a title holds the
 * middle and the camera pans a little with the pointer.
 *
 * Adapted from the 21st.dev "perspective tunnel hero" for this site: instead
 * of capturing the mouse wheel inside a full-screen box (which traps the
 * page), the tunnel is a sticky stage inside a tall section and its progress
 * is the page's own scroll through that section, so it works with Lenis,
 * trackpads, touch and the keyboard alike.
 */

export type TunnelItem =
  | { kind: "image"; src: string; alt: string; title: string; caption?: string }
  | { kind: "text"; title: string; sub: string; text: string; num: string };

type CardGeometry = {
  angleCos: number;
  angleSin: number;
  radiusFactorX: number;
  radiusFactorY: number;
  rotationZ: number;
};

const geometry = (i: number): CardGeometry => {
  const goldenAngle = i * 137.5 * (Math.PI / 180);
  return {
    angleCos: Math.cos(goldenAngle),
    angleSin: Math.sin(goldenAngle),
    radiusFactorX: 0.28 + (i % 3) * 0.08,
    radiusFactorY: 0.26 + (i % 2) * 0.09,
    rotationZ: (i % 2 === 0 ? 1 : -1) * (3 + (i % 5) * 2),
  };
};

const SPRING_CONFIG = { stiffness: 60, damping: 25, mass: 0.5 };

type Stage = { width: number; height: number; isMobile: boolean };

function useCameraParallax(enabled: boolean) {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, SPRING_CONFIG);
  const y = useSpring(rawY, SPRING_CONFIG);
  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      rawX.set((e.clientX / window.innerWidth - 0.5) * 2);
      rawY.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [enabled, rawX, rawY]);
  return { x, y };
}

function TunnelCard({
  item,
  index,
  total,
  progress,
  pointer,
  stage,
}: {
  item: TunnelItem;
  index: number;
  total: number;
  progress: MotionValue<number>;
  pointer: { x: MotionValue<number>; y: MotionValue<number> };
  stage: Stage;
}) {
  const g = geometry(index);
  // Each card's own slice of the journey, overlapping its neighbours.
  const staggerSpan = 0.45;
  const start = (index / total) * (1 - staggerSpan);
  const local = useTransform(progress, [start, start + staggerSpan], [0, 1]);

  const farZ = stage.isMobile ? -1200 : -1700;
  const nearZ = stage.isMobile ? 350 : 500;
  const z = useTransform(local, [0, 1], [farZ, nearZ]);
  const opacity = useTransform(local, [0, 0.18, 0.82, 0.98], [0, 1, 1, 0]);

  const cardWidth = stage.isMobile ? Math.max(130, Math.min(180, stage.width * 0.38)) : Math.max(190, Math.min(280, stage.width * 0.18));
  // Rounded so the server and browser render the same value.
  const baseX = Math.round(g.angleCos * (stage.width * g.radiusFactorX) * 10) / 10;
  const baseY = Math.round(g.angleSin * (stage.height * g.radiusFactorY) * 10) / 10;
  const panStrength = stage.isMobile ? 20 : 45;

  const transform = useTransform([z, pointer.x, pointer.y], ([currZ, px, py]: number[]) => {
    const ox = baseX - px * panStrength;
    const oy = baseY - py * panStrength;
    return `translate3d(calc(-50% + ${ox.toFixed(1)}px), calc(-50% + ${oy.toFixed(1)}px), ${currZ.toFixed(1)}px) rotateZ(${g.rotationZ}deg)`;
  });
  // Hidden entirely while invisible, so far-off cards cost nothing.
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));

  return (
    <motion.div
      style={{ width: cardWidth, transform, opacity, visibility, zIndex: index + 1 }}
      className="absolute left-1/2 top-1/2 aspect-[4/5] select-none will-change-transform"
    >
      {item.kind === "image" ? (
        <div className="group relative h-full w-full overflow-hidden rounded-2xl bg-[#e9e6dd] shadow-2xl shadow-black/25 ring-1 ring-black/10 transition-shadow duration-500 hover:shadow-[#ff5a1f]/30 hover:ring-[#ff5a1f]/70">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${item.src}-800.webp`}
            srcSet={`${item.src}-800.webp 800w, ${item.src}-1600.webp 1600w`}
            sizes={stage.isMobile ? "40vw" : "280px"}
            alt={item.alt}
            draggable={false}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 flex flex-col justify-end gap-1 bg-gradient-to-t from-black/80 via-black/10 to-transparent p-4 sm:p-5">
            <span className="font-mono text-[11px] uppercase tracking-widest text-white/95 drop-shadow-md sm:text-xs">{item.title}</span>
            {item.caption ? <span className="font-mono text-[10px] uppercase tracking-widest text-[#ff9c6b]">{item.caption}</span> : null}
          </div>
        </div>
      ) : (
        <div className="flex h-full w-full flex-col justify-between rounded-2xl bg-[#0d0d0d] p-5 text-[#f2f0ea] shadow-2xl shadow-black/40 ring-1 ring-white/10">
          <span className="font-mono text-xs text-[#ff7a3d]">{item.num}</span>
          <div className="flex flex-col gap-2">
            <span className="text-xl font-medium leading-tight tracking-tight sm:text-2xl">{item.title}</span>
            <span className="text-xs text-white/60">{item.sub}</span>
            <span className="hidden text-[12.5px] leading-snug text-white/80 sm:block">{item.text}</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function PerspectiveTunnelHero({
  items,
  eyebrow,
  title,
  subtitle,
  prompt = "Keep scrolling",
  children,
  className = "",
}: {
  items: TunnelItem[];
  eyebrow: string;
  title: ReactNode;
  subtitle?: string;
  prompt?: string;
  /** Under the title: a call to action. */
  children?: ReactNode;
  className?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [stage, setStage] = useState<Stage>({ width: 1440, height: 900, isMobile: false });

  useEffect(() => {
    const update = () => setStage({ width: window.innerWidth, height: window.innerHeight, isMobile: window.innerWidth < 768 });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Progress through the tall section, smoothed.
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 80, damping: 30, restDelta: 0.0001 });

  const pointer = useCameraParallax(!reduce);
  const titleScale = useTransform(progress, [0, 0.5, 1], [0.8, 1, 1.25]);
  const titleOpacity = useTransform(progress, [0, 0.1, 0.88, 1], [0.35, 1, 1, 0.2]);
  const promptOpacity = useTransform(progress, [0, 0.08], [1, 0]);

  return (
    <div ref={sectionRef} className={`relative ${className}`} style={{ height: stage.isMobile ? "360vh" : "440vh" }}>
      <div
        className="sticky top-0 flex h-[100svh] w-full items-center justify-center overflow-hidden"
        style={{ perspective: stage.isMobile ? "900px" : "1200px", transformStyle: "preserve-3d" }}
      >
        {/* Dot grid and a warm glow behind everything. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#cdc6b6_1px,transparent_1px)] opacity-70 [background-size:28px_28px] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,#000_60%,transparent_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,90,31,0.14)_0%,transparent_70%)]" />
        {/* Depth rings. */}
        <div className="pointer-events-none absolute h-[48vmin] w-[48vmin] rounded-full border border-[#ff5a1f]/20" />
        <div className="pointer-events-none absolute h-[76vmin] w-[76vmin] rounded-full border border-dashed border-black/15" />

        {/* The title in the middle of the tunnel. */}
        <motion.div style={{ scale: titleScale, opacity: titleOpacity }} className="relative z-0 flex max-w-xl flex-col items-center px-6 text-center">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.4em] text-[#b8360c]">{eyebrow}</p>
          <div className="text-5xl font-medium leading-[0.9] tracking-tighter text-[#0d0d0d] sm:text-7xl md:text-8xl">{title}</div>
          {subtitle ? <p className="mt-5 max-w-[38ch] text-sm text-[#5c5a55] sm:text-base">{subtitle}</p> : null}
          {children ? <div className="pointer-events-auto mt-7">{children}</div> : null}
        </motion.div>

        <motion.div
          style={{ opacity: promptOpacity }}
          className="pointer-events-none absolute bottom-8 z-20 flex flex-col items-center gap-2 font-mono text-xs uppercase tracking-[0.3em] text-[#8d8a83]"
        >
          <span>{prompt}</span>
          <div className="h-6 w-px bg-gradient-to-b from-[#ff5a1f] to-transparent" />
        </motion.div>

        {/* The cards, in 3D. */}
        <div className="pointer-events-none absolute inset-0" style={{ transformStyle: "preserve-3d" }}>
          {items.map((item, i) => (
            <TunnelCard key={i} item={item} index={i} total={items.length} progress={progress} pointer={pointer} stage={stage} />
          ))}
        </div>
      </div>
    </div>
  );
}
