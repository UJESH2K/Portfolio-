"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { gsap, ScrollTrigger, useGsap, prefersReducedMotion } from "@/lib/gsap";

export type ProgressRef = { value: number };

// three.js + fiber + drei code-split behind a client-only dynamic import.
// Only the inner <Canvas> is dynamic — this wrapper's own shape (a plain
// fixed <div>) never changes after mount, and nothing on this page uses
// GSAP's `pin: true` any more, so there's no sibling-reparenting collision
// for a delayed subtree swap to land into (see UniverseScene.tsx's comment
// for the full story).
const UniverseScene = dynamic(() => import("./UniverseScene"), { ssr: false });

const CHAPTER_COUNT = 8; // hero, about, experience, featured, freelance, achievements, updates, contact

/**
 * The persistent 3D backdrop. Mounted once, fixed behind the whole page.
 * A single global ScrollTrigger converts overall page-scroll progress into
 * a 0..1 value written to a plain ref — read inside the R3F frame loop with
 * zero React re-renders, the same pattern proven earlier this session.
 */
export default function Universe() {
  const progress = useRef<ProgressRef>({ value: 0 });
  const [mobile, setMobile] = useState(false);
  const [reduced] = useState(() => prefersReducedMotion());
  const scopeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const check = () => setMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useGsap(
    () => {
      if (reduced) return;
      ScrollTrigger.create({
        trigger: document.documentElement,
        start: "top top",
        end: "bottom bottom",
        scrub: 0,
        onUpdate: (self) => {
          progress.current.value = self.progress;
        },
      });
    },
    scopeRef,
    []
  );

  return (
    <div ref={scopeRef} className="pointer-events-none fixed inset-0 -z-10">
      <UniverseScene progress={progress.current} mobile={mobile} reduced={reduced} stops={CHAPTER_COUNT} />
    </div>
  );
}
