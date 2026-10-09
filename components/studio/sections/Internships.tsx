import type { CSSProperties } from "react";
import { INTERNSHIPS, INTERNSHIPS_INTRO } from "@/lib/content";
import { ArrowIcon, Eyebrow, Img, SplitWords } from "../primitives";

/**
 * Internships, one row each: who and when on the left, what got built in
 * the middle, a picture from the work on the right. Plain document flow:
 * nothing is pinned, so no row ever covers another or its image.
 */
export default function Internships() {
  return (
    <section id="internships" className="intern" data-cue="internships" aria-labelledby="intern-title">
      <div className="wrap">
        <div className="intern__head">
          <Eyebrow>{INTERNSHIPS_INTRO.eyebrow}</Eyebrow>
          <h2 id="intern-title" className="h2" data-rv>
            <SplitWords text={INTERNSHIPS_INTRO.title} />
          </h2>
          <p className="lede rv" data-rv>
            {INTERNSHIPS_INTRO.text}
          </p>
        </div>

        <ol className="intern__list">
          {INTERNSHIPS.map((r, i) => (
            <li key={r.company} className={`irow rv${r.image ? "" : " irow--text"}`} data-rv style={{ "--d": "0.05s" } as CSSProperties}>
              <div className="irow__meta">
                <span className="irow__num">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="irow__company">{r.company}</h3>
                <p className="irow__role">{r.role}</p>
                <p className="irow__when">
                  {r.period} · {r.place}
                </p>
              </div>
              <div className="irow__body">
                <p className="irow__sub">{r.sub}</p>
                <ul className="irow__points">
                  {r.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                {r.link ? (
                  <a className="plink" href={r.link.href} target="_blank" rel="noopener noreferrer">
                    {r.link.label} <ArrowIcon />
                  </a>
                ) : null}
                {r.note ? <p className="irow__note">{r.note}</p> : null}
              </div>
              {r.image ? (
                <figure className="irow__fig" data-liquid="">
                  <Img src={r.image} alt={r.imageAlt ?? r.company} sizes="(max-width: 809px) 92vw, 26vw" />
                </figure>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
