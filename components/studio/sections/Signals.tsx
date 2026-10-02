import { SIGNALS } from "@/lib/content";
import Scramble from "../Scramble";

/** Where the work has landed: a short intro and an endless name marquee. */
export default function Signals() {
  const items = [...SIGNALS.items, ...SIGNALS.items];
  return (
    <section className="signals" data-cue="signals" aria-label={SIGNALS.label}>
      <div className="wrap">
        <div className="signals__intro">
          <p className="signals__label">{SIGNALS.label.toUpperCase()}</p>
          <Scramble as="p" className="signals__text" text={SIGNALS.text} duration={1100} />
        </div>
      </div>
      <div className="marquee" role="group" aria-label={SIGNALS.label}>
        <ul className="marquee__track">
          {items.map((s, i) => (
            <li key={i} className="marquee__item" aria-hidden={i >= SIGNALS.items.length || undefined}>
              <span className="marquee__name">{s.name}</span>
              <span className="marquee__tag">{s.tag}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
