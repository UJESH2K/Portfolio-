import { RESEARCH, RESEARCH_INTRO, type Paper } from "@/lib/content";
import HTrack from "../HTrack";
import { ArrowIcon, Eyebrow, Img, SplitWords } from "../primitives";
import { GradMeshVisual, OssVisual, VendorsVisual, ViksitVisual } from "./WorkVisual";

function Visual({ v }: { v: Paper["visual"] }) {
  if (v === "gradmesh") return <GradMeshVisual />;
  if (v === "viksit") return <ViksitVisual />;
  if (v === "vendors") return <VendorsVisual />;
  return <OssVisual />;
}

/**
 * Research, on black, as a horizontal run: the heading beside a photo of him
 * presenting results, then the papers as cards sliding past as you scroll.
 */
export default function Research() {
  return (
    <section id="research" className="research theme-dark" data-cue="research" aria-labelledby="research-title">
      <HTrack label="Research">
        <div className="hpanel hpanel--intro">
          <Eyebrow>{RESEARCH_INTRO.eyebrow}</Eyebrow>
          <h2 id="research-title" className="h2" data-rv>
            <SplitWords text={RESEARCH_INTRO.title} />
          </h2>
          <p className="lede">{RESEARCH_INTRO.text}</p>
          <p className="hpanel__hint" aria-hidden="true">
            <span className="hint-desk">Keep scrolling →</span>
            <span className="hint-touch">Swipe for more →</span>
          </p>
        </div>
        <figure className="hphoto hphoto--wide research__photo" data-imgfx data-rv>
          <Img src={RESEARCH_INTRO.photo.src} alt={RESEARCH_INTRO.photo.alt} sizes="(max-width: 809px) 92vw, 44vw" />
          <figcaption>{RESEARCH_INTRO.photo.caption}</figcaption>
        </figure>
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
            <article key={r.title} className="rcard">
              {r.href ? (
                <a href={r.href} target="_blank" rel="noopener noreferrer" style={{ display: "contents" }}>
                  {Inner}
                </a>
              ) : (
                Inner
              )}
            </article>
          );
        })}
      </HTrack>
    </section>
  );
}
