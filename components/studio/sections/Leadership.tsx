import { LEADERSHIP, LEADERSHIP_INTRO } from "@/lib/content";
import HTrack from "../HTrack";
import { Eyebrow, Img, SplitWords } from "../primitives";

/**
 * Leadership and community as a horizontal run: the heading, a photo, the
 * roles as cards (each with the one number that says how big it was), and a
 * second photo, sliding past as you scroll down.
 */
export default function Leadership() {
  const [first, second] = LEADERSHIP_INTRO.photos;
  return (
    <section id="leadership" className="lead" data-cue="leadership" aria-labelledby="lead-title">
      <HTrack label="Leadership & community">
        <div className="hpanel hpanel--intro">
          <Eyebrow>{LEADERSHIP_INTRO.eyebrow}</Eyebrow>
          <h2 id="lead-title" className="h2" data-rv>
            <SplitWords text={LEADERSHIP_INTRO.title} />
          </h2>
          <p className="lede">{LEADERSHIP_INTRO.text}</p>
          <p className="hpanel__hint" aria-hidden="true">
            <span className="hint-desk">Keep scrolling →</span>
            <span className="hint-touch">Swipe for more →</span>
          </p>
        </div>
        {first ? (
          <figure className="hphoto hphoto--tall" data-imgfx data-rv>
            <Img src={first.src} alt={first.alt} sizes="(max-width: 809px) 92vw, 30vw" />
          </figure>
        ) : null}
        {LEADERSHIP.map((l) => (
          <article key={l.org} className="hcard lcard">
            <div className="hcard__body">
              <p className="lrow__role">
                {l.role} <span>· {l.period}</span>
              </p>
              {l.stat ? (
                <p className="lcard__stat">
                  <b>{l.stat.value}</b>
                  {l.stat.label}
                </p>
              ) : null}
              <h3 className="hcard__title">{l.org}</h3>
              <p className="lrow__text">{l.text}</p>
            </div>
          </article>
        ))}
        {second ? (
          <figure className="hphoto hphoto--wide" data-imgfx data-rv>
            <Img src={second.src} alt={second.alt} sizes="(max-width: 809px) 92vw, 44vw" />
          </figure>
        ) : null}
      </HTrack>
    </section>
  );
}
