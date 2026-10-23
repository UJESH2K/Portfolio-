"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import IconFolder, { type FolderIcon } from "@/components/ui/icon-folder";
import { RESUMES, RESUME_EVENT, openResumePicker, type ResumeKind } from "@/lib/resume";
import { SOCIALS } from "@/lib/content";

/** A tiny page for the folder tile: a coloured band, the short name, lines of text. */
function PageTile({ r }: { r: ResumeKind }) {
  return (
    <span className="rpage" style={{ background: r.tint }}>
      <span className="rpage__band" style={{ background: r.band }} />
      <b>{r.short}</b>
      <i />
      <i />
      <i />
    </span>
  );
}

const DocIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M7 3h7l5 5v11a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    <path d="M14 3v5h5M8.5 13h7M8.5 16.5h5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

/** The "Résumé" button in the header. */
export function ResumeButton() {
  return (
    <button type="button" className="rbtn" onClick={openResumePicker} aria-haspopup="dialog">
      <DocIcon />
      <span>Résumé</span>
    </button>
  );
}

/**
 * The résumé picker: a folder with one page per résumé fanned out of it, and
 * the same résumés listed below to open in the browser or download. A résumé
 * whose PDF isn't uploaded yet shows as "coming soon".
 */
export default function ResumePicker() {
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState<Record<string, boolean>>({});
  // How far apart the pages fan: as wide as the card allows, up to 76px.
  const [spread, setSpread] = useState(76);
  const linkedin = SOCIALS.find((s) => s.id === "linkedin")?.href;

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const onOpen = () => {
      const room = Math.min(640, window.innerWidth - 32) - 2 * Math.min(36, Math.max(22, window.innerWidth * 0.04));
      setSpread(Math.max(40, Math.min(76, Math.floor((room - 132) / 3 / 1.15))));
      setOpen(true);
    };
    window.addEventListener(RESUME_EVENT, onOpen);
    return () => window.removeEventListener(RESUME_EVENT, onOpen);
  }, []);

  // Which PDFs exist, checked once the first time the picker opens.
  useEffect(() => {
    if (!open || Object.keys(ready).length) return;
    Promise.all(
      RESUMES.map((r) =>
        fetch(r.file, { method: "HEAD" })
          .then((res) => [r.id, res.ok && (res.headers.get("content-type") ?? "").includes("pdf")] as const)
          .catch(() => [r.id, false] as const),
      ),
    ).then((pairs) => setReady(Object.fromEntries(pairs)));
  }, [open, ready]);

  // Esc closes; the page stops scrolling underneath.
  useEffect(() => {
    if (!open) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      document.documentElement.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  const icons = useMemo<FolderIcon[]>(() => RESUMES.map((r) => ({ label: r.title, background: r.tint, node: <PageTile r={r} /> })), []);
  const openPdf = (i: number) => {
    const r = RESUMES[i];
    if (ready[r.id]) window.open(r.file, "_blank", "noopener");
  };

  if (!open) return null;
  return createPortal(
    <div className="rmodal" role="dialog" aria-modal="true" aria-labelledby="rmodal-title">
      <div className="rmodal__backdrop" onClick={close} />
      <div className="rmodal__card">
        <button type="button" className="rmodal__close" onClick={close} aria-label="Close">
          ×
        </button>
        <p className="rmodal__eyebrow">Résumé</p>
        <h2 id="rmodal-title" className="rmodal__title">
          Pick the one <em>that fits.</em>
        </h2>
        <p className="rmodal__lede">Four versions of the same story, each cut for a different role. Open one in the browser or download the PDF.</p>

        <div className="rmodal__folder">
          <IconFolder theme="light" title="Ujesh's résumés" tags={RESUMES.map((r) => r.title)} icons={icons} defaultOpen spread={spread} showPill={false} onIconClick={openPdf} />
        </div>

        <ul className="rmodal__list">
          {RESUMES.map((r) => {
            const ok = ready[r.id];
            return (
              <li key={r.id} className={ok === false ? "is-soon" : undefined}>
                <span className="rmodal__tile" style={{ background: r.tint }}>
                  <span style={{ background: r.band }} />
                  {r.short}
                </span>
                <span className="rmodal__name">
                  <b>{r.title}</b>
                  <span>{ok === false ? "Coming soon" : r.blurb}</span>
                </span>
                {ok ? (
                  <span className="rmodal__actions">
                    <a className="plink" href={r.file} target="_blank" rel="noopener noreferrer">
                      Open
                    </a>
                    <a className="plink plink--solid" href={r.file} download>
                      Download
                    </a>
                  </span>
                ) : ok === false ? (
                  linkedin ? (
                    <a className="plink" href={linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  ) : null
                ) : (
                  <span className="rmodal__wait" aria-hidden="true" />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>,
    document.body,
  );
}

/** A link that opens the picker (falls back to its href without JavaScript). */
export function ResumeLink({ href, className, children }: { href: string; className?: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        openResumePicker();
      }}
    >
      {children}
    </a>
  );
}
