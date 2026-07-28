// lib/data.ts
// Single source of truth for all dashboard content.
//
// Personal facts (handles, ratings, real URLs, phone, email) are marked TODO
// — search for `TODO:` and swap with real values. Visual placeholders
// (game titles, news headlines, project names) are kept realistic so the
// page reads naturally while you're filling in the real data.

import type {
  Achievement,
  Extra,
  Friend,
  HackathonWin,
  NewsItem,
  NowPlaying,
  Profile,
  Project,
  SettingsPanel,
  Social,
  StoreItem,
} from "./types";

// ─── Profile ─────────────────────────────────────────────────────────────

export const PROFILE: Profile = {
  gamertag: "TODO: Gamertag",
  realName: "TODO: Real name",
  bio: "TODO: One-line bio",
  // TODO: paste your own image into /public/avatar.jpg and reference it here
  avatarUrl: undefined,
  status: "online",
  friendCode: "TODO-XXXX-XXXX-XXXX",
  location: "TODO: City, Country",
};

export const SETTINGS: SettingsPanel = {
  status: "online",
  dnd: false,
  friendCode: PROFILE.friendCode,
  account: "TODO: Account handle",
};

// ─── Achievements / leaderboards (Codeforces · CodeChef · LeetCode) ──────

export const ACHIEVEMENTS: Achievement[] = [
  {
    platform: "codeforces",
    handle: "TODO: CF handle",
    rating: 1450,
    rank: "Specialist",
    contestsPlayed: 64,
    // TODO: replace with real profile URL
    profileUrl: "https://codeforces.com/profile/TODO",
  },
  {
    platform: "codechef",
    handle: "TODO: CC handle",
    rating: 1780,
    rank: "3★",
    contestsPlayed: 41,
    profileUrl: "https://www.codechef.com/users/TODO",
  },
  {
    platform: "leetcode",
    handle: "TODO: LC handle",
    rating: 1850,
    rank: "Knight",
    contestsPlayed: 220,
    profileUrl: "https://leetcode.com/TODO",
  },
];

// ─── Hackathon wins ──────────────────────────────────────────────────────

export const HACKATHONS: HackathonWin[] = [
  {
    title: "Reactors World Model Hackathon",
    organizer: "Reactors",
    date: "2026-03",
    projectName: "WorldForge",
    description:
      "TODO: One-line summary of what you built and the placement.",
    demoUrl: undefined, // TODO: paste demo / submission URL
    coverGradient: "linear-gradient(135deg,#0d2f4f 0%,#1c6dd0 100%)",
  },
];

// ─── Projects ───────────────────────────────────────────────────────────

export const PROJECTS: Project[] = [
  {
    id: "p1",
    title: "TODO: Project Alpha",
    tagline: "TODO: One-line tagline",
    tags: ["Next.js", "TypeScript"],
    url: undefined,
    repoUrl: undefined,
    coverGradient: "linear-gradient(135deg,#101820,#1f3b4d)",
  },
  {
    id: "p2",
    title: "TODO: Project Beta",
    tagline: "TODO: One-line tagline",
    tags: ["Python", "PyTorch"],
    coverGradient: "linear-gradient(135deg,#1a0d20,#4d1f5a)",
  },
  {
    id: "p3",
    title: "TODO: Project Gamma",
    tagline: "TODO: One-line tagline",
    tags: ["React", "WebGL"],
    coverGradient: "linear-gradient(135deg,#0d1f1a,#1f5a3a)",
  },
];

// ─── Extracurriculars (anime · football · games · music) ─────────────────

export const EXTRAS: Extra[] = [
  { category: "sport", label: "Football", note: "Wing-back, weekend 5-a-side" },
  { category: "game",  label: "Elden Ring" },
  { category: "game",  label: "Sekiro: Shadows Die Twice" },
  { category: "game",  label: "Deluxe Steam hoarder" },
  { category: "anime", label: "One Piece" },
  { category: "anime", label: "Dragon Ball Z" },
  { category: "anime", label: "Naruto" },
];

// ─── Now playing / recent games ──────────────────────────────────────────

export const NOW_PLAYING: NowPlaying[] = [
  {
    title: "One-Armed Robber",
    platform: "steam",
    hoursPlayed: 29,
    lastPlayed: "Today",
    coverGradient: "linear-gradient(135deg,#1b1b1b,#3a2a2a)",
    status: "playing",
  },
  {
    title: "Battlefield 6",
    platform: "steam",
    hoursPlayed: 14,
    lastPlayed: "2 days ago",
    coverGradient: "linear-gradient(135deg,#1c1c1c,#3d4a3a)",
    status: "recent",
  },
  {
    title: "R.E.P.O.",
    platform: "steam",
    hoursPlayed: 6,
    lastPlayed: "1 week ago",
    coverGradient: "linear-gradient(135deg,#101010,#2a1a2a)",
    status: "recent",
  },
  {
    title: "Counter-Strike 2",
    platform: "steam",
    hoursPlayed: 410,
    lastPlayed: "3 days ago",
    coverGradient: "linear-gradient(135deg,#1a1a1a,#3a3a3a)",
    status: "recent",
  },
  {
    title: "Sky: Children of the Light",
    platform: "steam",
    hoursPlayed: 22,
    lastPlayed: "1 month ago",
    coverGradient: "linear-gradient(135deg,#1d2b3a,#3b6ea5)",
    status: "recent",
  },
];

// ─── Friends / activity feed ─────────────────────────────────────────────

