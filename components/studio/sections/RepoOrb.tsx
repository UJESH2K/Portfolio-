"use client";

import { useCallback, useMemo, useState } from "react";
import KeycapOrb, { type Keycap, type KeycapFinish } from "@/components/ui/keycap-orb";
import { ArrowIcon } from "../primitives";
import { sfx } from "../robot/sfx";

export type OrbItem = {
  key: string;
  title: string;
  text: string;
  /** The kind of project, or the repo's language. */
  label: string;
  group: "highlight" | "repo";
  stars?: number;
  date?: string;
  code?: string;
  live?: string;
};

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

/** What fits on a cap: initials for names of several words, else the first letters. */
const capLabel = (title: string) => {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length >= 2) return words.slice(0, 3).map((w) => w[0].toUpperCase()).join("");
  const w = words[0] ?? "?";
  const short = w.length <= 6 ? w : w.slice(0, 4);
  return short[0].toUpperCase() + short.slice(1);
};

/** Highlights in ember; repos in ink, paper or tan by language, a few in glass. */
const finishOf = (it: OrbItem, i: number): KeycapFinish => {
  if (it.group === "highlight") return "cobalt";
  if (i % 7 === 3) return "glass";
  if (it.label === "Python" || it.label === "Jupyter Notebook") return "lime";
  if (it.label === "TypeScript" || it.label === "JavaScript") return "ink";
  return "ash";
};

/**
 * "Explore everything": every project and public repo as a keycap on one
 * ball, on the left; the story and whichever key you're on, on the right.
 * Hover a key to read it, press it to open the project.
 */
export default function RepoOrb({
  items,
  user,
  onOpen,
  onHold,
}: {
  items: OrbItem[];
  user: string;
  onOpen: (key: string) => void;
  onHold?: (on: boolean) => void;
}) {
  const [active, setActive] = useState<OrbItem | null>(items[0] ?? null);
  const byKey = useMemo(() => new Map(items.map((it) => [it.key, it])), [items]);
  const keys = useMemo<Keycap[]>(
    () => items.map((it, i) => ({ label: capLabel(it.title), finish: finishOf(it, i), meta: it.key })),
    [items],
  );
  // Enough rings that every item gets a cap of its own, and no more.
  const rings = Math.min(13, Math.max(7, Math.ceil(Math.sqrt((items.length * Math.PI) / 4)) + 1));
  const highlights = items.filter((it) => it.group === "highlight").length;

  // Three picks worth a look, and what the repos are written in.
  const spotlight = useMemo(() => {
    const repos = items.filter((it) => it.group === "repo");
    const starred = [...repos].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))[0];
    const latest = [...repos].filter((r) => r !== starred).sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))[0];
    const pick = items.find((it) => it.group === "highlight");
    return [
      starred && { tag: "Most starred", item: starred, meta: `★ ${starred.stars ?? 0}` },
      latest && { tag: "Latest push", item: latest, meta: latest.date ?? "" },
      pick && { tag: "Hackathon pick", item: pick, meta: pick.label },
    ].filter(Boolean) as { tag: string; item: OrbItem; meta: string }[];
  }, [items]);
  const langs = useMemo(() => {
    const counts = new Map<string, number>();
    for (const it of items) if (it.group === "repo" && it.label !== "Repo") counts.set(it.label, (counts.get(it.label) ?? 0) + 1);
    const total = [...counts.values()].reduce((a, b) => a + b, 0) || 1;
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, n]) => ({ name, pct: Math.round((n / total) * 100) }));
  }, [items]);

  const onHover = useCallback(
    (k: Keycap | null) => {
      const it = k?.meta ? byKey.get(k.meta) : undefined;
      if (it) setActive(it);
    },
    [byKey],
  );
  const onPress = useCallback(
    (k: Keycap) => {
      const it = k.meta ? byKey.get(k.meta) : undefined;
      if (!it) return;
      setActive(it);
      onOpen(it.key);
    },
    [byKey, onOpen],
  );

  return (
    <div className="korb">
      <div className="korb__ball" onPointerEnter={() => onHold?.(true)} onPointerLeave={() => onHold?.(false)}>
        <KeycapOrb
          keys={keys}
          rings={rings}
          fill="blank"
          scale={0.72}
          reflection={false}
          speed={0.8}
          height="100%"
          onKeyHover={onHover}
          onKeyPress={onPress}
          onKeySound={sfx.key}
          aria-label={`${items.length} projects and repos as keycaps. Drag to spin, press a key to open it.`}
        />
      </div>

      <div className="korb__side">
        <p className="korb__eyebrow">github.com/{user}</p>
        <h3 className="korb__title">A world I built, one repo at a time.</h3>
        <p className="korb__text">
          Every key is something I&apos;ve made, straight from my GitHub; the orange ones are the highlights. Spin it, hover a key to read it, press one
          to open it.
        </p>
        <p className="korb__stats">
          <span>{highlights} highlights</span>
          <span>{items.length - highlights} repos</span>
          <span>synced from GitHub hourly</span>
        </p>

        <ul className="korb__spot">
          {spotlight.map((s) => (
            <li key={s.tag}>
              <button type="button" onClick={() => onOpen(s.item.key)} onMouseEnter={() => setActive(s.item)} onFocus={() => setActive(s.item)}>
                <span className="korb__spottag">{s.tag}</span>
                <span className="korb__spotname">{s.item.title}</span>
                <span className="korb__spotmeta">{s.meta}</span>
              </button>
            </li>
          ))}
        </ul>

        {langs.length ? (
          <div className="korb__langs">
            <div className="korb__langbar" aria-hidden="true">
              {langs.map((l) => (
                <i key={l.name} style={{ width: `${l.pct}%`, background: LANG_COLOR[l.name] ?? "var(--fg-3)" }} />
              ))}
            </div>
            <p>
              {langs.map((l) => (
                <span key={l.name}>
                  <i style={{ background: LANG_COLOR[l.name] ?? "var(--fg-3)" }} />
                  {l.name} <em>{l.pct}%</em>
                </span>
              ))}
            </p>
          </div>
        ) : null}

        {active ? (
          <div className="korb__card" aria-live="polite">
            <p className="korb__kind">
              {active.group === "repo" ? <i style={{ background: LANG_COLOR[active.label] ?? "var(--fg-3)" }} /> : null}
              {active.label}
              {typeof active.stars === "number" && active.stars > 0 ? <span>★ {active.stars}</span> : null}
              {active.date ? <span>{active.date}</span> : null}
            </p>
            <p className="korb__name">
              <b>{capLabel(active.title)}</b>
              {active.title}
            </p>
            <p className="korb__desc">{active.text || "No description yet. Open it to see the code."}</p>
            <div className="korb__links">
              <button type="button" className="plink plink--solid" onClick={() => onOpen(active.key)}>
                Open
              </button>
              {active.code ? (
                <a className="plink" href={active.code} target="_blank" rel="noopener noreferrer">
                  Code <ArrowIcon />
                </a>
              ) : null}
              {active.live ? (
                <a className="plink" href={active.live} target="_blank" rel="noopener noreferrer">
                  Live <ArrowIcon />
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        <details className="korb__all">
          <summary>Or browse all {items.length} as a list</summary>
          <ul>
            {items.map((it) => (
              <li key={it.key}>
                <button type="button" onClick={() => onOpen(it.key)} onMouseEnter={() => setActive(it)} onFocus={() => setActive(it)}>
                  <b>{capLabel(it.title)}</b>
                  <span>{it.title}</span>
                  <em>{it.label}</em>
                </button>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </div>
  );
}
