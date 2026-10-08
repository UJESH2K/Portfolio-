import { FOOTER, PROFILE, SITE_NAV, SOCIALS, WORK, isMissing } from "@/lib/content";
import type { CSSProperties } from "react";
import { ArrowIcon } from "../primitives";

export default function Footer() {
  const socials = SOCIALS.filter((s) => s.id !== "email" && !isMissing(s.href));
  return (
    <footer id="contact" className="footer" data-cue="contact">
      <div className="wrap">
        <div className="footer__top">
          <div>
            <h2 className="footer__title" data-rv aria-label={FOOTER.title}>
              {Array.from(FOOTER.title).map((ch, i) => (
                <span key={i} className="footer__ch" aria-hidden="true" style={{ "--i": i } as CSSProperties}>
                  {ch === " " ? " " : ch}
                </span>
              ))}
            </h2>
            <a className="footer__mail" href={`mailto:${PROFILE.email}`}>
              {PROFILE.email}
            </a>
          </div>
          <p className="footer__blurb">{FOOTER.blurb}</p>
        </div>

        <div className="footer__grid">
          <ul className="footer__socials">
            {socials.map((s) => (
              <li key={s.id}>
                <a href={s.href} target="_blank" rel="noopener noreferrer">
                  {s.label}
                  <ArrowIcon />
                </a>
              </li>
            ))}
          </ul>
          <div className="footer__col">
            <p className="footer__h">Navigation</p>
            <ul>
              {SITE_NAV.map((l) => (
                <li key={l.href}>
                  <a href={l.href}>{l.label}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer__col">
            <p className="footer__h">Latest work</p>
            <ul>
              {WORK.slice(0, 5).map((w) => (
                <li key={w.id}>
                  <a href="#work">{w.title}</a>
                </li>
              ))}
            </ul>
          </div>
          <div className="footer__col">
            <p className="footer__h">Contact & credits</p>
            <ul>
              <li>
                <a href={`mailto:${PROFILE.email}`}>Email</a>
              </li>
              <li>{PROFILE.location}</li>
              <li>
                <a href={PROFILE.resumeUrl} download>
                  Résumé (PDF)
                </a>
              </li>
              {FOOTER.credits.map((c) => (
                <li key={c.href} className="footer__credit">
                  <a href={c.href} target="_blank" rel="noopener noreferrer">
                    {c.label}
                  </a>
                  , licensed{" "}
                  <a href={c.licenseHref} target="_blank" rel="noopener noreferrer">
                    {c.license}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="footer__bottom">
          <span className="footer__mark">
            Ujesh Yadav<sup>®</sup>
          </span>
          <span className="footer__copy">© 2026 {PROFILE.name}. Built by hand in Bengaluru.</span>
          <a className="footer__top-link" href="#top">
            Back to top ↑
          </a>
        </div>
      </div>
    </footer>
  );
}
