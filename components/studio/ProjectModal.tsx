"use client";

import { useEffect, useRef } from "react";
import { PROFILE } from "@/lib/content";
import { ArrowIcon, Img } from "./primitives";

/** What the details window shows; projects and GitHub repos both map to it. */
export type ProjectDetail = {
  title: string;
  headline?: string;
  text: string;
  context?: string;
  tags: string[];
  image?: string;
  imageAlt?: string;
  live?: string;
  code?: string;
  youtube?: string;
};

/**
 * The details window for a project: the whole description (cards only show
 * a few lines), what it's built with, and every link it has. If there is no
 * public link it says so and offers email instead of leading nowhere.
 */
export default function ProjectModal({ item, onClose }: { item: ProjectDetail | null; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!item) return;
    const lenis = (window as unknown as { __lenis?: { stop: () => void; start: () => void } }).__lenis;
    const back = document.activeElement as HTMLElement | null;
    lenis?.stop();
    document.documentElement.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = "";
      lenis?.start();
      back?.focus?.();
    };
  }, [item, onClose]);

  if (!item) return null;
  const hasLink = item.live || item.code || item.youtube;
  return (
    <div className="pmodal" role="dialog" aria-modal="true" aria-labelledby="pmodal-title">
      <div className="pmodal__backdrop" onClick={onClose} />
      <div className="pmodal__panel" data-lenis-prevent>
        <button ref={closeRef} type="button" className="pmodal__close" aria-label="Close" onClick={onClose}>
          <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M3 3l14 14M17 3L3 17" stroke="currentColor" strokeWidth="1.6" />
          </svg>
        </button>
        {item.image ? (
          <figure className="pmodal__fig">
            <Img src={item.image} alt={item.imageAlt ?? item.title} sizes="(max-width: 809px) 92vw, 720px" eager />
          </figure>
        ) : null}
        <div className="pmodal__body">
          {item.context ? <p className="pmodal__context">{item.context}</p> : null}
          <h3 id="pmodal-title" className="pmodal__title">
            {item.title}
          </h3>
          {item.headline ? <p className="pmodal__headline">{item.headline}</p> : null}
          <p className="pmodal__text">{item.text || "No description yet. The code says the rest."}</p>
          {item.tags.length ? (
            <ul className="pcard__stack" aria-label="Built with">
              {item.tags.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ) : null}
          <div className="pmodal__links">
            {item.live ? (
              <a className="plink plink--solid" href={item.live} target="_blank" rel="noopener noreferrer">
                Live site <ArrowIcon />
              </a>
            ) : null}
            {item.code ? (
              <a className="plink" href={item.code} target="_blank" rel="noopener noreferrer">
                Code on GitHub <ArrowIcon />
              </a>
            ) : null}
            {item.youtube ? (
              <a className="plink" href={item.youtube} target="_blank" rel="noopener noreferrer">
                Watch the video <ArrowIcon />
              </a>
            ) : null}
            {!hasLink ? (
              <>
                <p className="pmodal__note">This one isn&apos;t public, but I&apos;m happy to walk you through it.</p>
                <a className="plink plink--solid" href={`mailto:${PROFILE.email}?subject=${encodeURIComponent(`About ${item.title}`)}`}>
                  Email me about it <ArrowIcon />
                </a>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
