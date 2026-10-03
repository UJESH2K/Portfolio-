import type { CSSProperties } from "react";
import { HACK_WALL } from "@/lib/content";
import { Eyebrow, Img, SplitWords } from "../primitives";

/**
 * The hackathon wall: an editorial collage of every winning photo. Each one
 * ripples under the liquid effect (LiquidMedia, via `data-liquid`), lifts on
 * hover, catches a light sheen, and slides up its event and result.
 */
export default function HackWall() {
  return (
    <section id="wall" className="wall" data-cue="wall" aria-labelledby="wall-title">
      <div className="wrap">
        <div className="wall__head">
          <Eyebrow>{HACK_WALL.eyebrow}</Eyebrow>
          <h2 id="wall-title" className="h2" data-rv>
            <SplitWords text={HACK_WALL.title} />
          </h2>
          <p className="lede rv" data-rv>
            {HACK_WALL.text}
          </p>
        </div>
        <ul className="wall__grid">
          {HACK_WALL.photos.map((ph, i) => (
            <li
              key={ph.src}
              className={`wall__tile rv${ph.wide ? " is-wide" : ""}${ph.tall ? " is-tall" : ""}`}
              data-rv
              style={{ "--d": `${(i % 4) * 0.06}s` } as CSSProperties}
            >
              <figure className="wall__fig" data-liquid="">
                <Img src={ph.src} alt={ph.alt} sizes={ph.wide ? "(max-width: 809px) 92vw, 50vw" : "(max-width: 809px) 46vw, 25vw"} />
                <span className="wall__shine" aria-hidden="true" />
                <figcaption className="wall__cap">
                  <b>{ph.event}</b>
                  {ph.result ? <span>{ph.result}</span> : null}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