export const FRIENDS: Friend[] = [
  {
    gamertag: "TODO: Friend 1",
    avatarGradient: "linear-gradient(135deg,#1f3b4d,#2e7d8f)",
    status: "online",
    activity: "Playing Battlefield 6",
  },
  {
    gamertag: "TODO: Friend 2",
    avatarGradient: "linear-gradient(135deg,#3d2a4d,#7d4d8f)",
    status: "online",
    activity: "Playing Elden Ring",
  },
  {
    gamertag: "TODO: Friend 3",
    avatarGradient: "linear-gradient(135deg,#2a2a2a,#5a5a5a)",
    status: "away",
    activity: "Idle · 30 min ago",
  },
  {
    gamertag: "TODO: Friend 4",
    avatarGradient: "linear-gradient(135deg,#4d2a1f,#a04d2e)",
    status: "dnd",
    activity: "Do Not Disturb",
  },
  {
    gamertag: "TODO: Friend 5",
    avatarGradient: "linear-gradient(135deg,#1f3d4d,#3d8fa0)",
    status: "offline",
  },
];

// ─── News / What's new ───────────────────────────────────────────────────

export const NEWS: NewsItem[] = [
  {
    id: "n1",
    title: "Alchemist's Bunker — Big Update",
    category: "Game Update",
    date: "2026-07-24",
    coverGradient: "linear-gradient(135deg,#2a1f0d,#7a5a1f)",
  },
  {
    id: "n2",
    title: "Resonance: A Plague Tale Legacy — Long Gameplay Trailer",
    category: "Release",
    date: "2026-07-22",
    coverGradient: "linear-gradient(135deg,#1f2a2a,#4d6a6a)",
  },
  {
    id: "n3",
    title: "Kingdom Come Deliverance — The Board Game · Gameplay Preview",
    category: "Indie",
    date: "2026-07-10",
    coverGradient: "linear-gradient(135deg,#3a2a1f,#7a5a3a)",
  },
  {
    id: "n4",
    title: "Sky: Dear Van Gogh Major Update",
    category: "Major Update",
    date: "2026-07-17",
    coverGradient: "linear-gradient(135deg,#1a2a4d,#3a5a9f)",
  },
  {
    id: "n5",
    title: "Battlefield 6 — Season 4 Live",
    category: "Event",
    date: "2026-07-25",
    coverGradient: "linear-gradient(135deg,#1a2a1a,#4d6a3a)",
  },
];

// ─── Store / Recommended ────────────────────────────────────────────────

export const STORE_RECOMMENDED: StoreItem[] = [
  { id: "s1", title: "Cinderstorm",  publisher: "Hollow Forge", priceINR: 1299, coverGradient: "linear-gradient(135deg,#2a0d0d,#7a1f1f)", tag: "NEW" },
  { id: "s2", title: "Neon Riders",  publisher: "Pixel Drift",   priceINR:  799, coverGradient: "linear-gradient(135deg,#0d1a2a,#1f3b7a)", tag: "NEW" },
  { id: "s3", title: "Lone Howl",    publisher: "Tundra",        priceINR:  499, coverGradient: "linear-gradient(135deg,#0d2a1f,#1f7a4d)", tag: "SALE" },
  { id: "s4", title: "Mech Pilgrim", publisher: "Iron Veil",     priceINR: 1999, coverGradient: "linear-gradient(135deg,#2a2a0d,#7a7a1f)", tag: "TOP" },
];

export const STORE_TOP_SELLERS: StoreItem[] = [
  { id: "t1", title: "Halo: Master Chief Collection", publisher: "Microsoft", priceINR: 4999, coverGradient: "linear-gradient(135deg,#0d2a4d,#3b6ea5)", tag: "TOP" },
  { id: "t2", title: "Cyberpunk 2077",                 publisher: "CDPR",      priceINR:  899, coverGradient: "linear-gradient(135deg,#4d1f0d,#f5a623)", tag: "SALE" },
  { id: "t3", title: "Palworld 1.0",                  publisher: "Pocketpair", priceINR: 1300, coverGradient: "linear-gradient(135deg,#0d4d1f,#22c55e)", tag: "NEW" },
  { id: "t4", title: "Warframe",                       publisher: "Digital Extremes", priceINR: 0,    coverGradient: "linear-gradient(135deg,#0d1a2a,#1f3b7a)" },
  { id: "t5", title: "Assassin's Creed Black Flag Resynced", publisher: "Ubisoft", priceINR: 4199, coverGradient: "linear-gradient(135deg,#0d2a1a,#3a5a2a)", tag: "TOP" },
];

// ─── Socials / contact / resume ──────────────────────────────────────────

export const SOCIALS: Social[] = [
  { id: "linkedin",   platform: "linkedin",   label: "LinkedIn",    href: "https://linkedin.com/in/TODO" },
  { id: "twitter",    platform: "twitter",    label: "Twitter / X", href: "https://x.com/TODO" },
  { id: "github",     platform: "github",     label: "GitHub",      href: "https://github.com/TODO" },
  { id: "codeforces", platform: "codeforces", label: "Codeforces",  href: "https://codeforces.com/profile/TODO" },
  { id: "codechef",   platform: "codechef",   label: "CodeChef",    href: "https://www.codechef.com/users/TODO" },
  { id: "leetcode",   platform: "leetcode",   label: "LeetCode",    href: "https://leetcode.com/TODO" },
  { id: "steam",      platform: "steam",      label: "Steam",       href: "https://steamcommunity.com/id/TODO" },
  { id: "email",      platform: "email",      label: "Email",       href: "mailto:you@example.com" },
  { id: "phone",      platform: "phone",      label: "Phone",       href: "tel:+910000000000" },
  { id: "resume",     platform: "resume",     label: "Resume (PDF)", href: "/resume.pdf" }, // drop resume.pdf into /public/
];
