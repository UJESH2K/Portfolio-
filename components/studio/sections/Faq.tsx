"use client";

import { useState } from "react";
import { FAQS, FAQ_INTRO, PROFILE } from "@/lib/content";
import { Cta, SplitWords } from "../primitives";

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="faq" data-cue="faq" aria-labelledby="faq-title">
      <div className="wrap faq__grid">
        <div className="faq__left">
          <h2 id="faq-title" className="faq__h2" data-rv>
            {FAQ_INTRO.title.map((l, i) => (
              <span key={l} style={{ display: "block" }}>
                <SplitWords text={l} delay={i * 0.1} />
              </span>
            ))}
          </h2>
          <p className="eyebrow rv" data-rv>
            {FAQ_INTRO.label}
          </p>
          <div className="rv" data-rv>
            <Cta href={`mailto:${PROFILE.email}`} width={270}>
              {FAQ_INTRO.cta}
            </Cta>
          </div>
        </div>
        <ul className="faq__list">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q} className={`faq__item rv${isOpen ? " is-open" : ""}`} data-rv>
                <h3 style={{ margin: 0 }}>
                  <button
                    type="button"
                    className="faq__q"
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    id={`faq-q-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                  >
                    {f.q}
                    <span className="faq__plus" aria-hidden="true" />
                  </button>
                </h3>
                <div className="faq__a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                  <div>
                    <p>{f.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
