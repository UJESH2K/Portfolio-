// Server-only. Where /edit reads and writes the site's editable content.
//
// In production the content lives in the GitHub repo: a save is one commit
// (content/site.json plus any uploaded images), and Vercel redeploys the
// site from it in about a minute. That needs GITHUB_TOKEN (a fine-grained
// token with "Contents: read and write" on the repo). Running locally
// without a token, saves go straight to disk instead.
import { promises as fs } from "node:fs";
import path from "node:path";

const REPO = process.env.GITHUB_REPO ?? "UJESH2K/Portfolio-";
const BRANCH = process.env.GITHUB_BRANCH ?? "main";
export const CONTENT_PATH = "content/site.json";

export const storeMode = () => (process.env.GITHUB_TOKEN ? "github" : process.env.NODE_ENV === "production" ? "none" : "disk");

async function gh(url: string, init: RequestInit = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${url}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(init.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return res.json();
}

/** The current content: the latest commit on GitHub, or the file on disk. */
export async function readContent(): Promise<unknown> {
  if (storeMode() === "github") {
    const file = await gh(`/contents/${CONTENT_PATH}?ref=${BRANCH}`);
    return JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
  }
  return JSON.parse(await fs.readFile(path.join(process.cwd(), CONTENT_PATH), "utf8"));
}

export type UploadFile = { path: string; base64: string };

/** Save the content and any new images, as one commit when on GitHub. */
export async function writeContent(content: unknown, uploads: UploadFile[], message: string) {
  const json = JSON.stringify(content, null, 2) + "\n";
  const mode = storeMode();
  if (mode === "none") throw new Error("Saving is not set up: add GITHUB_TOKEN in the Vercel project settings.");
  if (mode === "disk") {
    await fs.writeFile(path.join(process.cwd(), CONTENT_PATH), json, "utf8");
    for (const u of uploads) {
      const dest = path.join(process.cwd(), u.path);
      await fs.mkdir(path.dirname(dest), { recursive: true });
      await fs.writeFile(dest, Buffer.from(u.base64, "base64"));
    }
    return { commit: null };
  }

  // One commit: blobs for every file, a tree on top of the branch head, a
  // commit, then move the branch to it.
  const ref = await gh(`/git/ref/heads/${BRANCH}`);
  const headSha: string = ref.object.sha;
  const head = await gh(`/git/commits/${headSha}`);
  const files = [{ path: CONTENT_PATH, base64: Buffer.from(json, "utf8").toString("base64") }, ...uploads];
  const tree = await Promise.all(
    files.map(async (f) => {
      const blob = await gh(`/git/blobs`, { method: "POST", body: JSON.stringify({ content: f.base64, encoding: "base64" }) });
      return { path: f.path, mode: "100644", type: "blob", sha: blob.sha as string };
    })
  );
  const newTree = await gh(`/git/trees`, { method: "POST", body: JSON.stringify({ base_tree: head.tree.sha, tree }) });
  const commit = await gh(`/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [headSha] }),
  });
  await gh(`/git/refs/heads/${BRANCH}`, { method: "PATCH", body: JSON.stringify({ sha: commit.sha }) });
  return { commit: commit.sha as string };
}
