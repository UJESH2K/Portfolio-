"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { PROFILE, SOCIALS, WORK, WORK_INTRO, type WorkItem, type WorkKind } from "@/lib/content";
import type { Repo } from "@/lib/github";
import ProjectModal, { type ProjectDetail } from "../ProjectModal";
import { ArrowIcon, Cta, Eyebrow, Img, SplitWords } from "../primitives";
import Scramble from "../Scramble";

const KIND_LABEL: Record<WorkKind, string> = {
  hackathon: "Hackathon build",
  research: "Research",
  side: "Side project",
};

type ArchiveItem = ProjectDetail & {
  key: string;
  group: "highlight" | "repo";
  /** Short label on the card: the kind of project, or the repo's language. */
  label: string;
  date?: string;
  stars?: number;
  cover?: { stat: string; label: string };
};

const fromWork = (w: WorkItem): ArchiveItem => ({
  key: w.id,
  group: "highlight",
  label: KIND_LABEL[w.kind],
  title: w.title,
  headline: w.headline,
  text: w.text,
  context: w.context,
  tags: w.stack,
  image: w.image,
  imageAlt: w.imageAlt,
  live: w.live,
  code: w.code,
  youtube: w.youtube,
  cover: w.cover,
});

const pretty = (name: string) => name.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();

const fromRepo = (r: Repo): ArchiveItem => ({
  key: `repo-${r.name}`,
  group: "repo",
  label: r.language || "Repo",
  title: pretty(r.name),
  text: r.description,
  context: `GitHub · updated ${r.pushed}`,
  tags: r.language ? [r.language] : [],
  live: r.homepage && /^https?:/.test(r.homepage) ? r.homepage : undefined,
  code: r.url,
  date: r.pushed,
  stars: r.stars,
});

/** A light typographic cover for work without a screenshot. */
function Cover({ item, small }: { item: ArchiveItem; small?: boolean }) {
  return (
    <div className={`pcover${small ? " pcover--small" : ""}`} aria-hidden="true">
      <span className="pcover__kind">{item.label}</span>
      <span className="pcover__stat">{item.cover?.stat ?? item.title}</span>
      {item.cover ? <span className="pcover__label">{item.cover.label}</span> : null}
    </div>
  );
}

/** A featured project: compact card, the whole thing opens the details. */
function Featured({ item, onOpen, index }: { item: ArchiveItem; onOpen: () => void; index: number }) {
  return (
    <li className="fcardp" style={{ "--d": `${index * 0.06}s` } as CSSProperties}>
      <button type="button" className="fcardp__hit" onClick={onOpen} aria-label={`${item.title}: details`}>
        <figure className="pcard__media" data-imgfx={item.image ? "" : undefined} data-rv>
          {item.image ? <Img src={item.image} alt={item.imageAlt ?? item.title} sizes="(max-width: 809px) 92vw, (max-width: 1100px) 46vw, 24vw" /> : <Cover item={item} />}
        </figure>
        <span className="pcard__kicker">
          <span className="pcard__kind">{item.label}</span>
        </span>
        <span className="pcard__title">
          {item.title}
          <span className="pcard__headline">{item.headline}</span>
        </span>
      </button>
      <div className="pcard__links">
        {item.live ? (
          <a className="plink plink--solid" href={item.live} target="_blank" rel="noopener noreferrer">
            Live <ArrowIcon />
          </a>
        ) : null}
        {item.code ? (
          <a className="plink" href={item.code} target="_blank" rel="noopener noreferrer">
            Code <ArrowIcon />
          </a>
        ) : null}
        {item.youtube ? (
          <a className="plink plink--yt" href={item.youtube} target="_blank" rel="noopener noreferrer">
            ▶ Watch
          </a>
        ) : null}
        <button type="button" className="plink" onClick={onOpen}>
          Details
        </button>
      </div>
    </li>
  );
}

const FILTERS = [
  { id: "all", label: "Everything" },
  { id: "highlight", label: "Highlights" },
  { id: "repo", label: "All GitHub repos" },
] as const;

