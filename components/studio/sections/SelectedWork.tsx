"use client";

import { useEffect, useRef } from "react";
import { PROFILE, SOCIALS, WORK, WORK_INTRO, type WorkCard } from "@/lib/content";
import { ArrowIcon, Cta, Eyebrow, Img, SplitWords } from "../primitives";
import Scramble from "../Scramble";
import { BlockPartyVisual, GradMeshVisual } from "./WorkVisual";

function Visual({ card }: { card: WorkCard }) {
  if (card.visual === "gradmesh") return <GradMeshVisual />;
  if (card.visual === "blockparty") return <BlockPartyVisual />;
  if (card.image)
    return (
      <Img
        src={card.image}
        alt={card.imageAlt ?? card.title}
        sizes={card.span === "full" ? "(max-width: 809px) 92vw, 80vw" : "(max-width: 809px) 92vw, 55vw"}
      />
    );
  return null;
}

/**
 * Selected work: an asymmetric grid where a pill reading "View project"
 * replaces the cursor over each card. Cards without a public link still get
 * the hover treatment but read "Ask me about it" and jump to contact.
 */
export default function SelectedWork() {
  const cursor = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const github = SOCIALS.find((s) => s.id === "github")?.href ?? "https://github.com/UJESH2K";

  useEffect(() => {
    const el = cursor.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    let x = -200;
    let y = -200;
    let tx = -200;
    let ty = -200;
    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    };
    loop();
    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      const card = (e.target as HTMLElement).closest?.("[data-card]") as HTMLElement | null;
      el.classList.toggle("is-on", !!card);
      if (card && label.current) label.current.textContent = card.dataset.card ?? "View project";
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <section id="work" className="work" data-cue="work" aria-labelledby="work-title">
      <div className="wrap">
        <div className="work__top">
          <Eyebrow>{WORK_INTRO.eyebrow}</Eyebrow>
          <h2 id="work-title" className="h2" data-rv>
            {WORK_INTRO.title.map((line, i) => (
              <span key={line} style={{ display: "block" }}>
                <SplitWords text={line} delay={i * 0.12} />
              </span>
            ))}
          </h2>
          <Scramble as="p" className="lede" text={WORK_INTRO.text} duration={1300} />
        </div>

        <ol className="work__grid">
          {WORK.map((w, i) => {
            const external = !!w.href;
            const href = w.href ?? "#contact";
            return (
              <li key={w.id} className={`wcard wcard--${w.span} rv`} data-rv>
                <a
                  className="wcard__link"
                  href={href}
                  target={external ? "_blank" : undefined}
                  rel={external ? "noopener noreferrer" : undefined}
                  data-card={external ? w.linkLabel ?? "View project" : "Ask me about it"}
                  aria-label={`${w.title}: ${w.headline}`}
                >
                  <figure className="wcard__fig">
                    <Visual card={w} />
                    <figcaption className="wcard__tags">
                      {w.tags.map((t) => (
                        <span key={t} className="wcard__tag">
                          {t}
                        </span>
                      ))}
                    </figcaption>
                  </figure>
                  <div className="wcard__art">
                    <span className="wcard__dot" aria-hidden="true" />
                    <div>
                      <span className="wcard__kicker">
                        {String(i + 1).padStart(2, "0")} / {String(WORK.length).padStart(2, "0")} · {w.context}
                      </span>
                      <h3 className="wcard__title">
                        {w.title}: {w.headline}
                      </h3>
                      <p className="wcard__text">{w.text}</p>
                    </div>
                    <span className="wcard__ic" aria-hidden="true">
                      <ArrowIcon />
                    </span>
                  </div>
                </a>
              </li>
            );
          })}
        </ol>

        <div className="work__cta rv" data-rv>
          <Cta href={github} external width={320}>
            {`${PROFILE.publicRepos}+ more on GitHub`}
          </Cta>
        </div>
      </div>

      <div className="wcursor" ref={cursor} aria-hidden="true">
        <span className="wcursor__in">
          <span ref={label}>View project</span>
          <ArrowIcon />
        </span>
      </div>
    </section>
  );
}
