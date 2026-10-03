"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { ROLES, ROLES_INTRO } from "@/lib/content";
import { Eyebrow, Img, SplitWords } from "../primitives";
import Scramble from "../Scramble";

/**
 * Experience as a stack of sticky cards, each a shade deeper than the last.
 * When a card is covered by the next one its body dims, so the eye goes to
 * whichever card is on top.
 */
export default function Experience() {
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const ul = list.current;
    if (!ul) return;
    const items = Array.from(ul.querySelectorAll<HTMLElement>(".xp__item"));
    let raf = 0;
    const update = () => {
      raf = 0;
      items.forEach((el, i) => {
        const next = items[i + 1];
        if (!next) return;
        const covered = next.getBoundingClientRect().top - el.getBoundingClientRect().top < el.offsetHeight * 0.55;
        el.classList.toggle("is-under", covered);
      });
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section id="experience" className="xp" data-cue="experience" aria-labelledby="xp-title" style={{ "--n": ROLES.length } as CSSProperties}>
      <div className="wrap xp__head">
        <Eyebrow>{ROLES_INTRO.eyebrow}</Eyebrow>
        <h2 id="xp-title" className="h2" data-rv>
          <SplitWords text={ROLES_INTRO.title} />
        </h2>
        <Scramble as="p" className="lede" text={ROLES_INTRO.text} duration={1100} />
      </div>
      <ul className="xp__list" ref={list}>
        {ROLES.map((r, i) => (
          <li key={r.num} className="xp__item" style={{ "--i": i, "--bg": r.bg } as CSSProperties}>
            <article className="wrap xp__grid">
              <p className="xp__num">{r.num}</p>
              <div>
                <h3 className="xp__title">{r.company}</h3>
                <p className="xp__role">{r.role}</p>
                <p className="xp__meta">
                  {r.period} · {r.place}
                </p>
              </div>
              <div className="xp__body">
                <p className="xp__sub">{r.sub}</p>
                <ul className="xp__points">
                  {r.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <figure className="xp__fig" data-liquid="">
                  <Img src={r.image} alt={r.imageAlt} sizes="(max-width: 809px) 92vw, 40vw" />
                </figure>
              </div>
            </article>
          </li>
        ))}
        <li className="xp__hold" aria-hidden="true" />
      </ul>
    </section>
  );
}
