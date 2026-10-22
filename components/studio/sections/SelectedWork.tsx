"use client";

import { useCallback, useMemo, useState, type CSSProperties } from "react";
import { PROFILE, SOCIALS, WORK, WORK_INTRO, type WorkItem, type WorkKind } from "@/lib/content";
import type { Repo } from "@/lib/github";
import RepoOrb, { type OrbItem } from "./RepoOrb";
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

/** Repos kept off the site entirely. */
const HIDDEN_REPOS = /^dryp/i;

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

const toOrb = (it: ArchiveItem): OrbItem => ({
  key: it.key,
  title: it.title,
  text: it.headline || it.text,
  label: it.label,
  group: it.group,
  stars: it.stars,
  date: it.date,
  code: it.code,
  live: it.live,
});

/**
 * Projects: four featured ones up top, then every other project and every
 * public GitHub repo as a keycap on one ball, all opening the same details window.
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
    return [...rest, ...repos.filter((r) => !linked.has(r.url.toLowerCase()) && !HIDDEN_REPOS.test(r.name)).map(fromRepo)];
    // WORK is static; featured is derived from it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repos]);
  const orbItems = useMemo(() => archive.map(toOrb), [archive]);
  const holdSound = useCallback((on: boolean) => setSfxHold("world", on), []);

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
          <p className="work__sub">Explore everything</p>
          <p className="work__hint">{archive.length} projects and repos, one key each. Drag to spin; press any key.</p>
        </div>
        <RepoOrb
          items={orbItems}
          user="UJESH2K"
          onOpen={(key) => setOpen(archive.find((a) => a.key === key) ?? null)}
          onHold={holdSound}
        />

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
