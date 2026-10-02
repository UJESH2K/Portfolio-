"use client";

import { useEffect } from "react";

/**
 * One IntersectionObserver for the whole page. Every element carrying
 * `data-rv` gets `.is-in` the first time it is 12% on screen. A
 * MutationObserver picks up elements mounted later (client sections, the
 * menu), so components never have to register themselves.
 */
export default function RevealObserver() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new WeakSet<Element>();

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
    );

    const scan = () => {
      document.querySelectorAll("[data-rv]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (reduced) el.classList.add("is-in");
        else io.observe(el);
      });
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

  return null;
}
