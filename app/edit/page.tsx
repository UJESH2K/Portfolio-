"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { BASE_WORK, type NewsItem, type SiteOverrides, type WallPhoto, type WorkItem, type WorkKind } from "@/lib/content";

/**
 * /edit: change the site without code. Everything here is content/site.json
 * plus uploaded images; "Save" commits them to the repo in one go and Vercel
 * puts the update live in about a minute.
 */

type Upload = { path: string; base64: string; preview: string };

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40) || "image";

/** Resize an image in the browser to the site's two sizes, as WebP. */
async function toWebp(file: File, base: string): Promise<{ base: string; files: Upload[] }> {
  const bitmap = await createImageBitmap(file);
  const out: Upload[] = [];
  for (const w of [1600, 800]) {
    const width = Math.min(w, bitmap.width);
    const height = Math.round((bitmap.height * width) / bitmap.width);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, width, height);
    const blob: Blob = await new Promise((res) => canvas.toBlob((b) => res(b!), "image/webp", 0.86));
    const buf = new Uint8Array(await blob.arrayBuffer());
    let bin = "";
    for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
    out.push({ path: `public${base}-${w}.webp`, base64: btoa(bin), preview: URL.createObjectURL(blob) });
  }
  return { base, files: out };
}

const field = "w-full rounded-lg border border-[#d9d5ca] bg-white px-3 py-2 text-sm outline-none focus:border-black";

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">{title}</h2>
      {hint ? <p className="mt-1 text-sm text-[#5c5a55]">{hint}</p> : null}
      <div className="mt-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-[#5c5a55]">{label}</span>
      {children}
    </label>
  );
}

const EMPTY_PROJECT = (): WorkItem => ({
  id: `p-${Date.now().toString(36)}`,
  title: "",
  headline: "",
  text: "",
  kind: "side",
  context: "",
  stack: [],
});

