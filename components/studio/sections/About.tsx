import { ABOUT } from "@/lib/content";
import { RESUME } from "@/lib/resume";
import { Cta, Img, SplitWords } from "../primitives";
import Scramble from "../Scramble";

/**
 * The short version: a two-line heading, a few paragraphs and the degree on
 * one side, a big photo of him on stage on the other. (Client screen
 * recordings live with the client work, in #freelance.)
 */
export default function About() {
  return (
    <section id="about" className="about" data-cue="about" aria-labelledby="about-title">
      <div className="wrap">
        <h2 id="about-title" className="about__h2" data-rv>
          {ABOUT.title.map((l, i) => (
            <span key={l} className="about__line">
              <SplitWords text={l} delay={i * 0.15} />
            </span>
          ))}
        </h2>

        <div className="about__stage">
          <div className="about__aside">
            <p className="about__label">{ABOUT.label}</p>
            <div className="about__text">
              {ABOUT.paragraphs.map((p) => (
                <Scramble key={p} as="p" text={p} duration={1400} />
              ))}
            </div>
            <div className="about__edu rv" data-rv>
              <strong>{ABOUT.education.degree}</strong>
              {ABOUT.education.school} · {ABOUT.education.period}
            </div>
            <div className="about__row">
              <Cta href={RESUME.href} width={260} download={RESUME.download} external={RESUME.external}>
                {RESUME.label}
              </Cta>
            </div>
          </div>

          <figure className="about__photo" data-liquid="">
            <Img src={ABOUT.portrait} alt={ABOUT.portraitAlt} sizes="(max-width: 809px) 92vw, 48vw" />
          </figure>
        </div>
      </div>
    </section>
  );
}
