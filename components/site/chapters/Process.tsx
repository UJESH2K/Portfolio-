"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import TiltCard from "../TiltCard";

const STEPS = [
  {
    n: "01",
    title: "Discover",
    subtitle: "Ideas & Inspiration",
    detail: "Every build starts as a question worth chasing — references, constraints, and the shape of the problem before any code exists.",
  },
  {
    n: "02",
    title: "Explore",
    subtitle: "AI & Concepts",
    detail: "Fast, disposable prototypes. Models, sketches, and dead ends — the exploration that never makes the final cut but shapes everything after it.",
  },
  {
    n: "03",
    title: "Build",
    subtitle: "3D & Creative Code",
    detail: "The concept becomes a system: real geometry, real data, real code — the point where an idea has to survive contact with implementation.",
  },
  {
    n: "04",
    title: "Animate",
    subtitle: "Motion & Interaction",
    detail: "Stillness becomes motion. Timing, easing, and response — the layer that makes something feel alive instead of just correct.",
  },
  {
    n: "05",
    title: "Create",
    subtitle: "Final Experience",
    detail: "Shipped, polished, and put in front of people — the only version of the work that actually counts.",
  },
] as const;

export default function Process() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 0.75", "end 0.4"],
  });
  const pathHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="process" ref={sectionRef} className="relative mx-auto max-w-3xl px-5 py-28 md:px-8">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0px" }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="text-center"
      >
        <p className="mono text-accent">How it comes together</p>
        <h2 className="display mt-3 text-4xl md:text-6xl">Creative process</h2>
      </motion.div>

      <div className="relative mt-20">
        {/* The glowing path — a faint track plus a fill that grows with scroll. */}
        <div className="absolute left-6 top-2 bottom-2 w-px bg-white/10 md:left-1/2" />
        <motion.div
          aria-hidden
          style={{ height: pathHeight }}
          className="absolute left-6 top-2 w-px bg-gradient-to-b from-accent via-accent/70 to-accent/10 shadow-[0_0_12px_1px_rgba(138,180,255,0.6)] md:left-1/2"
        />

        <ol className="flex flex-col gap-16">
          {STEPS.map((s, i) => {
            const isOpen = active === i;
            const alignRight = i % 2 === 1;
            return (
              <motion.li
                key={s.n}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15% 0px" }}
                transition={{ duration: 0.6, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
                className={`relative pl-16 md:w-[46%] md:pl-0 ${alignRight ? "md:ml-auto md:pl-12" : "md:pr-12"}`}
              >
                {/* Node on the path */}
                <span
                  className={`absolute left-6 top-1 z-10 h-3 w-3 -translate-x-1/2 rounded-full border transition-colors duration-300 md:left-auto md:translate-x-0 ${
                    alignRight ? "md:-left-[calc(0.375rem+1px)]" : "md:-right-[calc(0.375rem+1px)]"
                  } ${isOpen ? "border-accent bg-accent shadow-[0_0_14px_2px_rgba(138,180,255,0.7)]" : "border-white/30 bg-ink"}`}
                  style={alignRight ? { left: "auto", marginLeft: "-1.9rem" } : undefined}
                  aria-hidden
                />

                <TiltCard strength={6} className="group">
                  <button
                    type="button"
                    onClick={() => setActive(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="glass w-full rounded-2xl p-6 text-left transition-colors duration-300 hover:bg-white/[0.07] md:p-7"
                  >
                    <div className="flex items-center justify-between">
                      <span className="mono text-accent">{s.n}</span>
                      <span
                        className={`mono transition-transform duration-300 ${isOpen ? "rotate-45 text-accent" : "text-white/40"}`}
                        aria-hidden
                      >
                        +
                      </span>
                    </div>
                    <h3 className="display mt-3 text-2xl">{s.title}</h3>
                    <p className="mono mt-1 text-white/45">{s.subtitle}</p>

                    <motion.div
                      initial={false}
                      animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="mt-4 text-[14px] leading-relaxed text-white/60">{s.detail}</p>
                    </motion.div>
                  </button>
                </TiltCard>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
