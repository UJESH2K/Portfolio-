import type { CSSProperties } from "react";
import { SKILL_GROUPS } from "@/lib/content";
import { RESUME } from "@/lib/resume";
import { Cta, Eyebrow, SplitWords } from "../primitives";

export default function Skills() {
  return (
    <section id="skills" className="skills" aria-labelledby="skills-title">
      <div className="wrap">
        <div className="skills__head">
          <div>
            <Eyebrow>The stack</Eyebrow>
            <h2 id="skills-title" className="h2" style={{ marginTop: 18 }} data-rv>
              <SplitWords text="Tools I reach for." />
            </h2>
          </div>
          <Cta href={RESUME.href} width={300} download={RESUME.download} external={RESUME.external}>
            {RESUME.label}
          </Cta>
        </div>
        <div className="skills__grid">
          {SKILL_GROUPS.map((g, i) => (
            <div key={g.group} className="skills__group rv" data-rv style={{ "--d": `${(i % 3) * 0.07}s` } as CSSProperties}>
              <p className="skills__name">{g.group}</p>
              <ul className="skills__items">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
