"use client";

import { useEffect, useState } from "react";
import { RESUMES } from "@/lib/resume";
import { PROFILE } from "@/lib/content";

/**
 * The /resume page: every résumé, one at a time. On a laptop the real PDF
 * sits in the page (links in it work); phones get a picture of the page,
 * since their browsers rarely show a PDF inline, and a tap opens the PDF.
 * Switching résumés rewrites the address, so the link always points at the
 * one on screen.
 */
export default function ResumeView({ initial }: { initial: string }) {
  const [slug, setSlug] = useState(initial);
  const [inline, setInline] = useState(false);
  const [copied, setCopied] = useState(false);
  const r = RESUMES.find((x) => x.slug === slug) ?? RESUMES[0];

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
    // Browsers that can't show a PDF in the page (or have it switched off) get the picture.
    const canPdf = (navigator as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled !== false;
    const sync = () => setInline(mq.matches && canPdf);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    document.title = `${r.title} résumé — ${PROFILE.name}`;
  }, [r]);

  const pick = (next: string) => {
    if (next === slug) return;
    setSlug(next);
    setCopied(false);
    window.history.replaceState(window.history.state, "", `/resume/${next}`);
  };

  const copy = async () => {
    const url = `${window.location.origin}/resume/${r.slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const t = document.createElement("textarea");
      t.value = url;
      t.setAttribute("readonly", "");
      t.style.position = "fixed";
      t.style.opacity = "0";
      document.body.appendChild(t);
      t.select();
      document.execCommand("copy");
      t.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="site rsite">
      <header className="rtop">
        <a href="/" className="rtop__home">
          <span aria-hidden="true">←</span> Portfolio
        </a>
        <span className="rtop__name">{PROFILE.name}</span>
      </header>

      <main className="rview">
        <aside className="rview__side">
          <p className="rmodal__eyebrow">Résumé</p>
          <h1 className="rview__title">
            Pick the one <em>that fits.</em>
          </h1>
          <p className="rview__lede">Three versions of the same story, each cut for a different role. Read it here, open the PDF or download it.</p>

          <nav className="rview__tabs" aria-label="Résumés">
            {RESUMES.map((k) => (
              <a
                key={k.slug}
                href={`/resume/${k.slug}`}
                className="rview__tab"
                aria-current={k.slug === r.slug ? "page" : undefined}
                onClick={(e) => {
                  if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                  e.preventDefault();
                  pick(k.slug);
                }}
              >
                <span className="rmodal__tile" style={{ background: k.tint }}>
                  <span style={{ background: k.band }} />
                  {k.short}
                </span>
                <span className="rmodal__name">
                  <b>{k.title}</b>
                  <span>{k.blurb}</span>
                </span>
              </a>
            ))}
          </nav>

          <p className="rview__about">{r.about}</p>

          <div className="rview__actions">
            <a className="plink plink--solid" href={r.file} target="_blank" rel="noopener noreferrer">
              Open PDF
            </a>
            <a className="plink" href={r.file} download>
              Download
            </a>
            <button type="button" className="plink" onClick={copy} aria-live="polite">
              {copied ? "Link copied ✓" : "Copy link"}
            </button>
          </div>
        </aside>

        <section className="rview__main" aria-label={`${r.title} résumé`}>
          <div className="rview__sheet">
            {inline ? (
              <iframe key={r.file} src={`${r.file}#view=FitH&navpanes=0`} title={`${r.title} résumé, PDF`} />
            ) : (
              <a href={r.file} target="_blank" rel="noopener noreferrer" aria-label={`Open the ${r.title} résumé as a PDF`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img key={r.preview} src={r.preview} alt={`${r.title} résumé of ${PROFILE.name}`} width={1400} height={1980} />
              </a>
            )}
          </div>
          {!inline && <p className="rview__hint">Tap the page to open the PDF, links included</p>}
        </section>
      </main>
    </div>
  );
}
