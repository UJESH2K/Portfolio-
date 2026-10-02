"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/content";
import CaseStudyCard from "../CaseStudyCard";

export default function Freelance({ projects }: { projects: Project[] }) {
  if (projects.length === 0) return null;

  return (
    <section id="freelance" className="relative mx-auto max-w-5xl px-5 py-28 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-end justify-between"
      >
        <div>
          <p className="mono text-accent">Freelance &amp; client work</p>
          <h2 className="display mt-3 text-4xl md:text-6xl">Built for clients</h2>
        </div>
        <p className="mono hidden text-white/45 md:block">{String(projects.length).padStart(2, "0")}</p>
      </motion.div>

      <div className="mt-12 flex flex-col gap-10">
        {projects.map((p, i) => (
          <CaseStudyCard key={p.id} project={p} reverse={i % 2 === 1} />
        ))}
      </div>
    </section>
  );
}