/**
 * The archive: every other project and every public repo on a 3D carousel.
 * The card in front is the one you're on; drag, swipe, scroll sideways, use
 * the arrows or the keyboard to move, click the front card for details.
 * Card transforms are written straight to the DOM each frame, so moving
 * through seventy cards never re-renders React.
 */
function Archive({ items, onOpen }: { items: ArchiveItem[]; onOpen: (i: ArchiveItem) => void }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<Array<HTMLElement | null>>([]);
  const pos = useRef(0);
  const target = useRef(0);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  // A drag ends in a click on whatever card is under the pointer; ignore it.
  const justDragged = useRef(false);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (it) =>
        (filter === "all" || it.group === filter) &&
        (!q || `${it.title} ${it.text} ${it.label} ${it.tags.join(" ")}`.toLowerCase().includes(q))
    );
  }, [items, filter, query]);

  const go = useCallback(
    (i: number) => {
      const n = shown.length;
      if (!n) return;
      const next = Math.max(0, Math.min(n - 1, i));
      target.current = next;
      setIndex(next);
    },
    [shown.length]
  );

  // New filter or search: start a couple of cards in, so there are cards on
  // both sides of the front one.
  useEffect(() => {
    const start = Math.min(2, Math.max(0, shown.length - 1));
    target.current = start;
    pos.current = start;
    setIndex(start);
    // Only when the filter or search changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, query]);

  // The animation loop: ease toward the target and place every card.
  useEffect(() => {
    let raf = 0;
    const mobile = () => window.innerWidth < 810;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      pos.current += (target.current - pos.current) * 0.14;
      if (Math.abs(target.current - pos.current) < 0.0005) pos.current = target.current;
      const step = mobile() ? 150 : 230;
      cards.current.forEach((el, i) => {
        if (!el) return;
        const o = i - pos.current;
        const a = Math.abs(o);
        if (a > 6.5) {
          el.style.visibility = "hidden";
          return;
        }
        el.style.visibility = "visible";
        const x = Math.sign(o) * (Math.min(a, 1) * step * 1.15 + Math.max(0, a - 1) * step * 0.62);
        const rot = Math.max(-55, Math.min(55, -o * 38));
        const z = -Math.min(a, 6) * 110;
        el.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), -50%, ${z.toFixed(1)}px) rotateY(${rot.toFixed(1)}deg)`;
        el.style.zIndex = String(100 - Math.round(a * 10));
        el.style.opacity = String(Math.max(0, 1 - Math.max(0, a - 4) * 0.4));
        el.classList.toggle("is-front", a < 0.5);
      });
    };
    loop();
    return () => cancelAnimationFrame(raf);
  }, [shown]);

  // Horizontal wheel / trackpad swipes move the carousel; vertical scrolling
  // is left to the page.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    let acc = 0;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      acc += e.deltaX;
      if (Math.abs(acc) > 60) {
        go(target.current + Math.sign(acc));
        acc = 0;
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [go]);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, start: target.current, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    if (!d.moved) return;
    const step = window.innerWidth < 810 ? 120 : 170;
    target.current = Math.max(0, Math.min(shown.length - 1, d.start - dx / step));
  };
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      justDragged.current = true;
      window.setTimeout(() => (justDragged.current = false), 0);
      go(Math.round(target.current));
    }
  };

  const front = shown[index];
  return (
    <div className="archive">
      <div className="archive__bar">
        <div className="work__filters" role="group" aria-label="Show">
          {FILTERS.map((f) => {
            const count = f.id === "all" ? items.length : items.filter((i) => i.group === f.id).length;
            return (
              <button key={f.id} type="button" className="chip" aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
                {f.label}
                <sup>{count}</sup>
              </button>
            );
          })}
        </div>
        <label className="archive__search">
          <span className="sr-only">Search projects</span>
          <input type="search" placeholder="Search: python, three.js, hackathon…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <div
        ref={stage}
        className="archive__stage"
        tabIndex={0}
        role="listbox"
        aria-label="All projects, one at a time"
        aria-activedescendant={front ? `arc-${front.key}` : undefined}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1);
          else if (e.key === "ArrowLeft") go(index - 1);
          else if ((e.key === "Enter" || e.key === " ") && front) {
            e.preventDefault();
            onOpen(front);
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {shown.length === 0 ? <p className="archive__empty">Nothing matches “{query}”.</p> : null}
        {shown.map((it, i) => (
          <article
            key={it.key}
            id={`arc-${it.key}`}
            role="option"
            aria-selected={i === index}
            ref={(n) => {
              cards.current[i] = n;
            }}
            className={`acard acard--${it.group}`}
            onClick={() => {
              if (justDragged.current) return;
              if (i === index) onOpen(it);
              else go(i);
            }}
          >
            <div className="acard__media">
              {it.image ? <Img src={it.image} alt="" sizes="320px" /> : <Cover item={it} small />}
            </div>
            <div className="acard__body">
              <p className="acard__label">
                {it.label}
                {it.stars ? <span> · ★ {it.stars}</span> : null}
              </p>
              <h4 className="acard__title">{it.title}</h4>
              <p className="acard__text">{it.headline || it.text || "No description yet."}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="archive__nav">
        <button type="button" className="arrow" aria-label="Previous project" disabled={index === 0} onClick={() => go(index - 1)}>
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ transform: "scaleX(-1)" }}>
            <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <p className="archive__count" aria-live="polite">
          {shown.length ? `${String(index + 1).padStart(2, "0")} / ${String(shown.length).padStart(2, "0")}` : "00 / 00"}
          {front ? <span>{front.title}</span> : null}
        </p>
        <button type="button" className="arrow" aria-label="Next project" disabled={index >= shown.length - 1} onClick={() => go(index + 1)}>
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        {front ? (
          <button type="button" className="plink" onClick={() => onOpen(front)}>
            Open details
          </button>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Projects: four featured ones up top, then every other project and every
 * public GitHub repo on a 3D carousel, all opening the same details window.
 */
export default function SelectedWork({ repos }: { repos: Repo[] }) {
  const [open, setOpen] = useState<ProjectDetail | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const github = SOCIALS.find((s) => s.id === "github")?.href ?? "https://github.com/UJESH2K";

  const featured = WORK.filter((w) => w.featured).slice(0, 4).map(fromWork);
  const archive = useMemo(() => {
    const rest = WORK.filter((w) => !featured.some((f) => f.key === w.id)).map(fromWork);
    // Repos already shown as a project aren't listed twice.
    const linked = new Set(WORK.map((w) => w.code?.toLowerCase()).filter(Boolean));
    return [...rest, ...repos.filter((r) => !linked.has(r.url.toLowerCase())).map(fromRepo)];
    // WORK is static; featured is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repos]);

  return (
    <section id="work" className="work" data-cue="work" aria-labelledby="work-title">
      <div className="wrap">
        <div className="work__top">
          <Eyebrow>{WORK_INTRO.eyebrow}</Eyebrow>
          <h2 id="work-title" className="h2" data-rv>
            {WORK_INTRO.title.map((line, i) => (
              <span key={line} style={{ display: "block" }}>
                <SplitWords text={line} delay={i * 0.12} />
              </span>
            ))}
          </h2>
          <Scramble as="p" className="lede" text={WORK_INTRO.text} duration={1300} />
        </div>

        <p className="work__sub">Featured</p>
        <ol className="work__featured">
          {featured.map((f, i) => (
            <Featured key={f.key} item={f} index={i} onOpen={() => setOpen(f)} />
          ))}
        </ol>

        <div className="work__archivehead">
          <p className="work__sub">Everything else</p>
          <p className="work__hint">{archive.length} projects and repos. Drag, swipe or use the arrows; click the front card for details.</p>
        </div>
        <Archive items={archive} onOpen={setOpen} />

        <div className="work__cta rv" data-rv>
          <Cta href={github} external width={320}>
            {`${PROFILE.publicRepos}+ public repos on GitHub`}
          </Cta>
        </div>
      </div>
      <ProjectModal item={open} onClose={close} />
    </section>
  );
}
