"use client";

import { motion } from "framer-motion";
import { PROFILE, STATS, SKILLS, TIMELINE, INTERESTS, CP_PROFILES, isMissing } from "@/lib/content";

const TAG_LABEL: Record<string, string> = { code: "Built", win: "Won", work: "Worked", life: "Lived" };

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-10% 0px" },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

export default function About() {
  const cp = CP_PROFILES.filter((c) => !isMissing(c.handle));

  return (
    <section id="about" className="relative mx-auto max-w-5xl px-5 py-28 md:px-8">
      <motion.div {...fadeUp}>
        <p className="mono text-accent">About</p>
        <h2 className="display mt-3 text-4xl md:text-6xl">
          {PROFILE.tagline}
        </h2>
        <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-white/65">{PROFILE.bio}</p>
      </motion.div>

      <motion.div {...fadeUp} className="glass mt-12 grid grid-cols-2 gap-6 rounded-2xl p-8 md:grid-cols-4">
        {STATS.map((s) => (
          <div key={s.label}>
            <p className="display text-2xl md:text-3xl">{s.value}</p>
            <p className="mono mt-1 text-white/45">{s.label}</p>
          </div>
        ))}
      </motion.div>

      <motion.div {...fadeUp} className="mt-16">
        <p className="mono text-white/45">The stack</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SKILLS.map((g) => (
            <div key={g.group} className="glass rounded-xl p-5">
              <p className="text-[13px] font-medium text-white/80">{g.group}</p>
              <p className="mono mt-2 leading-relaxed text-white/45">{g.items.join(" · ")}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div {...fadeUp} className="mt-16">
        <p className="mono text-white/45">The timeline</p>
        <ul className="mt-4 flex flex-col gap-5 border-l border-white/10 pl-6">
          {TIMELINE.map((t, i) => (
            <li key={i}>
              <p className="mono text-accent">
                {t.year} · {TAG_LABEL[t.tag]}
              </p>
              <p className="mt-1 text-[15px] font-medium">{t.title}</p>
              <p className="mt-1 text-[13px] text-white/50">{t.detail}</p>
            </li>
          ))}
        </ul>
      </motion.div>

      {(cp.length > 0 || INTERESTS.length > 0) && (
        <motion.div {...fadeUp} className="mt-16 grid gap-10 md:grid-cols-2">
          {cp.length > 0 && (
            <div>
              <p className="mono text-white/45">Competitive programming</p>
              <div className="mt-4 flex flex-col gap-3">
                {cp.map((c) => (
                  <a
                    key={c.id}
                    href={c.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="glass flex items-center justify-between rounded-lg px-4 py-3 transition-colors hover:bg-white/[0.07]"
                  >
                    <span className="text-[14px]">{c.platform}</span>
                    <span className="mono text-white/50">{c.handle}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="mono text-white/45">Outside the terminal</p>
            <div className="mt-4 flex flex-wrap gap-3">
              {INTERESTS.map((i) => (
                <span key={i.id} className="glass rounded-full px-4 py-2 text-[13px] text-white/70">
                  {i.label}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </section>
  );
}
