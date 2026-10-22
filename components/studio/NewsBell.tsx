"use client";

import { useEffect, useRef, useState } from "react";
import { NEWS, SOCIALS, isMissing } from "@/lib/content";
import { goTo } from "@/lib/robot";

const SEEN_KEY = "ujesh:news-seen";

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M23 7.2a3 3 0 0 0-2.1-2.1C19 4.6 12 4.6 12 4.6s-7 0-8.9.5A3 3 0 0 0 1 7.2 31 31 0 0 0 .5 12a31 31 0 0 0 .5 4.8 3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.8 31 31 0 0 0-.5-4.8ZM9.7 15.1V8.9l5.8 3.1-5.8 3.1Z"
      />
    </svg>
  );
}

/**
 * The bell in the header: what's new (from NEWS, editable at /edit), with a
 * dot until the visitor has opened it, and the YouTube channel beside it
 * once its link is set.
 */
export default function NewsBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const youtube = SOCIALS.find((s) => s.id === "youtube");
  const latest = NEWS[0]?.id ?? "";

  useEffect(() => {
    try {
      setUnread(!!latest && localStorage.getItem(SEEN_KEY) !== latest);
    } catch {
      setUnread(!!latest);
    }
  }, [latest]);

  useEffect(() => {
    if (!open) return;
    try {
      localStorage.setItem(SEEN_KEY, latest);
    } catch {
      // Private mode: the dot just comes back next visit.
    }
    setUnread(false);
    const onDown = (e: PointerEvent) => {
      if (!panel.current?.parentElement?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, latest]);

  if (!NEWS.length && (!youtube || isMissing(youtube.href))) return null;

  return (
    <div className="newsbell">
      {youtube && !isMissing(youtube.href) ? (
        <a className="newsbell__yt" href={youtube.href} target="_blank" rel="noopener noreferrer" aria-label="YouTube channel">
          <YouTubeIcon />
        </a>
      ) : null}
      {NEWS.length ? (
        <>
          <button
            type="button"
            className="newsbell__btn"
            aria-label={unread ? "What's new (unread)" : "What's new"}
            aria-expanded={open}
            onClick={() => setOpen((o) => !o)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9a6 6 0 1 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            {unread ? <i className="newsbell__dot" /> : null}
          </button>
          {open ? (
            <div ref={panel} className="newsbell__panel" role="dialog" aria-label="What's new" data-lenis-prevent>
              <p className="newsbell__head">What&apos;s new</p>
              <ul>
                {NEWS.map((n) => {
                  const external = n.href && /^https?:/.test(n.href);
                  return (
                    <li key={n.id}>
                      <a
                        href={n.href || "#top"}
                        target={external ? "_blank" : undefined}
                        rel={external ? "noopener noreferrer" : undefined}
                        onClick={(e) => {
                          if (!n.href || external) return;
                          e.preventDefault();
                          setOpen(false);
                          goTo(n.href);
                        }}
                      >
                        <span className="newsbell__tag">
                          {n.tag}
                          {n.date ? <em>{new Date(n.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</em> : null}
                        </span>
                        <span className="newsbell__text">{n.text}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
              {youtube && !isMissing(youtube.href) ? (
                <a className="plink plink--solid newsbell__ytlink" href={youtube.href} target="_blank" rel="noopener noreferrer">
                  Watch on YouTube
                </a>
              ) : null}
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
