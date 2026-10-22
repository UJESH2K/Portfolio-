import snapshot from "@/content/repos.json";

/** One public GitHub repository, trimmed to what the archive shows. */
export type Repo = {
  name: string;
  description: string;
  language: string;
  stars: number;
  homepage: string;
  url: string;
  pushed: string;
  fork: boolean;
};

const USER = "UJESH2K";

type ApiRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  homepage: string | null;
  html_url: string;
  pushed_at: string;
  fork: boolean;
};

/**
 * Every public repo, newest first. Fetched from GitHub at most once an hour
 * (so new repos appear on their own), falling back to the snapshot in
 * content/repos.json if GitHub is unreachable or rate-limits the build.
 * Forks and the profile/portfolio repos are left out.
 */
export async function getRepos(): Promise<Repo[]> {
  let repos = snapshot as Repo[];
  try {
    const headers: Record<string, string> = { Accept: "application/vnd.github+json" };
    if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    const res = await fetch(`https://api.github.com/users/${USER}/repos?per_page=100&sort=pushed`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = (await res.json()) as ApiRepo[];
      if (Array.isArray(data) && data.length) {
        repos = data.map((r) => ({
          name: r.name,
          description: r.description ?? "",
          language: r.language ?? "",
          stars: r.stargazers_count,
          homepage: r.homepage ?? "",
          url: r.html_url,
          pushed: r.pushed_at.slice(0, 10),
          fork: r.fork,
        }));
      }
    }
  } catch {
    // Keep the snapshot.
  }
  return repos.filter((r) => !r.fork && r.name !== USER && !/^portfolio/i.test(r.name));
}
