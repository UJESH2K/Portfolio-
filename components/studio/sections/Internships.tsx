import { INTERNSHIPS, INTERNSHIPS_INTRO } from "@/lib/content";
import HTrack from "../HTrack";
import { ArrowIcon, Eyebrow, Img, SplitWords } from "../primitives";

/**
 * Internships, on dark green, as a horizontal run: the heading, then one card
 * per internship sliding in from the right as you scroll down.
 */
export default function Internships() {
  return (
    <section id="internships" className="intern theme-green" data-cue="internships" aria-labelledby="intern-title">
      <HTrack label="Internships">
        <div className="hpanel hpanel--intro">
          <Eyebrow>{INTERNSHIPS_INTRO.eyebrow}</Eyebrow>
          <h2 id="intern-title" className="h2" data-rv>
            <SplitWords text={INTERNSHIPS_INTRO.title} />
          </h2>
          <p className="lede">{INTERNSHIPS_INTRO.text}</p>
          <p className="hpanel__hint" aria-hidden="true">
            <span className="hint-desk">Keep scrolling →</span>
            <span className="hint-touch">Swipe for more →</span>
          </p>
        </div>
        {INTERNSHIPS.map((r, i) => (
          <article key={r.company} className="hcard icard">
            {r.image ? (
              <figure className="hcard__fig" data-imgfx data-rv>
                <Img src={r.image} alt={r.imageAlt ?? r.company} sizes="(max-width: 809px) 92vw, 34vw" />
              </figure>
            ) : null}
            <div className="hcard__body">
              <p className="hcard__num">
                {String(i + 1).padStart(2, "0")} · {r.period} · {r.place}
              </p>
              <h3 className="hcard__title">{r.company}</h3>
              <p className="hcard__role">{r.role}</p>
              <p className="hcard__sub">{r.sub}</p>
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
          </article>
        ))}
      </HTrack>
    </section>
  );
}
