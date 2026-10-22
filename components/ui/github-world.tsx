"use client";

import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Minus, Plus, RotateCcw, Hand, LayoutGrid, Globe2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

/**
 * "The GitHub world": every project and repo as a GitHub-style card on a
 * slowly turning sphere, inside a plain GitHub-dark window.
 *
 * Adapted from the 21st.dev "3D stellar card gallery" for this site:
 *   - no starfield: GitHub's own dark canvas, one faint wireframe globe;
 *   - cards are drawn once into canvas textures (GitHub repo-card layout)
 *     instead of one live HTML element per card, so seventy cards stay
 *     smooth;
 *   - the mouse wheel never zooms (it scrolls the page, as everywhere else);
 *     zoom is on buttons;
 *   - on touch screens the world only takes the finger after "Explore", so a
 *     visitor scrolling past never gets stuck rotating it;
 *   - it renders only while on screen, and holds still while hovered.
 */

export type WorldItem = {
  key: string;
  title: string;
  text: string;
  /** Language for repos; kind of project for highlights. */
  label: string;
  group: "highlight" | "repo";
  stars?: number;
  date?: string;
  image?: string;
};

const GH = {
  bg: "#0d1117",
  card: "#161b22",
  border: "#30363d",
  text: "#e6edf3",
  muted: "#7d8590",
  link: "#4493f8",
  accent: "#ff5a1f",
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

const CARD_W = 448;
const CARD_H = 296;

function wrap(ctx: CanvasRenderingContext2D, text: string, maxW: number, maxLines: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const next = line ? `${line} ${w}` : w;
    if (ctx.measureText(next).width > maxW && line) {
      lines.push(line);
      line = w;
      if (lines.length === maxLines) break;
    } else line = next;
  }
  if (lines.length < maxLines && line) lines.push(line);
  if (lines.length === maxLines && words.join(" ").length > lines.join(" ").length) {
    let last = lines[maxLines - 1];
    while (ctx.measureText(`${last}…`).width > maxW && last.length) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last}…`;
  }
  return lines;
}

/** Draw one card in GitHub's repo-card layout; images load in afterwards. */
function makeCardTexture(item: WorldItem, font: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = CARD_W;
  c.height = CARD_H;
  const ctx = c.getContext("2d")!;
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;

  const draw = (img?: HTMLImageElement) => {
    ctx.clearRect(0, 0, CARD_W, CARD_H);
    ctx.fillStyle = GH.card;
    ctx.strokeStyle = item.group === "highlight" ? GH.accent : GH.border;
    ctx.lineWidth = item.group === "highlight" ? 3 : 2;
    ctx.beginPath();
    ctx.roundRect(2, 2, CARD_W - 4, CARD_H - 4, 14);
    ctx.fill();
    ctx.stroke();

    let y = 30;
    if (img) {
      // A picture strip across the top for projects that have one.
      const h = 128;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(2, 2, CARD_W - 4, h, [14, 14, 0, 0]);
      ctx.clip();
      const s = Math.max((CARD_W - 4) / img.width, h / img.height);
      ctx.drawImage(img, 2 + ((CARD_W - 4) - img.width * s) / 2, 2, img.width * s, img.height * s);
      ctx.restore();
      y = h + 30;
    }

    // Book icon, name, and the "Public" pill, like a pinned repo.
    ctx.strokeStyle = GH.muted;
    ctx.lineWidth = 2;
    ctx.strokeRect(22, y - 15, 13, 17);
    ctx.font = `600 22px ${font}`;
    ctx.fillStyle = GH.link;
    let name = item.title;
    while (ctx.measureText(name).width > CARD_W - 150 && name.length) name = name.slice(0, -1);
    if (name !== item.title) name += "…";
    ctx.fillText(name, 46, y);
    const nameW = ctx.measureText(name).width;
    ctx.font = `500 13px ${font}`;
    const pill = item.group === "highlight" ? "Featured" : "Public";
    const pw = ctx.measureText(pill).width + 16;
    ctx.strokeStyle = item.group === "highlight" ? GH.accent : GH.border;
    ctx.fillStyle = item.group === "highlight" ? GH.accent : GH.muted;
    ctx.beginPath();
    ctx.roundRect(56 + nameW, y - 17, pw, 22, 11);
    ctx.stroke();
    ctx.fillText(pill, 64 + nameW, y - 1);

    // Description.
    ctx.font = `400 16px ${font}`;
    ctx.fillStyle = GH.muted;
    const desc = item.text || (item.group === "repo" ? "No description, website, or topics provided." : "");
    const lines = wrap(ctx, desc, CARD_W - 44, img ? 2 : 4);
    lines.forEach((l, i) => ctx.fillText(l, 22, y + 34 + i * 23));

    // Footer: language, stars, last update.
    const fy = CARD_H - 24;
    ctx.font = `400 14px ${font}`;
    let x = 22;
    if (item.label) {
      ctx.fillStyle = LANG_COLOR[item.label] ?? (item.group === "highlight" ? GH.accent : GH.muted);
      ctx.beginPath();
      ctx.arc(x + 6, fy - 5, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = GH.muted;
      ctx.fillText(item.label, x + 18, fy);
      x += ctx.measureText(item.label).width + 38;
    }
    if (item.stars) {
      ctx.fillText(`★ ${item.stars}`, x, fy);
      x += ctx.measureText(`★ ${item.stars}`).width + 20;
    }
    if (item.date) ctx.fillText(`Updated ${item.date}`, x, fy);
    tex.needsUpdate = true;
  };

  draw();
  if (item.image) {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => draw(img);
    img.src = `${item.image}-800.webp`;
  }
  return tex;
}

/** Points spread evenly over a sphere (golden spiral), in a few shells. */
function spherePositions(n: number) {
  const out: THREE.Vector3[] = [];
  const golden = (1 + Math.sqrt(5)) / 2;
  for (let i = 0; i < n; i++) {
    const y = n === 1 ? 0 : 1 - (i / (n - 1)) * 2;
    const r = Math.sqrt(1 - y * y);
    const theta = (2 * Math.PI * i) / golden;
    const shell = 14 + (i % 3) * 3.4;
    out.push(new THREE.Vector3(Math.cos(theta) * r * shell, y * shell, Math.sin(theta) * r * shell));
  }
  return out;
}

function Card({
  item,
  position,
  texture,
  dim,
  onOpen,
  onHover,
}: {
  item: WorldItem;
  position: THREE.Vector3;
  texture: THREE.Texture;
  dim: boolean;
  onOpen: (key: string) => void;
  onHover: (on: boolean) => void;
}) {
  const ref = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const [hovered, setHovered] = useState(false);
  useFrame(({ camera }, dt) => {
    const g = ref.current;
    if (!g) return;
    g.quaternion.copy(camera.quaternion);
    const s = hovered ? 1.18 : 1;
    g.scale.setScalar(THREE.MathUtils.damp(g.scale.x, s, 10, dt));
    // Cards on the far side of the globe fade back, so the near side reads.
    const toCam = camera.position.clone().normalize().dot(position.clone().normalize());
    const depth = 0.32 + 0.68 * THREE.MathUtils.smoothstep(toCam, -0.4, 0.5);
    if (mat.current) mat.current.opacity = THREE.MathUtils.damp(mat.current.opacity, dim ? 0.08 : depth, 8, dt);
  });
  return (
    <group ref={ref} position={position}>
      <mesh
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          onHover(true);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(false);
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          // A drag that ends on a card is a look-around, not a click.
          if (e.delta > 6 || dim) return;
          onOpen(item.key);
        }}
      >
        <planeGeometry args={[5.4, (5.4 * CARD_H) / CARD_W]} />
        <meshBasicMaterial ref={mat} map={texture} transparent toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function World({
  items,
  match,
  onOpen,
  controls,
  playing,
}: {
  items: WorldItem[];
  match: (it: WorldItem) => boolean;
  onOpen: (key: string) => void;
  controls: React.MutableRefObject<OrbitControlsImpl | null>;
  playing: boolean;
}) {
  const { gl } = useThree();
  const positions = useMemo(() => spherePositions(items.length), [items.length]);
  const font = useMemo(() => getComputedStyle(document.body).fontFamily || "system-ui, sans-serif", []);
  const textures = useMemo(() => items.map((it) => makeCardTexture(it, font)), [items, font]);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);
  const hoverCount = useRef(0);

  return (
    <>
      <mesh>
        <sphereGeometry args={[10.5, 28, 18]} />
        <meshBasicMaterial color="#30363d" wireframe transparent opacity={0.35} />
      </mesh>
      <mesh>
        <sphereGeometry args={[22, 36, 22]} />
        <meshBasicMaterial color="#30363d" wireframe transparent opacity={0.08} />
      </mesh>
      {items.map((it, i) => (
        <Card
          key={it.key}
          item={it}
          position={positions[i]}
          texture={textures[i]}
          dim={!match(it)}
          onOpen={onOpen}
          onHover={(on) => {
            hoverCount.current = Math.max(0, hoverCount.current + (on ? 1 : -1));
            gl.domElement.style.cursor = hoverCount.current ? "pointer" : "";
          }}
        />
      ))}
      <OrbitControls
        ref={controls}
        enablePan={false}
        enableZoom={false}
        rotateSpeed={0.55}
        autoRotate={playing}
        autoRotateSpeed={0.6}
        enableDamping
        dampingFactor={0.08}
        minDistance={16}
        maxDistance={70}
      />
    </>
  );
}

export default function GitHubWorld({
  items,
  user,
  onOpen,
  onHold,
}: {
  items: WorldItem[];
  /** GitHub username, shown in the window's header. */
  user: string;
  onOpen: (key: string) => void;
  /** Hovering or exploring: the page can quiet down meanwhile. */
  onHold?: (on: boolean) => void;
}) {
  const frame = useRef<HTMLDivElement>(null);
  const controls = useRef<OrbitControlsImpl | null>(null);
  const [visible, setVisible] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [touch, setTouch] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "highlight" | "repo">("all");
  const [view, setView] = useState<"world" | "list">("world");

  // Narrow screens see less of the globe sideways, so start further back.
  const [home] = useState<[number, number, number]>(() =>
    typeof window !== "undefined" && window.innerWidth < 810 ? [0, 4, 56] : [0, 4, 38]
  );
  useEffect(() => setTouch(window.matchMedia("(hover: none), (pointer: coarse)").matches), []);

  // Render only while on screen; ease in and out like a portal as it scrolls.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "100px" });
    io.observe(el);
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = el.getBoundingClientRect();
        const vh = window.innerHeight;
        const centre = (r.top + r.height / 2 - vh / 2) / vh;
        const t = Math.min(1, Math.abs(centre) * 1.3);
        el.style.setProperty("--portal-scale", (1 - t * 0.08).toFixed(4));
        el.style.setProperty("--portal-radius", `${(14 + t * 26).toFixed(1)}px`);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => onHold?.(hovering || exploring), [hovering, exploring, onHold]);

  const q = query.trim().toLowerCase();
  const match = (it: WorldItem) =>
    (filter === "all" || it.group === filter) && (!q || `${it.title} ${it.text} ${it.label}`.toLowerCase().includes(q));
  const matches = items.filter(match).length;
  const repos = items.filter((i) => i.group === "repo").length;

  const zoom = (f: number) => {
    const c = controls.current;
    if (!c) return;
    const cam = c.object;
    const d = Math.max(c.minDistance, Math.min(c.maxDistance, cam.position.length() * f));
    cam.position.setLength(d);
    c.update();
  };
  const reset = () => {
    const c = controls.current;
    if (!c) return;
    c.object.position.set(...home);
    c.update();
  };

  const interactive = !touch || exploring;

  return (
    <div
      ref={frame}
      className="ghw"
      onPointerEnter={(e) => e.pointerType === "mouse" && setHovering(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setHovering(false)}
    >
      <div className="ghw__chrome">
        <span className="ghw__mark" aria-hidden="true">
          <svg viewBox="0 0 16 16" width="20" height="20" fill="currentColor">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
        </span>
        <a className="ghw__path" href={`https://github.com/${user}?tab=repositories`} target="_blank" rel="noopener noreferrer">
          {user} <span>/</span> repositories
        </a>
        <span className="ghw__count">{repos} public repos</span>
        <div className="ghw__tabs" role="group" aria-label="Show">
          {(
            [
              ["all", "All"],
              ["highlight", "Highlights"],
              ["repo", "Repos"],
            ] as const
          ).map(([id, label]) => (
            <button key={id} type="button" aria-pressed={filter === id} onClick={() => setFilter(id)}>
              {label}
            </button>
          ))}
        </div>
        <input
          className="ghw__search"
          type="search"
          placeholder="Find a repository…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Find a repository"
        />
        <div className="ghw__view" role="group" aria-label="View">
          <button type="button" aria-pressed={view === "world"} onClick={() => setView("world")} aria-label="3D world">
            <Globe2 size={16} />
          </button>
          <button type="button" aria-pressed={view === "list"} onClick={() => setView("list")} aria-label="List">
            <LayoutGrid size={16} />
          </button>
        </div>
      </div>

      {view === "world" ? (
        <div className={`ghw__stage${interactive ? " is-live" : ""}`}>
          <Canvas
            frameloop={visible ? "always" : "never"}
            dpr={[1, 1.75]}
            camera={{ position: home, fov: 50 }}
            gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
            onCreated={({ gl }) => gl.setClearColor(GH.bg)}
            style={{ pointerEvents: interactive ? "auto" : "none" }}
          >
            <World items={items} match={match} onOpen={onOpen} controls={controls} playing={!hovering && !exploring} />
          </Canvas>

          <p className="ghw__hint" aria-hidden="true">
            {touch ? (exploring ? "Drag to look around · tap a card to open" : "") : "Drag to look around · click a card to open · scroll moves the page"}
            {q || filter !== "all" ? ` · ${matches} match${matches === 1 ? "" : "es"}` : ""}
          </p>
          <div className="ghw__tools">
            <button type="button" onClick={() => zoom(0.82)} aria-label="Zoom in">
              <Plus size={16} />
            </button>
            <button type="button" onClick={() => zoom(1.22)} aria-label="Zoom out">
              <Minus size={16} />
            </button>
            <button type="button" onClick={reset} aria-label="Reset view">
              <RotateCcw size={15} />
            </button>
          </div>
          {touch && !exploring ? (
            <button type="button" className="ghw__explore" onClick={() => setExploring(true)}>
              <Hand size={16} /> Tap to explore
            </button>
          ) : null}
          {touch && exploring ? (
            <button type="button" className="ghw__done" onClick={() => setExploring(false)}>
              Done
            </button>
          ) : null}
        </div>
      ) : (
        <ul className="ghw__list" data-lenis-prevent>
          {items.filter(match).map((it) => (
            <li key={it.key}>
              <button type="button" onClick={() => onOpen(it.key)}>
                <span className="ghw__lname">
                  {it.title}
                  <em>{it.group === "highlight" ? "Featured" : "Public"}</em>
                </span>
                {it.text ? <span className="ghw__ldesc">{it.text}</span> : null}
                <span className="ghw__lmeta">
                  {it.label ? (
                    <>
                      <i style={{ background: LANG_COLOR[it.label] ?? GH.muted }} />
                      {it.label}
                    </>
                  ) : null}
                  {it.stars ? <span>★ {it.stars}</span> : null}
                  {it.date ? <span>Updated {it.date}</span> : null}
                </span>
              </button>
            </li>
          ))}
          {matches === 0 ? <li className="ghw__none">No repositories match “{query}”.</li> : null}
        </ul>
      )}
    </div>
  );
}
