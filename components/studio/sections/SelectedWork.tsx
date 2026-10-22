"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { PROFILE, SOCIALS, WORK, WORK_INTRO, type WorkItem, type WorkKind } from "@/lib/content";
import type { Repo } from "@/lib/github";
import ProjectModal, { type ProjectDetail } from "../ProjectModal";
import { ArrowIcon, Cta, Eyebrow, Img, SplitWords } from "../primitives";
import Scramble from "../Scramble";
import { setSfxHold } from "../robot/sfx";

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

/** How long each card stays in front while the carousel plays itself. */
const DWELL_MS = 3000;

/** GitHub's own language colours, for the repo cards. */
const LANG_COLOR: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  HTML: "#e34c26",
  CSS: "#563d7c",
  "Jupyter Notebook": "#da5b0b",
  Rust: "#dea584",
  Go: "#00add8",
  Java: "#b07219",
  "C++": "#f34b7d",
  Solidity: "#aa6746",
};

const initials = (t: string) =>
  t
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

/** The top of a repo card: its language's colour, its initials, its stars. */
function RepoCover({ item }: { item: ArchiveItem }) {
  const color = LANG_COLOR[item.label] ?? "#8d8a83";
  return (
    <div className="rcover" style={{ "--lang": color } as CSSProperties} aria-hidden="true">
      <span className="rcover__mono">{initials(item.title)}</span>
      <span className="rcover__lang">
        <i />
        {item.label}
      </span>
      {item.stars ? <span className="rcover__stars">★ {item.stars}</span> : null}
    </div>
  );
}

const mod = (a: number, n: number) => ((a % n) + n) % n;

/**
 * The archive: every other project and every public repo on an endless 3D
 * carousel that plays itself, one card every few seconds. Hovering, touching
 * or focusing it holds it still (and keeps the site quiet) so you can read;
 * drag, swipe, the arrows or the keyboard move it by hand, and the front
 * card opens the details. Transforms are written straight to the DOM each
 * frame, so it never re-renders React while it moves.
 */