export default function EditPage() {
  const [site, setSite] = useState<SiteOverrides | null>(null);
  const [mode, setMode] = useState("");
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "ok" | "error"; text?: string }>({ kind: "idle" });
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    fetch("/api/edit/content")
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setSite(d.content);
        setMode(d.mode);
      })
      .catch((e) => setStatus({ kind: "error", text: `Couldn't load the content: ${e.message}` }));
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const update = (fn: (s: SiteOverrides) => SiteOverrides) => {
    setSite((s) => (s ? fn(structuredClone(s)) : s));
    setDirty(true);
  };

  const previews = useMemo(() => new Map(uploads.filter((u) => u.path.endsWith("-800.webp")).map((u) => [u.path.replace(/^public/, "").replace(/-800\.webp$/, ""), u.preview])), [uploads]);
  const thumb = (base?: string) => (base ? previews.get(base) ?? `${base}-800.webp` : undefined);

  async function addImage(file: File, name: string): Promise<string> {
    const base = `/uploads/${slug(name)}-${Date.now().toString(36)}`;
    const { files } = await toWebp(file, base);
    setUploads((u) => [...u, ...files]);
    setDirty(true);
    return base;
  }

  async function save() {
    if (!site) return;
    setStatus({ kind: "saving" });
    try {
      // Only upload images something still uses.
      const used = JSON.stringify(site);
      const keep = uploads.filter((u) => used.includes(u.path.replace(/^public/, "").replace(/-(800|1600)\.webp$/, "")));
      const res = await fetch("/api/edit/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: site, uploads: keep.map(({ path, base64 }) => ({ path, base64 })), message: "Update site content from /edit" }),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error ?? `Save failed (${res.status})`);
      setUploads([]);
      setDirty(false);
      setStatus({
        kind: "ok",
        text: d.commit ? "Saved to GitHub. The live site updates in about a minute." : "Saved to disk. Refresh the site to see it.",
      });
    } catch (e) {
      setStatus({ kind: "error", text: (e as Error).message });
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/edit/login";
  }

  if (!site) {
    return <p className="p-10 text-sm text-[#5c5a55]">{status.text ?? "Loading…"}</p>;
  }

  const allProjects = [...site.projects, ...BASE_WORK];

  return (
    <div className="mx-auto max-w-4xl px-5 pb-40 pt-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-[#b8360c]">ujesh.in</p>
          <h1 className="mt-1 text-3xl font-semibold">Edit the site</h1>
          <p className="mt-1 text-sm text-[#5c5a55]">
            {mode === "github"
              ? "Saving commits to GitHub; the site redeploys in about a minute."
              : mode === "disk"
                ? "Local mode: saving writes to your project folder."
                : "Saving isn't set up yet: add GITHUB_TOKEN in Vercel (see the note at the bottom)."}
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/" target="_blank" className="rounded-full border border-black px-4 py-2 text-sm">
            View site
          </a>
          <button onClick={logout} className="rounded-full border border-[#d9d5ca] px-4 py-2 text-sm">
            Sign out
          </button>
        </div>
      </header>

      <div className="mt-8 flex flex-col gap-6">
        <Card title="YouTube" hint="Once the channel link is set, YouTube shows in the header, the menu, the footer, the profile cards and Google's knowledge of you.">
          <Field label="Channel link (https://www.youtube.com/@…)">
            <input className={field} value={site.youtube.channel} onChange={(e) => update((s) => ((s.youtube.channel = e.target.value), s))} />
          </Field>
          <Field label="Handle shown on the card (e.g. @ujesh)">
            <input className={field} value={site.youtube.handle} onChange={(e) => update((s) => ((s.youtube.handle = e.target.value), s))} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Latest video link">
              <input className={field} value={site.youtube.latestVideo.url} onChange={(e) => update((s) => ((s.youtube.latestVideo.url = e.target.value), s))} />
            </Field>
            <Field label="Latest video title (shown in What's new)">
              <input className={field} value={site.youtube.latestVideo.title} onChange={(e) => update((s) => ((s.youtube.latestVideo.title = e.target.value), s))} />
            </Field>
          </div>
        </Card>

        <Card title="Other profiles" hint="Leave empty to hide.">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="X (Twitter) link">
              <input className={field} value={site.socials.x} onChange={(e) => update((s) => ((s.socials.x = e.target.value), s))} />
            </Field>
            <Field label="Facebook link">
              <input className={field} value={site.socials.facebook} onChange={(e) => update((s) => ((s.socials.facebook = e.target.value), s))} />
            </Field>
            <Field label="CodeChef link">
              <input className={field} value={site.socials.codechef ?? ""} onChange={(e) => update((s) => ((s.socials.codechef = e.target.value), s))} />
            </Field>
            <Field label="Codeforces link">
              <input className={field} value={site.socials.codeforces ?? ""} onChange={(e) => update((s) => ((s.socials.codeforces = e.target.value), s))} />
            </Field>
          </div>
        </Card>

        <Card title="What's new" hint="The bell in the header. Newest first; the dot shows visitors there's something they haven't seen.">
          {site.news.map((n, i) => (
            <div key={n.id} className="grid gap-3 rounded-xl border border-[#e9e6dd] p-4 sm:grid-cols-[120px_140px_1fr]">
              <input className={field} type="date" value={n.date} onChange={(e) => update((s) => ((s.news[i].date = e.target.value), s))} />
              <input className={field} placeholder="Tag" value={n.tag} onChange={(e) => update((s) => ((s.news[i].tag = e.target.value), s))} />
              <input className={field} placeholder="Text" value={n.text} onChange={(e) => update((s) => ((s.news[i].text = e.target.value), s))} />
              <input className={`${field} sm:col-span-2`} placeholder="Link: #work, #research or https://…" value={n.href ?? ""} onChange={(e) => update((s) => ((s.news[i].href = e.target.value), s))} />
              <div className="flex gap-2">
                <button className="rounded-full border px-3 py-1 text-xs" disabled={i === 0} onClick={() => update((s) => ([s.news[i - 1], s.news[i]] = [s.news[i], s.news[i - 1]], s))}>
                  ↑
                </button>
                <button className="rounded-full border px-3 py-1 text-xs text-red-600" onClick={() => update((s) => (s.news.splice(i, 1), s))}>
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            className="self-start rounded-full bg-black px-4 py-2 text-sm text-white"
            onClick={() =>
              update((s) => {
                const item: NewsItem = { id: `n-${Date.now().toString(36)}`, date: new Date().toISOString().slice(0, 10), tag: "New", text: "", href: "" };
                s.news.unshift(item);
                return s;
              })
            }
          >
            + Add news
          </button>
        </Card>

        <Card title="Featured projects" hint="Pick four. They get the cards at the top; everything else goes on the 3D carousel. Hidden projects aren't shown anywhere.">
          <div className="grid gap-2 sm:grid-cols-2">
            {allProjects.map((p) => {
              const on = site.featured.includes(p.id);
              const hidden = site.hidden.includes(p.id);
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border border-[#e9e6dd] px-3 py-2 text-sm">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        update((s) => {
                          s.featured = on ? s.featured.filter((f) => f !== p.id) : [...s.featured, p.id].slice(-4);
                          return s;
                        })
                      }
                    />
                    <span className={hidden ? "line-through opacity-50" : ""}>{p.title || "(untitled)"}</span>
                  </label>
                  <button
                    className="text-xs text-[#5c5a55] underline"
                    onClick={() =>
                      update((s) => {
                        s.hidden = hidden ? s.hidden.filter((h) => h !== p.id) : [...s.hidden, p.id];
                        return s;
                      })
                    }
                  >
                    {hidden ? "Show" : "Hide"}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-[#5c5a55]">Featured: {site.featured.length} / 4</p>
        </Card>

        <Card title="Your projects" hint="Add a new project (it goes first). Upload a screenshot or preview image; it's resized for the site automatically.">
          {site.projects.map((p, i) => {
            const set = (fn: (w: WorkItem) => void) => update((s) => (fn(s.projects[i]), s));
            return (
              <div key={p.id} className="grid gap-3 rounded-xl border border-[#e9e6dd] p-4 sm:grid-cols-2">
                <Field label="Title">
                  <input className={field} value={p.title} onChange={(e) => set((w) => (w.title = e.target.value))} />
                </Field>
                <Field label="One-line headline">
                  <input className={field} value={p.headline} onChange={(e) => set((w) => (w.headline = e.target.value))} />
                </Field>
                <div className="sm:col-span-2">
                  <Field label="Description">
                    <textarea className={`${field} min-h-24`} value={p.text} onChange={(e) => set((w) => (w.text = e.target.value))} />
                  </Field>
                </div>
                <Field label="Kind">
                  <select className={field} value={p.kind} onChange={(e) => set((w) => (w.kind = e.target.value as WorkKind))}>
                    <option value="hackathon">Hackathon build</option>
                    <option value="research">Research</option>
                    <option value="side">Side project</option>
                  </select>
                </Field>
                <Field label="Where / when (e.g. Graph Hacks · Oct 2026)">
                  <input className={field} value={p.context} onChange={(e) => set((w) => (w.context = e.target.value))} />
                </Field>
                <Field label="Built with (comma separated)">
                  <input className={field} value={p.stack.join(", ")} onChange={(e) => set((w) => (w.stack = e.target.value.split(",").map((t) => t.trim()).filter(Boolean)))} />
                </Field>
                <Field label="Live site">
                  <input className={field} value={p.live ?? ""} onChange={(e) => set((w) => (w.live = e.target.value || undefined))} />
                </Field>
                <Field label="Code (GitHub)">
                  <input className={field} value={p.code ?? ""} onChange={(e) => set((w) => (w.code = e.target.value || undefined))} />
                </Field>
                <Field label="Video (YouTube)">
                  <input className={field} value={p.youtube ?? ""} onChange={(e) => set((w) => (w.youtube = e.target.value || undefined))} />
                </Field>
                <div className="flex items-center gap-4 sm:col-span-2">
                  {p.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={thumb(p.image)} alt="" className="h-20 w-32 rounded-lg object-cover" />
                  ) : (
                    <div className="grid h-20 w-32 place-items-center rounded-lg bg-[#e9e6dd] text-xs text-[#5c5a55]">No image</div>
                  )}
                  <label className="cursor-pointer rounded-full border border-black px-4 py-2 text-sm">
                    {p.image ? "Replace image" : "Upload image"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const base = await addImage(f, p.title || "project");
                        set((w) => {
                          w.image = base;
                          w.imageAlt = w.imageAlt || w.title;
                        });
                      }}
                    />
                  </label>
                  <button className="ml-auto text-sm text-red-600" onClick={() => update((s) => (s.projects.splice(i, 1), s))}>
                    Delete project
                  </button>
                </div>
              </div>
            );
          })}
          <button className="self-start rounded-full bg-black px-4 py-2 text-sm text-white" onClick={() => update((s) => (s.projects.unshift(EMPTY_PROJECT()), s))}>
            + Add project
          </button>
        </Card>

        <Card title="Photo wall" hint="Extra photos, added after the existing ones.">
          <div className="grid gap-3 sm:grid-cols-2">
            {site.wallPhotos.map((ph, i) => {
              const set = (fn: (w: WallPhoto) => void) => update((s) => (fn(s.wallPhotos[i]), s));
              return (
                <div key={ph.src} className="flex gap-3 rounded-xl border border-[#e9e6dd] p-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={thumb(ph.src)} alt="" className="h-24 w-24 flex-none rounded-lg object-cover" />
                  <div className="flex flex-1 flex-col gap-2">
                    <input className={field} placeholder="Event" value={ph.event} onChange={(e) => set((w) => (w.event = e.target.value))} />
                    <input className={field} placeholder="Result (optional)" value={ph.result ?? ""} onChange={(e) => set((w) => (w.result = e.target.value || undefined))} />
                    <input className={field} placeholder="Describe the photo" value={ph.alt} onChange={(e) => set((w) => (w.alt = e.target.value))} />
                    <button className="self-end text-xs text-red-600" onClick={() => update((s) => (s.wallPhotos.splice(i, 1), s))}>
                      Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          <label className="cursor-pointer self-start rounded-full bg-black px-4 py-2 text-sm text-white">
            + Add photos
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                for (const f of files) {
                  const base = await addImage(f, f.name.replace(/\.[^.]+$/, ""));
                  update((s) => (s.wallPhotos.push({ src: base, alt: "", event: "" }), s));
                }
              }}
            />
          </label>
        </Card>

        <details className="rounded-2xl bg-white p-6 text-sm text-[#5c5a55] shadow-sm">
          <summary className="cursor-pointer font-medium text-black">Setup notes</summary>
          <p className="mt-3">
            Saving on the live site needs a GitHub token. On GitHub: Settings → Developer settings → Fine-grained tokens → generate one for the
            Portfolio- repo with <b>Contents: Read and write</b>. Then in Vercel → Project → Settings → Environment Variables add{" "}
            <code>GITHUB_TOKEN</code>, plus <code>ADMIN_ID</code>, <code>ADMIN_PASSWORD</code> and <code>ADMIN_SESSION_SECRET</code> for this login, and
            redeploy.
          </p>
        </details>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-[#d9d5ca] bg-white/95 px-5 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4">
          <p className={`text-sm ${status.kind === "error" ? "text-red-600" : status.kind === "ok" ? "text-green-700" : "text-[#5c5a55]"}`}>
            {status.kind === "saving" ? "Saving…" : status.text ?? (dirty ? "Unsaved changes" : "All changes saved")}
          </p>
          <button
            onClick={save}
            disabled={!dirty || status.kind === "saving"}
            className="rounded-full bg-[#ff5a1f] px-6 py-3 text-sm font-semibold text-white disabled:opacity-40"
          >
            Save and publish
          </button>
        </div>
      </div>
    </div>
  );
}
