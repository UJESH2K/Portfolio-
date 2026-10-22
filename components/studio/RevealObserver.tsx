"use client";

import { useEffect } from "react";

/**
 * One IntersectionObserver for the whole page. Every element carrying
 * `data-rv` gets `.is-in` the first time it is 12% on screen. A
 * MutationObserver picks up elements mounted later (client sections, the
 * menu), so components never have to register themselves.
 *
 * Once revealed, an element stays revealed: when React rewrites its
 * className (an FAQ opening, a row going hot), `.is-in` is put straight back
 * before the next paint, instead of the element fading out again.
 */
export default function RevealObserver() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const seen = new WeakSet<Element>();
    const revealed = new WeakSet<Element>();
    const reveal = (el: Element) => {
      revealed.add(el);
      el.classList.add("is-in");
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          reveal(e.target);
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.01 }
    );

    const scan = () => {
      document.querySelectorAll("[data-rv]").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        if (reduced) reveal(el);
        else io.observe(el);
      });
    };

    // Decode lazy photos about a screen and a half before they arrive, so
    // the first frame they are on screen is not spent decoding them.
    const primed = new WeakSet<Element>();
    const primer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const img = e.target as HTMLImageElement;
          primer.unobserve(img);
          img.loading = "eager";
          if (img.complete) img.decode?.().catch(() => {});
          else img.addEventListener("load", () => img.decode?.().catch(() => {}), { once: true });
        }
      },
      { rootMargin: "150% 0px 150% 0px" }
    );
    const prime = () =>
      document.querySelectorAll("img[loading='lazy']").forEach((img) => {
        if (primed.has(img)) return;
        primed.add(img);
        primer.observe(img);
      });

    // Rescans are batched to one per frame: scramble and typing effects
    // mutate the DOM every frame and must not trigger a full query each time.
    let queued = 0;
    const rescan = () => {
      if (queued) return;
      queued = requestAnimationFrame(() => {
        queued = 0;
        scan();
        prime();
      });
    };

    scan();
    prime();
    const mo = new MutationObserver((records) => {
      let added = false;
      for (const r of records) {
        if (r.type === "childList") added = true;
        else if (revealed.has(r.target as Element) && !(r.target as Element).classList.contains("is-in")) {
          (r.target as Element).classList.add("is-in");
        }
      }
      if (added) rescan();
    });
    mo.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["class"] });

    return () => {
      io.disconnect();
      primer.disconnect();
      mo.disconnect();
      cancelAnimationFrame(queued);
    };
  }, []);

  return null;
}