function Archive({ items, onOpen, paused: externallyPaused }: { items: ArchiveItem[]; onOpen: (i: ArchiveItem) => void; paused: boolean }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const [holding, setHolding] = useState(false);
  const wrap = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const cards = useRef<Array<HTMLElement | null>>([]);
  // Positions run on forever (taken modulo the card count), so the carousel
  // loops with no rewind.
  const pos = useRef(0);
  const target = useRef(0);
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);
  const onScreen = useRef(false);
  const elapsed = useRef(0);
  const tilt = useRef({ x: 0, y: 0 });

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter(
      (it) =>
        (filter === "all" || it.group === filter) &&
        (!q || `${it.title} ${it.text} ${it.label} ${it.tags.join(" ")}`.toLowerCase().includes(q))
    );
  }, [items, filter, query]);
  const n = shown.length;
  const paused = holding || externallyPaused;
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const go = useCallback(
    (to: number) => {
      if (!n) return;
      target.current = to;
      elapsed.current = 0;
      setIndex(mod(Math.round(to), n));
    },
    [n]
  );

  useEffect(() => {
    target.current = 0;
    pos.current = 0;
    elapsed.current = 0;
    setIndex(0);
  }, [filter, query]);

  // Only play while the carousel is on screen.
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (onScreen.current = e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!n) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop);
      const dt = Math.min(64, now - last);
      last = now;

      // Play on its own: one card every DWELL_MS.
      const playing = !reduced && !pausedRef.current && onScreen.current && !document.hidden && !drag.current;
      if (playing) {
        elapsed.current += dt;
        if (elapsed.current >= DWELL_MS) {
          target.current = Math.round(target.current) + 1;
          elapsed.current = 0;
          setIndex(mod(target.current, n));
        }
      }
      if (bar.current) bar.current.style.transform = `scaleX(${Math.min(1, elapsed.current / DWELL_MS).toFixed(3)})`;

      pos.current += (target.current - pos.current) * (reduced ? 1 : 0.1);
      if (Math.abs(target.current - pos.current) < 0.0005) pos.current = target.current;
      const step = window.innerWidth < 810 ? 150 : 230;
      const t = tilt.current;
      cards.current.forEach((el, i) => {
        if (!el) return;
        // Signed distance from the front, wrapped round the loop.
        const o = n === 1 ? 0 : mod(i - pos.current + n / 2, n) - n / 2;
        const a = Math.abs(o);
        if (a > 6.5) {
          el.style.visibility = "hidden";
          return;
        }
        el.style.visibility = "visible";
        const x = Math.sign(o) * (Math.min(a, 1) * step * 1.15 + Math.max(0, a - 1) * step * 0.62);
        const rot = Math.max(-55, Math.min(55, -o * 38));
        const front = a < 0.5;
        const z = -Math.min(a, 6) * 110 + (front ? 30 : 0);
        // The front card leans toward the pointer.
        const rx = front ? t.y * -7 : 0;
        const ry = front ? t.x * 9 : 0;
        el.style.transform = `translate3d(calc(-50% + ${x.toFixed(1)}px), -50%, ${z.toFixed(1)}px) rotateY(${(rot + ry).toFixed(2)}deg) rotateX(${rx.toFixed(2)}deg)`;
        el.style.zIndex = String(100 - Math.round(a * 10));
        el.style.opacity = String(Math.max(0, 1 - Math.max(0, a - 4) * 0.4));
        if (front) {
          el.style.setProperty("--sx", `${(50 + t.x * 40).toFixed(1)}%`);
          el.style.setProperty("--sy", `${(50 + t.y * 40).toFixed(1)}%`);
        }
        el.classList.toggle("is-front", front);
      });
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [shown, n]);

  // Hovering holds it still and keeps the site quiet; touch holds it while
  // the finger is down and a moment after.
  const hold = useCallback((on: boolean) => {
    setHolding(on);
    setSfxHold("archive", on);
    if (!on) tilt.current = { x: 0, y: 0 };
  }, []);
  useEffect(() => () => setSfxHold("archive", false), []);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, start: target.current, moved: false };
    if (e.pointerType !== "mouse") hold(true);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const r = stage.current?.getBoundingClientRect();
    if (r && e.pointerType === "mouse") {
      tilt.current = { x: ((e.clientX - r.left) / r.width - 0.5) * 2, y: ((e.clientY - r.top) / r.height - 0.5) * 2 };
    }
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    if (!d.moved) return;
    const step = window.innerWidth < 810 ? 120 : 170;
    target.current = d.start - dx / step;
  };
  const endDrag = (e?: React.PointerEvent) => {
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      justDragged.current = true;
      window.setTimeout(() => (justDragged.current = false), 0);
      go(Math.round(target.current));
    }
    if (e && e.pointerType !== "mouse") window.setTimeout(() => hold(false), 2500);
  };

  const front = shown[index];
  return (
    <div className="archive" ref={wrap}>
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
          <input
            type="search"
            placeholder="Search: python, three.js, hackathon…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => hold(true)}
            onBlur={() => hold(false)}
          />
        </label>
      </div>

      <div
        ref={stage}
        className={`archive__stage${paused ? " is-held" : ""}`}
        tabIndex={0}
        role="listbox"
        aria-label="All projects, one at a time. Plays on its own; hover or focus to pause."
        aria-activedescendant={front ? `arc-${front.key}` : undefined}
        onPointerEnter={(e) => {
          if (e.pointerType === "mouse") hold(true);
        }}
        onPointerLeave={(e) => {
          endDrag();
          if (e.pointerType === "mouse") hold(false);
        }}
        onFocus={() => hold(true)}
        onBlur={() => hold(false)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(Math.round(target.current) + 1);
          else if (e.key === "ArrowLeft") go(Math.round(target.current) - 1);
          else if ((e.key === "Enter" || e.key === " ") && front) {
            e.preventDefault();
            onOpen(front);
          }
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {n === 0 ? <p className="archive__empty">Nothing matches “{query}”.</p> : null}
        {shown.map((it, i) => (
          <article
            key={it.key}
            id={`arc-${it.key}`}
            role="option"
            aria-selected={i === index}
            ref={(el) => {
              cards.current[i] = el;
            }}
            className={`acard acard--${it.group}`}
            onClick={() => {
              if (justDragged.current) return;
              if (i === index) onOpen(it);
              else go(Math.round(target.current + (mod(i - pos.current + n / 2, n) - n / 2)));
            }}
          >
            <div className="acard__media">
              {it.image ? <Img src={it.image} alt="" sizes="320px" /> : it.group === "repo" ? <RepoCover item={it} /> : <Cover item={it} small />}
            </div>
            <div className="acard__body">
              <p className="acard__label">{it.group === "repo" ? `Updated ${it.date ?? ""}` : it.label}</p>
              <h4 className="acard__title">{it.title}</h4>
              <p className="acard__text">
                {it.headline || it.text || (it.group === "repo" ? (it.label && it.label !== "Repo" ? `A ${it.label} project on GitHub. Open it for the code.` : "A project on GitHub. Open it for the code.") : "")}
              </p>
            </div>
            <span className="acard__sheen" aria-hidden="true" />
          </article>
        ))}
      </div>

      <div className="archive__nav">
        <button type="button" className="arrow" aria-label="Previous project" disabled={!n} onClick={() => go(Math.round(target.current) - 1)}>
          <svg viewBox="0 0 14 14" fill="none" aria-hidden="true" style={{ transform: "scaleX(-1)" }}>
            <path d="M1 7h12M8 2l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </button>
        <div className="archive__count" aria-live="polite">
          <span className="archive__num">{n ? `${String(index + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}` : "00 / 00"}</span>
          {front ? <span className="archive__name">{front.title}</span> : null}
          <span className="archive__progress" aria-hidden="true">
            <i ref={bar} />
          </span>
          <span className="archive__state">{paused ? "Paused" : "Playing"}</span>
        </div>
        <button type="button" className="arrow" aria-label="Next project" disabled={!n} onClick={() => go(Math.round(target.current) + 1)}>
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
          <p className="work__hint">{archive.length} projects and repos, playing on their own. Hover to pause; click the front card for details.</p>
        </div>
        <Archive items={archive} onOpen={setOpen} paused={!!open} />

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
