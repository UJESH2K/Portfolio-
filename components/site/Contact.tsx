"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { gsap, useGsap } from "@/lib/gsap";
import { PROFILE, SOCIALS, isMissing } from "@/lib/content";
import TiltCard from "./TiltCard";

/**
 * The closing scene. The headline splits into individual letters that drift
 * apart slightly on scroll, a big tilting CTA pill, drifting ambient glow
 * blobs for atmosphere, then the socials and a resume link close the page.
 */
export default function Contact() {
  const root = useRef<HTMLElement>(null);

  useGsap(
    () => {
      gsap.from("[data-letter]", {
        yPercent: 130,
        duration: 1,
        ease: "expo.out",
        stagger: 0.02,
        scrollTrigger: { trigger: root.current, start: "top 70%", once: true },
      });

      gsap.from("[data-social]", {
        autoAlpha: 0,
        y: 14,
        duration: 0.6,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: { trigger: "[data-social-list]", start: "top 85%", once: true },
      });

      gsap.to("[data-letter]", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: {
          trigger: root.current,
          start: "top bottom",
          end: "bottom bottom",
          scrub: true,
        },
      });
    },
    root,
    []
  );

  const headline = "Let's build";

  return (
    <section
      ref={root}
      id="contact"
      className="relative flex min-h-[100svh] flex-col justify-between overflow-hidden px-5 py-16 md:px-8"
    >
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-accent/10 blur-[120px]"
        animate={{ x: [0, 60, 0], y: [0, -40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 h-[28rem] w-[28rem] rounded-full bg-accent/[0.07] blur-[120px]"
        animate={{ x: [0, -50, 0], y: [0, 30, 0] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative">
        <p className="mono text-white/50">
          {PROFILE.location} — open to work
        </p>

        <h2 className="display mt-8 text-d1">
          <span className="mask-line block">
            {headline.split("").map((ch, i) => (
              <span key={i} data-letter className="inline-block will-move">
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </span>
        </h2>

        <div className="mt-8">
          <TiltCard strength={6} className="inline-block">
            <a
              href={SOCIALS.find((s) => s.id === "email")?.href ?? "#"}
              className="glass group flex items-center gap-3 rounded-full px-6 py-3.5 text-[15px] transition-colors hover:bg-white/[0.08]"
            >
              Let&apos;s create
              <span
                aria-hidden
                className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-ink transition-transform duration-300 group-hover:translate-x-1"
              >
                →
              </span>
            </a>
          </TiltCard>
        </div>
      </div>

      <div className="mt-16 flex flex-col justify-between gap-10 border-t border-white/15 pt-8 md:flex-row md:items-end">
        <div data-social-list className="flex flex-wrap gap-x-8 gap-y-3">
          {SOCIALS.filter((s) => !isMissing(s.href)).map((s) => (
            <a
              key={s.id}
              data-social
              href={s.href}
              target={s.id === "email" ? undefined : "_blank"}
              rel="noreferrer"
              className="mono text-white/60 transition-colors will-move hover:text-white"
            >
              {s.label}
            </a>
          ))}
          {!isMissing(PROFILE.resumeUrl) && (
            <a
              data-social
              href={PROFILE.resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="mono text-white/60 transition-colors will-move hover:text-white"
            >
              Resume
            </a>
          )}
        </div>

        <p className="mono text-white/30">
          {PROFILE.name} — built with Next.js, GSAP, and a lot of scrolling
        </p>
      </div>
    </section>
  );
}
