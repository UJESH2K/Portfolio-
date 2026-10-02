"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGsap } from "@/lib/gsap";

const LINKS = [
  { id: "top", label: "Intro" },
  { id: "about", label: "About" },
  { id: "process", label: "Process" },
  { id: "work", label: "Work" },
  { id: "freelance", label: "Freelance" },
  { id: "experiments", label: "Experiments" },
  { id: "contact", label: "Contact" },
];

/**
 * Fixed chrome, floating over the persistent 3D backdrop. A translucent
 * glass bar once scrolled past the hero, transparent at the very top so the
 * opening frame reads clean.
 */
export default function Nav() {
  const root = useRef<HTMLElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useGsap(
    () => {
      // The hairline under the nav fills as the page is read.
      gsap.to(bar.current, {
        scaleX: 1,
        ease: "none",
        scrollTrigger: {
          trigger: document.documentElement,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.3,
        },
      });

      ScrollTrigger.create({
        start: 0,
        end: "max",
        onUpdate: (self) => setScrolled(self.scroll() > 40),
      });
    },
    root,
    []
  );

  return (
    <header ref={root} className="fixed inset-x-0 top-0 z-50">
      <div
        className={`flex items-center justify-between px-5 py-4 text-white transition-colors duration-300 md:px-8 ${
          scrolled ? "glass" : "bg-transparent"
        }`}
      >
        <a href="#top" className="mono">
          Ujesh Kumar Yadav
        </a>

        <nav className="hidden gap-7 md:flex">
          {LINKS.map((l) => (
            <a key={l.id} href={`#${l.id}`} className="mono transition-opacity hover:opacity-60">
              {l.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="mono z-50 md:hidden"
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? "Close" : "Menu"}
        </button>
      </div>

      {scrolled && (
        <div className="relative h-px w-full bg-white/10">
          <div ref={bar} className="h-px w-full origin-left scale-x-0 bg-accent" />
        </div>
      )}

      {open && (
        <div className="fixed inset-0 top-0 flex flex-col justify-center bg-ink/95 px-5 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-2">
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={() => setOpen(false)}
                className="display py-2 text-4xl"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
