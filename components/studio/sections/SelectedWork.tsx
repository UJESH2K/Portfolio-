"use client";

import { useState, type CSSProperties } from "react";
import { PROFILE, SOCIALS, WORK, WORK_FILTERS, WORK_INTRO, type WorkItem, type WorkKind } from "@/lib/content";
import { ArrowIcon, Cta, Eyebrow, Img, SplitWords } from "../primitives";
import Scramble from "../Scramble";

const KIND_LABEL: Record<WorkKind, string> = {
  hackathon: "Hackathon build",
  research: "Research",
  side: "Side project",
};

/** A light typographic cover for work without a screenshot. */
function Cover({ item }: { item: WorkItem }) {
  if (!item.cover) return null;
  return (
    <div className="pcover" aria-hidden="true">
      <span className="pcover__kind">{KIND_LABEL[item.kind]}</span>
      <span className="pcover__stat">{item.cover.stat}</span>
      <span className="pcover__label">{item.cover.label}</span>
    </div>
  );
}

function Card({ item, index }: { item: WorkItem; index: number }) {
  const main = item.live ?? item.code;
  // A short demo clip plays over the screenshot while the card is hovered.
  const play = (e: React.PointerEvent<HTMLElement>, on: boolean) => {
    const v = e.currentTarget.querySelector("video");
    if (!v) return;
    if (on) {
      if (v.preload !== "auto") v.preload = "auto";
      void v.play().catch(() => {});
    } else v.pause();
  };
  const media = (
    <figure className="pcard__media" data-liquid={item.image ? "" : undefined}>
      {item.image ? (
        <Img
          src={item.image}
          alt={item.imageAlt ?? item.title}
          sizes={item.featured ? "(max-width: 809px) 92vw, 46vw" : "(max-width: 809px) 92vw, 30vw"}
        />
      ) : (
        <Cover item={item} />
      )}
      {item.video ? <video className="pcard__video" src={item.video} muted loop playsInline preload="none" aria-hidden="true" /> : null}
    </figure>
  );
  return (
    <li
      className={`pcard${item.featured ? " pcard--feature" : ""}`}
      style={{ "--d": `${(index % 3) * 0.06}s` } as CSSProperties}
      onPointerEnter={(e) => play(e, true)}
      onPointerLeave={(e) => play(e, false)}
    >
      {main ? (
        <a className="pcard__mediaLink" href={main} target="_blank" rel="noopener noreferrer" tabIndex={-1} aria-hidden="true">
          {media}
        </a>
      ) : (
        media
      )}
      <div className="pcard__body">
        <p className="pcard__kicker">
          <span className={`pcard__kind pcard__kind--${item.kind}`}>{KIND_LABEL[item.kind]}</span>
          <span>{item.context}</span>
        </p>
        <h3 className="pcard__title">
          {item.title}
          <span className="pcard__headline">{item.headline}</span>
        </h3>
        <p className="pcard__text">{item.text}</p>
        <ul className="pcard__stack" aria-label="Built with">
          {item.stack.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <div className="pcard__links">
          {item.live ? (
            <a className="plink plink--solid" href={item.live} target="_blank" rel="noopener noreferrer">
              Live site <ArrowIcon />
            </a>
          ) : null}
          {item.code ? (
            <a className="plink" href={item.code} target="_blank" rel="noopener noreferrer">
              Code <ArrowIcon />
            </a>
          ) : null}
          {!item.live && !item.code ? (
            <a className="plink" href="#contact">
              Ask me about it <ArrowIcon />
            </a>
          ) : null}
        </div>
      </div>
    </li>
  );
}

/**
 * Projects: the index of things built, filterable by kind, with live links
 * and code where they exist. Internships and client work have their own
 * sections (#internships, #freelance), so nothing is listed twice.
 */
export default function SelectedWork() {
  const [kind, setKind] = useState<WorkKind | "all">("all");
  const github = SOCIALS.find((s) => s.id === "github")?.href ?? "https://github.com/UJESH2K";
  const shown = WORK.filter((w) => kind === "all" || w.kind === kind);

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

        <div className="work__filters" role="group" aria-label="Show projects by kind">
          {WORK_FILTERS.map((f) => {
            const count = f.id === "all" ? WORK.length : WORK.filter((w) => w.kind === f.id).length;
            return (
              <button key={f.id} type="button" className="chip" aria-pressed={kind === f.id} onClick={() => setKind(f.id)}>
                {f.label}
                <sup>{count}</sup>
              </button>
            );
          })}
        </div>

        <ol className={`work__grid${kind === "all" ? "" : " is-filtered"}`} key={kind}>
          {shown.map((w, i) => (
            <Card key={w.id} item={w} index={i} />
          ))}
        </ol>

        <div className="work__cta rv" data-rv>
          <Cta href={github} external width={320}>
            {`${PROFILE.publicRepos}+ more on GitHub`}
          </Cta>
        </div>
      </div>
    </section>
  );
}
