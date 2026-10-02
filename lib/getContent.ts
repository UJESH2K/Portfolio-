// Server-side only. Merges admin-authored rows from Supabase in front of the
// static fallback content, so the site works before Supabase is configured
// and keeps showing content if a table is empty.
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  PROJECTS,
  FREELANCE,
  EXPERIENCE,
  ACHIEVEMENTS,
  HACKATHONS,
  TIMELINE,
  type Project,
  type Experience,
  type Achievement,
  type Hackathon,
  type TimelineEntry,
  type Post,
} from "@/lib/content";

async function fetchRows(table: string) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });
  if (error || !data || data.length === 0) return null;
  return data;
}

function toProject(r: Record<string, any>): Project {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle ?? "",
    description: r.description ?? "",
    stack: r.stack ?? [],
    repo: r.repo ?? undefined,
    live: r.live ?? undefined,
    featured: r.featured ?? false,
    year: r.year,
    imageUrl: r.image_url ?? undefined,
    videoUrl: r.video_url ?? undefined,
  };
}

/** Personal / academic projects — admin rows with category "freelance" are
 * excluded here (see getFreelance) so a project shows in exactly one chapter. */
export async function getProjects(): Promise<Project[]> {
  const rows = await fetchRows("projects");
  if (!rows) return PROJECTS;
  const personal = rows.filter((r) => (r.category ?? "personal") !== "freelance");
  return personal.length > 0 ? personal.map(toProject) : PROJECTS;
}

export async function getFreelance(): Promise<Project[]> {
  const rows = await fetchRows("projects");
  if (!rows) return FREELANCE;
  const freelance = rows.filter((r) => r.category === "freelance");
  return freelance.length > 0 ? freelance.map(toProject) : FREELANCE;
}

/** Internships/employment. Static-only for now — no admin table yet. */
export async function getExperience(): Promise<Experience[]> {
  return EXPERIENCE;
}

export async function getAchievements(): Promise<Achievement[]> {
  const rows = await fetchRows("achievements");
  if (!rows) return ACHIEVEMENTS;
  return rows.map((r) => ({
    id: r.id,
    short: r.short,
    title: r.title,
    detail: r.detail ?? "",
    year: r.year,
    tier: r.tier ?? "bronze",
    href: r.href ?? undefined,
    imageUrl: r.image_url ?? undefined,
  }));
}

export async function getHackathons(): Promise<Hackathon[]> {
  const rows = await fetchRows("hackathons");
  if (!rows) return HACKATHONS;
  return rows.map((r) => ({
    id: r.id,
    event: r.event,
    project: r.project,
    placement: r.placement ?? "",
    year: r.year,
    blurb: r.blurb ?? "",
    href: r.href ?? undefined,
    live: r.live ?? undefined,
    imageUrl: r.image_url ?? undefined,
  }));
}

export async function getTimeline(): Promise<TimelineEntry[]> {
  const rows = await fetchRows("timeline_entries");
  if (!rows) return TIMELINE;
  return rows.map((r) => ({
    year: r.year,
    title: r.title,
    detail: r.detail ?? "",
    tag: r.tag ?? "code",
  }));
}

export async function getPosts(): Promise<Post[]> {
  const rows = await fetchRows("posts");
  if (!rows) return [];
  return rows.map((r) => ({
    id: r.id,
    caption: r.caption,
    imageUrl: r.image_url ?? undefined,
    linkUrl: r.link_url ?? undefined,
    linkLabel: r.link_label ?? undefined,
    createdAt: r.created_at,
  }));
}
