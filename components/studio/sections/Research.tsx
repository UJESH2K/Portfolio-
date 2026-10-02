"use client";

import { useEffect, useRef, useState } from "react";
import { RESEARCH, RESEARCH_INTRO, type Paper } from "@/lib/content";
import { ArrowIcon, Eyebrow, SplitWords } from "../primitives";
import Scramble from "../Scramble";
import { GradMeshVisual, OssVisual, VendorsVisual, ViksitVisual } from "./WorkVisual";

function Visual({ v }: { v: Paper["visual"] }) {
  if (v === "gradmesh") return <GradMeshVisual />;
  if (v === "viksit") return <ViksitVisual />;
  if (v === "vendors") return <VendorsVisual />;
  return <OssVisual />;
}

const Chevron = ({ flip }: { flip?: boolean }) => (
  <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" style={flip ? { transform: "scaleX(-1)" } : undefined}>
    <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

/** Papers and work in progress, as a horizontal strip with arrow controls. */
export default function Research() {
  const strip = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;
    const update = () => {
      setAtStart(el.scrollLeft < 8);
      setAtEnd(el.scrollLeft + el.clientWidth > el.scrollWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const nudge = (dir: 1 | -1) => {
    const el = strip.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>(".rcard");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 400) + 20), behavior: "smooth" });
  };

  return (
    <section id="research" className="research" data-cue="research" aria-labelledby="research-title">
      <div className="wrap research__head">
        <div className="research__headtxt">
          <Eyebrow>{RESEARCH_INTRO.eyebrow}</Eyebrow>
          <h2 id="research-title" className="h2" data-rv>
            <SplitWords text={RESEARCH_INTRO.title} />
          </h2>
          <Scramble as="p" className="lede" text={RESEARCH_INTRO.text} duration={1100} />
        </div>
        <div className="research__nav">
          <button className="arrow" type="button" aria-label="Previous" disabled={atStart} onClick={() => nudge(-1)}>
            <Chevron flip />
          </button>
          <button className="arrow" type="button" aria-label="Next" disabled={atEnd} onClick={() => nudge(1)}>
            <Chevron />
          </button>
        </div>
      </div>

      <div className="research__strip" ref={strip} data-lenis-prevent-wheel>
        <ul className="research__track">
          {RESEARCH.map((r) => {
            const Inner = (
              <>
                <div className="rcard__meta">
                  <span className={`pill${r.status === "Accepted" ? " pill--hot" : ""}`}>{r.status}</span>
                  <span className="pill">{r.date}</span>
                </div>
                <figure className="rcard__fig">
                  <Visual v={r.visual} />
                </figure>
                <div className="rcard__txt">
                  <p className="rcard__kind">{r.kind}</p>
                  <h3 className="rcard__title">{r.title}</h3>
                  <p className="rcard__venue">{r.venue}</p>
                  <p className="rcard__text">{r.text}</p>
                  {r.href ? (
                    <span className="rcard__more">
                      Open <ArrowIcon />
                    </span>
                  ) : null}
                </div>
              </>
            );
            return (
              <li key={r.title} className="rcard rv" data-rv>
                {r.href ? (
                  <a href={r.href} target="_blank" rel="noopener noreferrer" style={{ display: "contents" }}>
                    {Inner}
                  </a>
                ) : (
                  Inner
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
