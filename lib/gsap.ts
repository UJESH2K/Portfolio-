"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useEffect } from "react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** useLayoutEffect that does not warn during SSR. */
export const useIsoLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Scoped GSAP context. Everything created inside `setup` is reverted on
 * unmount, which is what keeps Fast Refresh from stacking ScrollTriggers.
 */
export function useGsap(
  setup: (ctx: gsap.Context) => void,
  scope: React.RefObject<HTMLElement | null>,
  deps: unknown[] = []
) {
  useIsoLayoutEffect(() => {
    if (!scope.current) return;
    const ctx = gsap.context(setup, scope.current as Element);
    return () => ctx.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/** True when the visitor asked for less motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export { gsap, ScrollTrigger };
