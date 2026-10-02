import type { CSSProperties } from "react";
import { STORY } from "@/lib/content";
import { Eyebrow, SplitWords } from "../primitives";

/**
 * "The story so far" — the life rather than the resume, laid out as a page
 * of comic issues. Each issue links to the section that tells it properly.
 */
export default function Story() {
  return (
    <section id="story" className="story" data-cue="story" aria-labelledby="story-title">
      <div className="wrap">
        <div className="story__head">
          <Eyebrow>{STORY.eyebrow}</Eyebrow>
          <h2 id="story-title" className="h2" data-rv>
            <SplitWords text={STORY.title} />
          </h2>
        </div>
        <ol className="story__grid">
          {STORY.chapters.map((c, i) => (
            <li key={c.issue} className="story__cell rv" data-rv style={{ "--d": `${(i % 4) * 0.06}s` } as CSSProperties}>
              <a className="story__card" href={c.href}>
                <span className="story__issue">{c.issue}</span>
                <span className="story__title">{c.title}</span>
                <span className="story__text">{c.text}</span>
                <span className="story__go" aria-hidden="true">
                  Read →
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
