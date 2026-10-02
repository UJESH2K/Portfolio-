"use client";

import { motion } from "framer-motion";
import TiltCard from "../TiltCard";

const CATEGORIES = [
  {
    id: "ai",
    label: "AI",
    blurb: "Vision models, segmentation, and the occasional trading agent — PyTorch and TensorFlow doing the actual thinking.",
    rotate: -3,
    offset: "md:mt-0",
  },
  {
    id: "3d",
    label: "3D",
    blurb: "This very page is the experiment: a persistent Three.js scene the camera travels through as you scroll it.",
    rotate: 2,
    offset: "md:mt-16",
  },
  {
    id: "motion",
    label: "Motion",
    blurb: "GSAP and Framer Motion, layered until stillness stops being the default state of anything on screen.",
    rotate: -2,
    offset: "md:-mt-6",
  },
  {
    id: "web",
    label: "Web",
    blurb: "Next.js and React on the front, whatever backend a hackathon deadline actually allows for.",
    rotate: 3,
    offset: "md:mt-10",
  },
] as const;

export default function Experiments() {
  return (
    <section id="experiments" className="relative mx-auto max-w-6xl overflow-hidden px-5 py-28 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <p className="mono text-accent">Playground</p>
        <h2 className="display mt-3 text-4xl md:text-6xl">
          AI / 3D / <span className="text-accent">Motion</span> / Web
        </h2>
      </motion.div>

      <div className="mt-20 grid gap-8 sm:grid-cols-2">
        {CATEGORIES.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 50, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: c.rotate }}
            viewport={{ once: true, margin: "-10% 0px" }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={c.offset}
          >
            <TiltCard strength={8} className="group">
              <div className="glass flex h-56 flex-col justify-between rounded-2xl p-7 transition-transform duration-500 hover:rotate-0 hover:scale-[1.02]">
                <span className="mono text-white/30">0{i + 1}</span>
                <div>
                  <h3 className="display text-3xl">{c.label}</h3>
                  <p className="mt-3 text-[13px] leading-relaxed text-white/55">{c.blurb}</p>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
