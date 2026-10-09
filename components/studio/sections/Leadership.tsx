import type { CSSProperties } from "react";
import { LEADERSHIP, LEADERSHIP_INTRO } from "@/lib/content";
import { Eyebrow, Img, SplitWords } from "../primitives";

/**
 * Leadership and community: the club, the fest, the GDG chapter and open
 * source, each with the one number that says how big it was, beside two
 * photos from the room.
 */
export default function Leadership() {
  return (
    <section id="leadership" className="lead" data-cue="leadership" aria-labelledby="lead-title">
      <div className="wrap">
        <div className="lead__head">
          <Eyebrow>{LEADERSHIP_INTRO.eyebrow}</Eyebrow>
          <h2 id="lead-title" className="h2" data-rv>
            <SplitWords text={LEADERSHIP_INTRO.title} />
          </h2>
          <p className="lede rv" data-rv>
            {LEADERSHIP_INTRO.text}
          </p>
        </div>

        <div className="lead__grid">
          <div className="lead__photos">
            {LEADERSHIP_INTRO.photos.map((ph, i) => (
              <figure key={ph.src} className={`lead__fig lead__fig--${i} rv`} data-rv data-liquid="">
                <Img src={ph.src} alt={ph.alt} sizes="(max-width: 809px) 92vw, 36vw" />
              </figure>
            ))}
          </div>
          <ul className="lead__list">
            {LEADERSHIP.map((l, i) => (
              <li key={l.org} className="lrow rv" data-rv style={{ "--d": `${i * 0.06}s` } as CSSProperties}>
                <div className="lrow__top">
                  <p className="lrow__role">
                    {l.role} <span>· {l.period}</span>
                  </p>
                  {l.stat ? (
                    <p className="lrow__stat">
                      <b>{l.stat.value}</b>
                      {l.stat.label}
                    </p>
                  ) : null}
                </div>
                <h3 className="lrow__org">{l.org}</h3>
                <p className="lrow__text">{l.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
