"use client";

import { motion } from "framer-motion";
import type { Experience as ExperienceEntry } from "@/lib/content";
import { isMissing } from "@/lib/content";
import { NO_PHOTO_IMAGE } from "@/lib/placeholderImage";

export default function Experience({ experience }: { experience: ExperienceEntry[] }) {
  if (experience.length === 0) return null;

  return (
    <section id="experience" className="relative mx-auto max-w-5xl px-5 py-28 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="mono text-accent">Experience</p>
        <h2 className="display mt-3 text-4xl md:text-6xl">On the job</h2>
      </motion.div>

      <div className="mt-10 flex flex-col gap-6">
        {experience.map((e, i) => (
          <motion.article
            key={e.id}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="glass grid gap-6 overflow-hidden rounded-2xl p-8 md:grid-cols-[1fr_1.4fr] md:p-10"
          >
            <div className="aspect-video overflow-hidden rounded-xl md:aspect-auto">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={e.imageUrl ?? NO_PHOTO_IMAGE} alt={e.company} className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col justify-center gap-3">
              <p className="mono text-white/45">{isMissing(e.period) ? "" : e.period}</p>
              <h3 className="display text-2xl md:text-3xl">{e.company}</h3>
              {!isMissing(e.role) && <p className="text-[14px] text-white/70">{e.role}</p>}
              <p className="text-[14px] leading-relaxed text-white/55">{e.summary}</p>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
