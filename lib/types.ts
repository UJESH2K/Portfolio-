// lib/types.ts
// TypeScript contracts for every section. This file is the single source of
// truth for the data shape — both the dashboard components and the future
// `/admin` route import from here.

export type Platform =
  | "codeforces"
  | "codechef"
  | "leetcode"
  | "steam"
  | "xbox"
  | "playstation";

export type OnlineStatus = "online" | "away" | "dnd" | "offline";

// ─── Profile / Settings ──────────────────────────────────────────────────

export interface Profile {
  gamertag: string;
  realName: string;
  bio: string;
  avatarUrl?: string;
  status: OnlineStatus;
  friendCode: string;
  location?: string;
}

export interface SettingsPanel {
  status: OnlineStatus;
  dnd: boolean;
  friendCode: string;
  account: string;
}

// ─── Competitive programming / achievements ──────────────────────────────

export interface Achievement {
  platform: Platform;
  handle: string;
  rating: number;
  rank: string; // e.g. "Specialist", "3★", "Knight"
  contestsPlayed?: number;
  profileUrl: string;
}

// ─── Now playing / Recent games ───────────────────────────────────────────

export type PlayStatus = "playing" | "recent" | "completed";

export interface NowPlaying {
  title: string;
  platform: Platform;
  hoursPlayed?: number;
  lastPlayed?: string; // human-readable, e.g. "Today", "2 days ago"
  coverGradient: string; // CSS gradient string
  status: PlayStatus;
}

// ─── News / What's new ───────────────────────────────────────────────────

export interface NewsItem {
  id: string;
  title: string;
  category: string; // "Game Update", "Release", "Indie"
  date: string;     // ISO date
  coverGradient: string;
  url?: string;
}

// ─── Friends / Activity feed ─────────────────────────────────────────────

export interface Friend {
  gamertag: string;
  avatarGradient: string;
  status: OnlineStatus;
  activity?: string; // "Playing Battlefield 6"
}

// ─── Store / Recommended ────────────────────────────────────────────────

export type StoreTag = "NEW" | "SALE" | "TOP" | "UPCOMING";

export interface StoreItem {
  id: string;
  title: string;
  publisher: string;
  priceINR: number;
  coverGradient: string;
  tag?: StoreTag;
}

// ─── Hackathons, projects, extras ────────────────────────────────────────

export interface HackathonWin {
  title: string;
  organizer: string;
  date: string;
  projectName: string;
  description: string;
  demoUrl?: string;
  coverGradient: string;
}

export interface Project {
  id: string;
  title: string;
  tagline: string;
  tags: string[];
  url?: string;
  repoUrl?: string;
  coverGradient: string;
}

export type ExtraCategory = "sport" | "game" | "anime" | "music" | "other";

export interface Extra {
  category: ExtraCategory;
  label: string;
  note?: string;
}

// ─── Socials / contact ───────────────────────────────────────────────────

export type SocialPlatform =
  | "linkedin"
  | "twitter"
  | "github"
  | "codeforces"
  | "codechef"
  | "leetcode"
  | "steam"
  | "email"
  | "phone"
  | "resume";

export interface Social {
  id: string;
  platform: SocialPlatform;
  label: string;
  href: string;
}
