"use client";

import { useRef } from "react";
import { gsap, useGsap, prefersReducedMotion } from "@/lib/gsap";
import { PROFILE, PORTRAIT } from "@/lib/content";
import Cutout from "./Cutout";

const TAGLINE = "I build things that learn.".split(" ");
const [FIRST, ...REST] = PROFILE.name.split(" ");
const LAST = REST.join(" ");

/**
 * The opening frame: name, photo, one line of intent, floating over the
 * persistent 3D Universe backdrop rather than a solid page background.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useGsap(
    () => {
      const reduced = prefersReducedMotion();
      const words = gsap.utils.toArray<HTMLElement>("[data-word]");

      if (reduced) {
        gsap.set(words, { yPercent: 0, opacity: 1 });
      } else {
        gsap.from(words, {
          yPercent: 115,
          duration: 1,
          ease: "expo.out",
          stagger: 0.05,
          delay: 0.15,
        });

        gsap.from("[data-hero-fade]", {
          opacity: 0,
          y: 16,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.07,
          delay: 0.5,
        });

        gsap.from("[data-portrait]", {
          yPercent: 8,
          opacity: 0,
          duration: 1.3,
          ease: "expo.out",
          delay: 0.2,
        });

        // The floating card idles gently, so it reads as held in place
        // rather than static.
        gsap.to("[data-float-card]", {
          y: -10,
          duration: 2.6,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      // Content sinks and dims as the page scrolls away from it. The float
      // card moves at a slower rate than everything else — the "dragged
      // along, held back" layer — and the ghost watermark drifts opposite,
      // for depth.
      const sc = {
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        scrub: true,
      };

      gsap.to("[data-hero-inner]", {
        yPercent: -12,
        opacity: 0.3,
        ease: "none",
        scrollTrigger: sc,
      });

      gsap.to("[data-portrait]", {
        yPercent: -6,
        scale: 0.96,
        ease: "none",
        scrollTrigger: sc,
      });

      gsap.to("[data-float-card]", {
        yPercent: 40,
        ease: "none",
        scrollTrigger: sc,
      });

      gsap.to("[data-ghost-name]", {
        yPercent: -22,
        ease: "none",
        scrollTrigger: sc,
      });
    },
    root,
    []
  );

  return (
    <section
      ref={root}
      id="top"
      data-hero-root
      className="relative z-0 flex h-[100svh] flex-col overflow-hidden"
    >
      {/* Corner registration marks */}
      <span aria-hidden className="pointer-events-none absolute left-5 top-24 text-white/20 md:left-8">+</span>
      <span aria-hidden className="pointer-events-none absolute right-5 top-24 text-white/20 md:right-8">+</span>
      <span aria-hidden className="pointer-events-none absolute bottom-8 left-5 text-white/20 md:left-8">+</span>
      <span aria-hidden className="pointer-events-none absolute bottom-8 right-5 text-white/20 md:right-8">+</span>

      {/* Giant name watermark, sitting behind the photo */}
      <span
        data-ghost-name
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[16%] w-full -translate-x-1/2 select-none text-center text-[26vw] font-semibold uppercase leading-none tracking-tighter text-white/[0.05] will-move"
      >
        {FIRST}
      </span>

      <div data-hero-inner className="relative flex h-full flex-col will-move">
        {/* Meta row */}
        <div className="mono flex items-center justify-between px-5 pt-24 text-ash md:px-8">
          <span data-hero-fade>{PROFILE.location}</span>
          <span data-hero-fade className="hidden md:block">
            {PROFILE.title}
          </span>
          <span data-hero-fade>Portfolio — 2026</span>
        </div>

        {/* Tagline */}
        <p className="mask-line mt-6 px-5 text-[15px] leading-snug text-white/70 md:px-8">
          <span className="flex flex-wrap gap-x-[0.3em]">
            {TAGLINE.map((w, i) => (
              <span key={i} data-word className="inline-block will-move">
                {w}
              </span>
            ))}
          </span>
        </p>

        {/* Portrait: the cutout goes here once you have one */}
        <div
          data-portrait
          className="relative mx-auto mt-2 h-[58%] w-full max-w-3xl flex-1 will-move md:h-[64%]"
        >
          <Cutout
            src={PORTRAIT.src}
            alt={PORTRAIT.alt}
            className="absolute inset-x-0 bottom-0 mx-auto h-full w-auto"
          />
        </div>

        {/* Name, bottom-left, oversized */}
        <div className="relative px-5 pb-8 md:px-8">
          <p data-hero-fade className="mono text-ash">
            © 2026
          </p>
          <h1 className="display -mt-2 text-d1">
            <span className="mask-line block">
              <span data-word className="inline-block will-move">
                {FIRST}
              </span>
            </span>
            {LAST && (
              <span className="mask-line block">
                <span data-word className="inline-block will-move">
                  {LAST}
                </span>
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Floating card: trails the rest of the page slightly on scroll */}
      <div
        data-float-card
        data-hero-fade
        className="glass absolute bottom-10 right-5 z-10 flex items-center gap-3 rounded-full px-4 py-2.5 will-move md:right-8"
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent/50" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
        </span>
        <div className="leading-tight">
          <p className="text-[12px] font-medium">Let&apos;s talk</p>
          <p className="mono text-ash">{PROFILE.title}</p>
        </div>
        <a
          href="#contact"
          aria-label="Jump to contact"
          className="ml-1 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-[12px] transition-transform duration-300 hover:translate-x-0.5 hover:-translate-y-0.5"
        >
          ↗
        </a>
      </div>
    </section>
  );
}
