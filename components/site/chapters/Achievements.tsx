"use client";

import { motion } from "framer-motion";
import type { Achievement, Hackathon } from "@/lib/content";
import { isMissing } from "@/lib/content";

const TIER_GLOW: Record<Achievement["tier"], string> = {
  gold: "shadow-[0_0_40px_-12px_rgba(138,180,255,0.6)]",
  silver: "shadow-[0_0_28px_-14px_rgba(138,180,255,0.4)]",
  bronze: "",
};

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function Achievements({
  achievements,
  hackathons,
}: {
  achievements: Achievement[];
  hackathons: Hackathon[];
}) {
  return (
    <section id="achievements" className="relative mx-auto max-w-5xl px-5 py-28 md:px-8">
      <motion.div {...fadeUp}>
        <p className="mono text-accent">Track record</p>
        <h2 className="display mt-3 text-4xl md:text-6xl">Achievements &amp; hackathons</h2>
      </motion.div>

      <motion.div {...fadeUp} className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {achievements.map((a) => (
          <a
            key={a.id}
            href={a.href}
            target={a.href ? "_blank" : undefined}
            rel={a.href ? "noreferrer" : undefined}
            className={`glass flex flex-col justify-between gap-6 rounded-xl p-6 transition-transform duration-300 hover:-translate-y-1 ${TIER_GLOW[a.tier]}`}
          >
            <div className="flex items-start justify-between">
              <span className="display text-2xl">{a.short}</span>
              <span className="mono text-white/40">{a.year}</span>
            </div>
            <div>
              <p className="text-[14px] font-medium leading-tight">{a.title}</p>
              <p className="mt-2 text-[13px] leading-snug text-white/50">{a.detail}</p>
            </div>
          </a>
        ))}
      </motion.div>

      <motion.div {...fadeUp} className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {hackathons.map((h) => {
          const href = h.live ?? h.href;
          return (
            <a
              key={h.id}
              href={href}
              target={href ? "_blank" : undefined}
              rel={href ? "noreferrer" : undefined}
              className="glass group flex flex-col overflow-hidden rounded-xl transition-transform duration-300 hover:-translate-y-1"
            >
              {h.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={h.imageUrl} alt="" className="h-36 w-full object-cover" />
              )}
              <div className="flex flex-1 flex-col justify-between gap-4 p-5">
                <div className="flex items-start justify-between">
                  <span className="mono text-white/45">{h.event}</span>
                  <span className="mono text-white/45">{h.year}</span>
                </div>
                <div>
                  <p className="text-[14px] font-medium leading-tight">{h.project}</p>
                  <p className="mt-2 text-[13px] leading-snug text-white/50">{h.blurb}</p>
                  {!isMissing(h.placement) && <p className="mono mt-3 text-accent">{h.placement}</p>}
                </div>
              </div>
            </a>
          );
        })}
      </motion.div>
    </section>
  );
}
