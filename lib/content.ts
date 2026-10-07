// lib/content.ts
// ─────────────────────────────────────────────────────────────────────────
// SINGLE SOURCE OF TRUTH for everything the site displays.
//
// Content is split into three honest categories, not one flat list:
//   PROJECTS   — personal / academic work
//   FREELANCE  — paid client work
//   EXPERIENCE — internships / employment
//
// Anything I could NOT verify is marked:
//     NEEDS_INPUT
// Search this file for "NEEDS_INPUT" to find every gap. The UI is written to
// gracefully hide any entry still marked that way, so the site looks correct
// before you fill them in.
// ─────────────────────────────────────────────────────────────────────────

export const NEEDS_INPUT = "NEEDS_INPUT" as const;

/** True when a value is still an unfilled placeholder. */
export const isMissing = (v?: string): boolean =>
  !v || v === NEEDS_INPUT || v.startsWith(NEEDS_INPUT);

// ─── Identity ────────────────────────────────────────────────────────────

export const PROFILE = {
  name: "Ujesh Kumar Yadav",
  handle: "UJESH2K",
  title: "Software Engineer",
  tagline: "Full-stack · Applied AI · GPU systems",
  location: "Bengaluru, India",
  bio: "Software engineer shipping production full-stack features and applied AI on AWS. Built and deployed features end to end at two startups, working directly with founders.",
  /** The address printed on the October 2026 resume. */
  email: "ujeshyadav20k5@gmail.com",
  /** Drop a square photo at /public/avatar.png to replace the pixel avatar. */
  avatarUrl: "/avatar.png",
  githubJoined: "December 2023",
  publicRepos: 65,
  /** Put your PDF at /public/resume.pdf. */
  resumeUrl: "/resume.pdf",
} as const;

/** Background-removed portrait for the hero. Until it exists, Cutout falls
 * back to a small 3D placeholder in the same footprint. */
export const PORTRAIT = {
  src: "/portrait.png",
  alt: "Ujesh Kumar Yadav",
};

export type Stat = { value: string; label: string };

export const STATS: Stat[] = [
  { value: "7×", label: "Hackathon wins" },
  { value: "20×", label: "National-level finals" },
  { value: "50+", label: "Hackathons entered" },
  { value: "65+", label: "Public projects" },
  { value: "1700", label: "CodeChef rating" },
];

// ─── Socials ─────────────────────────────────────────────────────────────

export type Social = {
  id: string;
  label: string;
  handle: string;
  href: string;
  /** Tailwind-ready accent used for the tile glow. */
  color: string;
};

export const SOCIALS: Social[] = [
  {
    id: "github",
    label: "GitHub",
    handle: "@UJESH2K",
    href: "https://github.com/UJESH2K",
    color: "#e6edf3",
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    handle: "ujesh-kumar-yadav",
    href: "https://www.linkedin.com/in/ujesh-kumar-yadav/",
    color: "#0a66c2",
  },
  {
    id: "instagram",
    label: "Instagram",
    handle: "@ujeshitiz",
    href: "https://www.instagram.com/ujeshitiz/",
    color: "#e4405f",
  },
  {
    // NEEDS_INPUT: paste the profile URL and handle; hidden until then.
    id: "x",
    label: "X (Twitter)",
    handle: NEEDS_INPUT,
    href: NEEDS_INPUT,
    color: "#e7e9ea",
  },
  {
    // NEEDS_INPUT: paste the profile URL and handle; hidden until then.
    id: "facebook",
    label: "Facebook",
    handle: NEEDS_INPUT,
    href: NEEDS_INPUT,
    color: "#1877f2",
  },
  {
    id: "holopin",
    label: "Holopin",
    handle: "@ujesh2k",
    href: "https://holopin.io/@ujesh2k",
    color: "#f5a623",
  },
  {
    id: "email",
    label: "Email",
    handle: "ujeshyadav20k5@gmail.com",
    href: "mailto:ujeshyadav20k5@gmail.com",
    color: "#22c55e",
  },
];

// ─── Competitive programming ─────────────────────────────────────────────
// NEEDS_INPUT: none of these handles are public on your GitHub. Fill in the
// handle + profileUrl and the card appears; leave them and it stays hidden.

export type CpProfile = {
  id: string;
  platform: string;
  handle: string;
  rating?: string;
  rank?: string;
  profileUrl: string;
  color: string;
};

export const CP_PROFILES: CpProfile[] = [
  {
    id: "codeforces",
    platform: "Codeforces",
    handle: NEEDS_INPUT,
    rating: NEEDS_INPUT,
    rank: NEEDS_INPUT,
    profileUrl: NEEDS_INPUT,
    color: "#1f8acb",
  },
  {
    id: "codechef",
    platform: "CodeChef",
    handle: NEEDS_INPUT,
    rating: NEEDS_INPUT,
    rank: NEEDS_INPUT,
    profileUrl: NEEDS_INPUT,
    color: "#a86544",
  },
  {
    id: "leetcode",
    platform: "LeetCode",
    handle: NEEDS_INPUT,
    rating: NEEDS_INPUT,
    rank: NEEDS_INPUT,
    profileUrl: NEEDS_INPUT,
    color: "#ffa116",
  },
];

// ─── Achievements (the trophy shelf) ─────────────────────────────────────

export type Achievement = {
  id: string;
  /** Short label used on the trophy itself. */
  short: string;
  title: string;
  detail: string;
  year: string;
  /** "gold" | "silver" | "bronze" drives the trophy material. */
  tier: "gold" | "silver" | "bronze";
  href?: string;
  imageUrl?: string;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "hack-5x",
    short: "5×",
    title: "5× Hackathon Winner",
    detail:
      "Five hackathon wins, including three national-level finalist placements.",
    year: "2024–2025",
    tier: "gold",
  },
  {
    id: "gsc-2024",
    short: "GSC",
    title: "Google Solution Challenge 2024 — Finalist",
    detail:
      "Qualified for the Google Solution Challenge, a global build competition run across Google Developer Student Clubs.",
    year: "2024",
    tier: "gold",
    href: "https://github.com/UJESH2K/gdsc-2024-solution-challenge",
  },
  {
    id: "icpc-2024",
    short: "ICPC",
    title: "ICPC 2024 Amritapuri — Online Prelims Qualified",
    detail:
      "Cleared the online preliminary round of the International Collegiate Programming Contest, Amritapuri regional.",
    year: "2024",
    tier: "gold",
  },
  {
    id: "industry-ml",
    short: "ML",
    title: "ML Projects with Microsoft, SAP & AICTE",
    detail:
      "Machine-learning project work delivered through Microsoft, SAP and the AICTE–Edunet Foundation programmes.",
    year: "2024–2025",
    tier: "silver",
  },
  {
    id: "code-club-lead",
    short: "LEAD",
    title: "Technical Lead — Code Club",
    detail:
      "Organised AI/ML events and competitions on campus as the club's technical lead.",
    year: "2024–2025",
    tier: "silver",
  },
  {
    id: "hacktoberfest-25",
    short: "HF25",
    title: "Hacktoberfest 2025 Contributor",
    detail:
      "Open-source contributions recognised with a Hacktoberfest 2025 badge, earned 5 October 2025.",
    year: "2025",
    tier: "bronze",
    href: "https://holopin.io/@ujesh2k",
  },
];

// ─── Hackathons ───────────────────────────────────────────────────────────
// NEEDS_INPUT: I can name the events tied to public repos, but placements and
// prize details are not published anywhere I can read. Fill in `placement`.

export type Hackathon = {
  id: string;
  event: string;
  project: string;
  placement: string;
  year: string;
  blurb: string;
  href?: string;
  live?: string;
  imageUrl?: string;
};

export const HACKATHONS: Hackathon[] = [
  {
    id: "gsc24",
    event: "Google Solution Challenge",
    project: "GDSC Solution Challenge Build",
    placement: "Finalist",
    year: "2024",
    blurb:
      "Built and submitted a solution targeting the UN Sustainable Development Goals for Google's global student competition.",
    href: "https://github.com/UJESH2K/gdsc-2024-solution-challenge",
    live: "https://gdsc-2024-solution-challenge.vercel.app",
    imageUrl: "/hackathons/gsc24.jpg",
  },
  {
    id: "nmit25",
    event: "NMIT Hacks 2025",
    project: "NMIT-HACK-25",
    placement: NEEDS_INPUT,
    year: "2025",
    blurb: "Web3 and blockchain build shipped over the NMIT Hacks weekend.",
    href: "https://github.com/UJESH2K/Nmit-HACK-25",
    live: "https://nmit-hack-25.vercel.app",
  },
  {
    id: "bnb-agents",
    event: "BNB Chain Hackathon",
    project: "Agents Playground",
    placement: NEEDS_INPUT,
    year: "2025",
    blurb:
      "AI trading agents competing on prediction markets, settled fully on-chain on BNB Chain.",
    href: "https://github.com/UJESH2K/CRYPTO-AGENT-TRAINING",
    live: "https://crypto-agent-training.vercel.app",
  },
  {
    id: "blinky",
    event: "ADHD / Accessibility Hack",
    project: "Blinky",
    placement: NEEDS_INPUT,
    year: "2025",
    blurb:
      "Holds the one thing you sat down to do, notices when you drift, and reminds you on the device that distracted you.",
    href: "https://github.com/UJESH2K/ADHD-hack",
    live: "https://hhhs-smoky.vercel.app",
  },
  {
    id: "uvce-arcade",
    event: "UVCE Hackathon",
    project: "Arcade",
    placement: NEEDS_INPUT,
    year: "2024",
    blurb: "Arcade-themed build from the UVCE hackathon.",
    href: "https://github.com/UJESH2K/HACKATHON-UVCE--ARCADE",
  },
  {
    id: "powerrangers",
    event: "PowerRangers Hackathon",
    project: "PowerRangers_43",
    placement: NEEDS_INPUT,
    year: "2024",
    blurb: "Team hackathon project built as squad 43.",
    href: "https://github.com/UJESH2K/PowerRangers_43",
  },
  {
    id: "cardano",
    event: "Cardano Hackathon",
    project: "NEEDS_INPUT — project name",
    placement: NEEDS_INPUT,
    year: "2026",
    blurb: "NEEDS_INPUT: add what was built and the placement.",
    imageUrl: "/hackathons/cardano.jpg",
  },
  {
    id: "cypher",
    event: "Cypher Hackathon",
    project: "NEEDS_INPUT — project name",
    placement: NEEDS_INPUT,
    year: "2026",
    blurb: "NEEDS_INPUT: add what was built and the placement.",
    imageUrl: "/hackathons/cypher.jpg",
  },
  {
    id: "denova",
    event: "DeNova Hackathon",
    project: "NEEDS_INPUT — project name",
    placement: NEEDS_INPUT,
    year: "2026",
    blurb: "NEEDS_INPUT: add what was built and the placement.",
    imageUrl: "/hackathons/denova.jpg",
  },
  {
    id: "inception",
    event: "Inception Hackathon",
    project: "NEEDS_INPUT — project name",
    placement: NEEDS_INPUT,
    year: "2026",
    blurb: "NEEDS_INPUT: add what was built and the placement.",
    imageUrl: "/hackathons/inception.jpg",
  },
];

// ─── Projects — personal / academic work ─────────────────────────────────

export type Project = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  stack: string[];
  repo?: string;
  live?: string;
  /** Featured projects get the large case-study treatment. */
  featured?: boolean;
  year: string;
  /** Set for projects added from /admin — overrides the /work/<id>.jpg convention. */
  imageUrl?: string;
  /** A short muted demo clip, shown instead of imageUrl where present. */
  videoUrl?: string;
};

export const PROJECTS: Project[] = [
  {
    id: "gradmesh",
    title: "GradMesh v4",
    subtitle: "Every GPU on your network, one training cluster",
    description:
      "Turns the idle consumer GPUs already sitting on a local network into a single coordinated training cluster. One machine hosts, everyone else pastes one line. The mesh measures what each device can actually do, sizes the work to match, and trains a shared model across all of them. Built on a FastAPI coordinator with worker agents and round-synchronised training using FedAvg aggregation.",
    stack: ["TypeScript", "Python", "FastAPI", "PyTorch", "FedAvg", "YOLO"],
    repo: "https://github.com/UJESH2K/Gradmesh-v4",
    featured: true,
    year: "2026",
  },
  {
    id: "blinky",
    title: "Blinky",
    subtitle: "Attention that remembers on your behalf",
    description:
      "Focus apps block distractions without knowing what you were trying to do. Blinky holds your stated intent, watches for that specific thing being abandoned, and quotes it back to you. Screenshots are never stored: frames are analysed then thrown away, and the observations table has no image column, so the privacy guarantee is enforced by schema rather than by discipline.",
    stack: ["TypeScript", "Vision models", "Supabase", "Next.js"],
    repo: "https://github.com/UJESH2K/ADHD-hack",
    live: "https://hhhs-smoky.vercel.app",
    featured: true,
    year: "2025",
    imageUrl: "/work/blinky.jpg",
  },
  {
    id: "chitoor",
    title: "Chitoor",
    subtitle: "2,000 acres, mapped by drone, segmented by a model we trained ourselves",
    description:
      "A drone survey of roughly 2,000 acres of farmland, flown and mapped in the field by a small team of four students selected from the whole college. Out in the middle of nowhere with no shortcuts available, we traced every plant boundary from the aerial imagery by hand first, then trained a segmentation model to do it automatically — the fieldwork most ML case studies skip straight past.",
    stack: ["Python", "Drone survey", "Computer vision", "Image segmentation"],
    featured: true,
    year: "2024",
    imageUrl: "/work/chitoor.jpg",
  },
  {
    id: "agents-playground",
    title: "Agents Playground",
    subtitle: "AI trading agents, fully on-chain",
    description:
      "Three competing AI trading agents (naive arbitrage, mean reversion and momentum) trade against a synthetic price feed on prediction markets settled on BNB Chain. A Node.js orchestrator runs the market simulator and agent loop, talking to the chain through ethers.js.",
    stack: ["Node.js", "Solidity", "ethers.js", "BNB Chain", "Express"],
    repo: "https://github.com/UJESH2K/CRYPTO-AGENT-TRAINING",
    live: "https://crypto-agent-training.vercel.app",
    featured: true,
    year: "2025",
  },
  {
    id: "gpu-intersection",
    title: "GPU Intersection",
    subtitle: "GPU scheduling research",
    description:
      "Research work on GPU workload intersection and sharing that fed into the GradMesh line of projects.",
    stack: ["Python", "CUDA"],
    repo: "https://github.com/UJESH2K/gpu-intersection",
    year: "2025",
  },
  {
    id: "contexcam",
    title: "ContexCam",
    subtitle: "Context-aware camera pipeline",
    description:
      "NEEDS_INPUT: add a short description. Python computer-vision project.",
    stack: ["Python", "OpenCV"],
    repo: "https://github.com/UJESH2K/contexcam",
    year: "2025",
  },
  {
    id: "skin-cancer",
    title: "Skin Cancer Prediction",
    subtitle: "Medical imaging classifier",
    description:
      "Deep-learning classifier for skin lesion images, built as part of the applied ML project track.",
    stack: ["Python", "TensorFlow", "Jupyter"],
    repo: "https://github.com/UJESH2K/Skin-cancer-prediction",
    year: "2024",
  },
  {
    id: "disaster",
    title: "Natural Disaster Prediction",
    subtitle: "Forecasting from environmental signals",
    description:
      "Model that predicts natural-disaster risk from environmental time-series data.",
    stack: ["Python", "scikit-learn", "Pandas"],
    repo: "https://github.com/UJESH2K/Natural-disaster-prediction-",
    year: "2024",
  },
  {
    id: "ai-resume",
    title: "AI Resume Builder",
    subtitle: "Resumes that write themselves",
    description:
      "Tool that drafts and formats resumes from structured input using language models.",
    stack: ["TypeScript", "Next.js", "LLM APIs"],
    repo: "https://github.com/UJESH2K/AI-RESUME-builder-",
    year: "2025",
  },
  {
    id: "attention-tracker",
    title: "Attention Tracker",
    subtitle: "Focus measurement from webcam",
    description:
      "Computer-vision attention tracking, the research that later became Blinky.",
    stack: ["Python", "OpenCV", "MediaPipe"],
    repo: "https://github.com/UJESH2K/Attention-tracker",
    year: "2024",
  },
  {
    id: "printprfect",
    title: "printprfect",
    subtitle: "NEEDS_INPUT — one-line pitch",
    description: "NEEDS_INPUT: add a description for this one.",
    stack: ["HTML", "JavaScript"],
    repo: "https://github.com/UJESH2K/printprfect",
    live: "https://printprfect.vercel.app",
    year: "2026",
  },
  {
    id: "dryp",
    title: "DRYP Store",
    subtitle: "Commerce front-end",
    description: "Storefront build with a full product and checkout flow.",
    stack: ["TypeScript", "Next.js"],
    repo: "https://github.com/UJESH2K/DRYP-store",
    live: "https://dryp-store-sable.vercel.app",
    year: "2025",
  },
];

// ─── Freelance / client work ──────────────────────────────────────────────

export const FREELANCE: Project[] = [
  {
    id: "nexr",
    title: "NEXR",
    subtitle: "NEEDS_INPUT — one-line pitch",
    description:
      "NEEDS_INPUT: add the client and two sentences on what NEXR does — this is client work, not a personal repo experiment.",
    stack: ["TypeScript", "Next.js"],
    repo: "https://github.com/UJESH2K/NEXR",
    live: "https://nex-alpha-six.vercel.app",
    year: "2026",
    imageUrl: "/work/nexr.jpg",
    videoUrl: "/reel/nexr.mp4",
  },
  {
    id: "edactly",
    title: "Edactly",
    subtitle: NEEDS_INPUT,
    description: "NEEDS_INPUT: add the client and two sentences on what Edactly does.",
    stack: [],
    year: "2026",
    imageUrl: "/work/edactly.jpg",
  },
  {
    id: "hitachi",
    title: "Hitachi",
    subtitle: NEEDS_INPUT,
    description: "NEEDS_INPUT: add two sentences on what this build was for Hitachi.",
    stack: [],
    year: "2026",
    imageUrl: "/work/hitachi.jpg",
  },
  {
    id: "resort",
    title: "Resort booking site",
    subtitle: "Freelance client build",
    description: "NEEDS_INPUT: add the client name and a two-sentence pitch.",
    stack: [],
    year: "2026",
    imageUrl: "/work/resort.jpg",
    videoUrl: "/reel/resort.mp4",
  },
  {
    id: "inceptio",
    title: "Inceptio",
    subtitle: "Freelance client build",
    description: "NEEDS_INPUT: add the client name and a two-sentence pitch.",
    stack: [],
    year: "2026",
    imageUrl: "/work/inceptio.jpg",
    videoUrl: "/reel/inceptio.mp4",
  },
];

// ─── Experience — internships & employment ────────────────────────────────

export type Experience = {
  id: string;
  company: string;
  role: string;
  period: string;
  summary: string;
  imageUrl?: string;
};

export const EXPERIENCE: Experience[] = [
  {
    id: "easemed",
    company: "Easemed",
    role: NEEDS_INPUT,
    period: NEEDS_INPUT,
    summary:
      "NEEDS_INPUT: add your role title, dates, and two sentences on what you worked on during the internship.",
    imageUrl: "/work/easemed.jpg",
  },
];

// ─── Skills ────────────────────────────────────────────────────────────────

export const SKILLS: { group: string; items: string[] }[] = [
  {
    group: "Languages",
    items: ["Python", "C++", "C", "TypeScript", "JavaScript", "Java", "Rust", "Solidity", "Move"],
  },
  {
    group: "ML / AI",
    items: ["PyTorch", "TensorFlow", "scikit-learn", "OpenCV", "Pandas", "Matplotlib"],
  },
  {
    group: "Web",
    items: ["React", "Next.js", "Angular", "Node.js", "Flask", "Three.js"],
  },
  {
    group: "Infra",
    items: ["AWS", "Docker", "Firebase", "Supabase", "MongoDB", "MySQL", "Raspberry Pi"],
  },
  {
    group: "Tools",
    items: ["Git", "Figma", "Unity"],
  },
];

// ─── Timeline (compact strip inside the About chapter) ────────────────────
// NEEDS_INPUT: dates below are inferred from GitHub activity. Correct the
// year labels and add anything I could not see.

export type TimelineEntry = {
  year: string;
  title: string;
  detail: string;
  tag: "code" | "win" | "work" | "life";
};

export const TIMELINE: TimelineEntry[] = [
  {
    year: "2023",
    title: "Started shipping in public",
    detail: "Created the GitHub account in December 2023 and began publishing everything I built.",
    tag: "code",
  },
  {
    year: "2024",
    title: "Google Solution Challenge finalist",
    detail: "Qualified for Google's global student build competition with a Sustainable Development Goals project.",
    tag: "win",
  },
  {
    year: "2024",
    title: "ICPC Amritapuri prelims cleared",
    detail: "Qualified through the online preliminary round of the ICPC Amritapuri regional.",
    tag: "win",
  },
  {
    year: "2024",
    title: "Chitoor drone survey",
    detail: "Field-mapped 2,000 acres by drone with a three-person team and trained a segmentation model on it.",
    tag: "work",
  },
  {
    year: "2025",
    title: "Technical Lead, Code Club",
    detail: "Ran AI/ML events and competitions on campus and mentored the teams entering them.",
    tag: "work",
  },
  {
    year: "2025",
    title: "Hackathon run",
    detail: "Five wins and three national-level finals across the year, from Web3 to accessibility tooling.",
    tag: "win",
  },
  {
    year: "2025",
    title: "Hacktoberfest contributor",
    detail: "Open-source contributions badged in October 2025.",
    tag: "code",
  },
  {
    year: "2026",
    title: "GradMesh, and freelance client work",
    detail: "Distributed training over idle consumer GPUs, alongside freelance builds for NEXR, Edactly and others.",
    tag: "code",
  },
];

// ─── Updates (LinkedIn-style feed, editable from /admin) ─────────────────

export type Post = {
  id: string;
  caption: string;
  imageUrl?: string;
  linkUrl?: string;
  linkLabel?: string;
  createdAt: string;
};

// ─── Life outside the terminal ─────────────────────────────────────────────

export type Interest = {
  id: string;
  label: string;
  detail: string;
  icon: "run" | "gym" | "ball" | "game" | "film" | "code";
};

export const INTERESTS: Interest[] = [
  {
    id: "marathon",
    label: "Marathons",
    detail: "I run full marathons. NEEDS_INPUT: add your best finish time and the race name.",
    icon: "run",
  },
  {
    id: "gym",
    label: "Gym, daily",
    detail: "A regular lifting session is non-negotiable, deadline week included.",
    icon: "gym",
  },
  {
    id: "football",
    label: "Football",
    detail: "Play whenever there are enough people for a side. NEEDS_INPUT: favourite club or position.",
    icon: "ball",
  },
  {
    id: "games",
    label: "Games",
    detail: "Arcade cabinets, shooters, and anything with a good movement system.",
    icon: "game",
  },
  {
    id: "marvel",
    label: "Marvel",
    detail: "Deadpool and Wolverine hold the wall for a reason.",
    icon: "film",
  },
  {
    id: "cp",
    label: "Competitive programming",
    detail: "Contests most weekends. It is the only hobby that also happens to be a job skill.",
    icon: "code",
  },
];

// ═════════════════════════════════════════════════════════════════════════
// STUDIO SITE (October 2026 rebuild)
// Everything the new homepage renders. Facts come from the October 2026
// resume; nothing here is invented. Edit copy here, never in components.
// ═════════════════════════════════════════════════════════════════════════

export const SITE_NAV = {
  primary: [
    { label: "Work", href: "#work" },
    { label: "Experience", href: "#experience" },
    { label: "Research", href: "#research" },
  ],
  secondary: [
    { label: "Wins", href: "#wins" },
    { label: "About", href: "#about" },
    { label: "Contact", href: "#contact" },
  ],
};

export const PRELOADER = {
  intro: [
    "Ujesh Kumar Yadav, software engineer",
    "Full-stack, applied AI, GPU systems",
    "Based in Bengaluru, building for anywhere",
  ],
  boot: [
    "Waking up the stand-in…",
    "Servos warm, antennae up",
    "Loading 65+ projects",
    "Ready. Say hi.",
  ],
};

export const HERO = {
  hello: "Hello there, I'm Ujesh.",
  lead: "Software engineer building production web apps, applied AI and distributed GPU systems, end to end. Seven hackathon wins, and a paper at IMPACT-2027.",
  timezoneLabel: "(IST, UTC+5:30)",
  timezone: "Asia/Kolkata",
};

/**
 * The comic-book landing page. The robot does the talking in balloons;
 * captions are the narrator. Chips inside a balloon jump to a section.
 */
export type BalloonChip = { label: string; href: string };
export type BalloonBeat = { text: string; chips?: BalloonChip[]; mood?: RobotMood };

export const LANDING = {
  eyebrow: "Software engineer · Bengaluru",
  scrollHint: "Scroll to explore",
  intro: [
    { text: "Hi! I'm Ujesh's robot.", mood: "wave" },
    { text: "He's off shipping something, so I'm giving the tour today." },
    {
      text: "Scroll with me, or jump straight to a chapter:",
      chips: [
        { label: "Projects", href: "#work" },
        { label: "Internships & freelance", href: "#experience" },
        { label: "Hackathon wins", href: "#wins" },
        { label: "Research", href: "#research" },
        { label: "Life outside work", href: "#offclock" },
        { label: "Say hi", href: "#contact" },
      ],
    },
  ] as BalloonBeat[],
};

export type StoryChapter = {
  issue: string;
  title: string;
  text: string;
  href: string;
};

/** "The story so far": the life, not the resume. */
export const STORY = {
  eyebrow: "The story so far",
  title: "Eight chapters, one habit: build the thing, then show up for it.",
  chapters: [
    {
      issue: "#01",
      title: "College, the long way round",
      text: "Computer science at Atria (VTU) since 2023, plus a 200-plus member code club I now lead.",
      href: "#about",
    },
    {
      issue: "#02",
      title: "Fifty-plus hackathons",
      text: "Seven wins, twenty national finals, and five more hackathons I organised for 500+ people each.",
      href: "#wins",
    },
    {
      issue: "#03",
      title: "Internships",
      text: "Outbreak prediction at EaseMed, a bird-species vision dataset at Hitachi.",
      href: "#experience",
    },
    {
      issue: "#04",
      title: "Freelance",
      text: "Edactly's prompt-to-lesson video pipeline, plus client sites like NEXR.",
      href: "#experience",
    },
    {
      issue: "#05",
      title: "Research & conferences",
      text: "GradMesh at IMPACT-2027, a book chapter for Viksit Bharat 2047, and the next paper in progress.",
      href: "#research",
    },
    {
      issue: "#06",
      title: "AI/ML, in the room",
      text: "AI/ML events and talks, on the stage and in the audience. RAG, vision and GPUs, mostly.",
      href: "#build",
    },
    {
      issue: "#07",
      title: "A business of my own",
      text: "I've raised money to start a business. More on that soon.",
      href: "#contact",
    },
    {
      issue: "#08",
      title: "Off the clock",
      text: "Marathons, the gym every day, football, dancing and a lot of games.",
      href: "#offclock",
    },
  ] as StoryChapter[],
};

export type Signal = { name: string; tag: string };

export const SIGNALS = {
  label: "Where the work has landed",
  text: "Two startups, an ML internship at Hitachi, fifty-plus hackathon floors and a conference stage in January 2027.",
  items: [
    { name: "EaseMed", tag: "Internship" },
    { name: "Edactly", tag: "Freelance" },
    { name: "Hitachi", tag: "ML internship" },
    { name: "Inception", tag: "Winner" },
    { name: "Denova", tag: "Winner" },
    { name: "IMPACT-2027", tag: "Paper accepted" },
    { name: "MNNIT Allahabad", tag: "Book chapter" },
    { name: "LitmusChaos", tag: "Open source" },
    { name: "Smart India Hackathon", tag: "College rank 1" },
    { name: "HackerRank", tag: "Bronze" },
    { name: "Google Solution Challenge", tag: "Regional qualifier" },
    { name: "ICPC", tag: "Prelims ×2" },
  ] as Signal[],
};

export const STATEMENT =
  "I'm a computer science student who ships like a startup engineer: real users, real deadlines, and research on its way to a conference stage.";

export type Capability = {
  num: string;
  title: string;
  sub: string;
  text: string;
};

export const CAPABILITIES: Capability[] = [
  {
    num: "01",
    title: "Full-stack products",
    sub: "React, Next.js and Node, schema to deploy",
    text: "Real-time messaging, authentication and role-based access, shipped to hospital and vendor teams at EaseMed.",
  },
  {
    num: "02",
    title: "Applied AI & RAG",
    sub: "Models that earn their place in the product",
    text: "RAG over the NCERT curriculum, embeddings, semantic search and LLM inference services running on AWS.",
  },
  {
    num: "03",
    title: "Distributed GPU systems",
    sub: "Idle GPUs, one training cluster",
    text: "GradMesh pools consumer GPUs across a LAN: up to 1.8× faster than a single node across four GPUs.",
  },
  {
    num: "04",
    title: "Real-time 3D & WebGL",
    sub: "Worlds from a single sentence",
    text: "WorldForge generates terrain, environments and NPCs from a prompt, live in the browser.",
  },
  {
    num: "05",
    title: "Cloud & DevOps",
    sub: "The unglamorous half of shipping",
    text: "EC2, S3, Lambda, CloudFront, Nginx, PM2, Docker and GitHub Actions, wired up and kept running.",
  },
];

/** Photos that fly past between the capability cards. */
export const CAPABILITY_MEDIA: { src: string; alt: string }[] = [
  { src: "/media/life-hacking-floor", alt: "A packed hackathon floor under a 'Let the hacking begin' banner" },
  { src: "/media/life-mic", alt: "Ujesh presenting with a microphone to a seated room" },
  { src: "/media/work-edactly-1", alt: "The Edactly landing page" },
  { src: "/media/life-swag", alt: "A pile of hackathon t-shirts, bags and badges" },
  { src: "/media/work-easemed", alt: "The EaseMed landing page: where healthcare demand meets global supply" },
];

export const SKILL_GROUPS: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["JavaScript", "TypeScript", "Python", "C++", "C", "SQL"] },
  { group: "Frontend", items: ["React", "Next.js", "Redux", "Tailwind CSS", "Three.js", "WebGL"] },
  { group: "Backend", items: ["Node.js", "Express", "REST", "WebSockets", "Microservices", "JWT auth"] },
  { group: "AI / ML", items: ["RAG", "LangChain", "Embeddings", "Semantic search", "Computer vision", "Ollama"] },
  { group: "Data", items: ["PostgreSQL", "MongoDB", "MySQL", "Prisma", "Firebase", "Qdrant", "Supabase"] },
  { group: "Cloud", items: ["AWS EC2", "S3", "Lambda", "CloudFront", "Docker", "Nginx", "GitHub Actions"] },
];

export type WorkVisual = "gradmesh" | "blockparty";

export type WorkCard = {
  id: string;
  title: string;
  headline: string;
  text: string;
  context: string;
  tags: string[];
  /** Base path under /public without the -1600.webp suffix. */
  image?: string;
  imageAlt?: string;
  /** Rendered in code instead of a photo when there is no screenshot. */
  visual?: WorkVisual;
  href?: string;
  linkLabel?: string;
  /** Layout width on desktop. */
  span: "wide" | "narrow" | "full";
};

export const WORK_INTRO = {
  eyebrow: "Selected work",
  title: ["Built, shipped,", "and sometimes won."],
  text: "Production features at two startups, research accepted at IMPACT-2027 and hackathon builds that took first place. Each one end to end: architecture, code and deploy.",
};

export const WORK: WorkCard[] = [
  {
    id: "worldforge",
    title: "WorldForge AI",
    headline: "Game worlds generated from a single prompt",
    text: "A browser game engine that turns a natural-language prompt into terrain, environments and NPCs in real time. Built in React, Three.js and TypeScript at India's first world-model hackathon, and it won.",
    context: "Inception hackathon · Winner · 2026",
    tags: ["Hackathon winner", "Three.js · WebGL"],
    image: "/media/win-inception",
    imageAlt: "Ujesh and teammates holding the Inception hackathon winner's cheque",
    span: "wide",
  },
  {
    id: "gradmesh",
    title: "GradMesh",
    headline: "Every idle GPU on the network, one training cluster",
    text: "A coordinator-worker architecture that pools consumer GPUs across a LAN into a single training cluster. Benchmarked across four GPU nodes at up to 1.8× the speed of one. Accepted at IMPACT-2027.",
    context: "Research · IMPACT-2027 · Jan 2027",
    tags: ["Accepted paper", "Distributed systems"],
    visual: "gradmesh",
    href: "https://github.com/UJESH2K/Gradmesh-v4",
    linkLabel: "View the code",
    span: "narrow",
  },
  {
    id: "easemed",
    title: "EaseMed",
    headline: "Predicting outbreaks before the shelves run dry",
    text: "As the sole engineer on the feature, I built an outbreak-prediction model that correlates global trade data with WHO and government health APIs to set inventory-risk guardrails, alongside a WebSocket messaging backend for hospitals and vendors.",
    context: "EaseMed · Full-stack intern · 2026",
    tags: ["Healthcare", "Applied ML"],
    image: "/media/work-easemed",
    imageAlt: "The EaseMed landing page",
    span: "wide",
  },
  {
    id: "edactly",
    title: "Edactly",
    headline: "A three-minute lesson video for about ₹7",
    text: "Prompt in, explainer video out. A Python and Manim pipeline grounded by RAG over the NCERT grades 1–12 curriculum, deployed on S3 and Lambda, renders a three-minute video in about five minutes.",
    context: "Edactly · Freelance · 2026 – now",
    tags: ["EdTech", "RAG · AWS Lambda"],
    image: "/media/work-edactly-2",
    imageAlt: "An Edactly screen with an open book and a 'Download Sunday' prompt",
    span: "wide",
  },
  {
    id: "blockparty",
    title: "BlockParty",
    headline: "Bounties that pay out the moment a PR merges",
    text: "A GitHub bounty marketplace with OAuth through Clerk and role-based access. It creates repository webhooks itself, watches pull requests live and completes the bounty when the PR is merged.",
    context: "Side project · Sep 2025",
    tags: ["Dev tools", "GitHub webhooks"],
    visual: "blockparty",
    span: "narrow",
  },
  {
    id: "blinky",
    title: "Blinky",
    headline: "Attention that remembers on your behalf",
    text: "Holds the one thing you sat down to do, notices when you drift and quotes your own intent back to you. Frames are analysed and thrown away: the table has no image column, so privacy is enforced by the schema.",
    context: "Accessibility hackathon · 2025",
    tags: ["Vision models", "Privacy by schema"],
    image: "/media/life-desk",
    imageAlt: "Two developers at a desk working on Blinky",
    href: "https://hhhs-smoky.vercel.app",
    linkLabel: "Open the demo",
    span: "full",
  },
];

export const ABOUT = {
  title: ["Seven wins, fifty-plus hackathons,", "and a habit of shipping by Monday."],
  label: "( The short version )",
  paragraphs: [
    "I like the part of engineering where an idea has to survive real users. At EaseMed that meant hospital and vendor teams messaging in real time. At Edactly it means students watching lessons generated from a single prompt.",
    "Outside client work I research distributed training on consumer GPUs, lead a 200-plus member code club at Atria Institute of Technology, and organise hackathons almost as often as I enter them.",
  ],
  portrait: "/media/life-podium",
  portraitAlt: "Ujesh speaking at a podium",
  reel: [
    { src: "/reel/nexr.mp4", label: "NEXR · client site" },
    { src: "/reel/resort.mp4", label: "Resort booking · client site" },
    { src: "/reel/inceptio.mp4", label: "Inceptio · client build" },
  ],
  education: {
    school: "Atria Institute of Technology (VTU), Bengaluru",
    degree: "B.E. Computer Science and Engineering",
    period: "2023 – present",
  },
};

export type Role = {
  num: string;
  company: string;
  role: string;
  period: string;
  place: string;
  sub: string;
  points: string[];
  image: string;
  imageAlt: string;
  bg: string;
};

export const ROLES_INTRO = {
  eyebrow: "Experience",
  title: "Where I've shipped.",
  text: "Two startups, an ML internship and a campus club that runs like a small company. Each with real people on the other end.",
};

export const ROLES: Role[] = [
  {
    num: "01",
    company: "EaseMed",
    role: "Full Stack Developer Intern",
    period: "Jan – Jun 2026",
    place: "Bengaluru",
    sub: "Sole engineer on outbreak prediction.",
    points: [
      "Built and shipped a disease-outbreak prediction model correlating global trade data with WHO and government health APIs to generate inventory-risk guardrails.",
      "Serverless ingestion pipeline in Node.js and Supabase with a Hugging Face-hosted parser, validated with 10–20 concurrent users.",
      "WebSocket messaging between hospitals and vendors, a React/Next.js frontend, auth and role-based access end to end; inference services on EC2, S3, Nginx, PM2 and Vercel.",
    ],
    image: "/media/work-easemed",
    imageAlt: "The EaseMed landing page",
    bg: "#1c0703",
  },
  {
    num: "02",
    company: "Edactly",
    role: "Freelance Full Stack Developer",
    period: "2026 – present",
    place: "Remote",
    sub: "Prompt in, lesson video out.",
    points: [
      "AI pipeline in Python, Manim and Matplotlib that generates explainer videos from natural-language prompts, grounded by RAG over NCERT grades 1–12.",
      "Deployed on AWS S3 and Lambda: a three-minute video in about five minutes, at roughly ₹7 of compute.",
      "Authentication, user management and the APIs behind the platform's dashboards and content workflows.",
    ],
    image: "/media/work-edactly-3",
    imageAlt: "An Edactly progress map: 'Your map. Your pace.'",
    bg: "#3a0e05",
  },
  {
    num: "03",
    company: "Hitachi",
    role: "Machine Learning Intern",
    period: "2025 · 3 months",
    place: "India",
    sub: "From camera to classifier.",
    points: [
      "Led a student team building a ~600-image dataset for a bird-species computer-vision project.",
      "Captured the images myself, labelled them in Label Studio, and owned model development and pipeline design end to end.",
    ],
    image: "/media/work-hitachi-train",
    imageAlt: "Training logs from the bird-species detection model",
    bg: "#5c1606",
  },
  {
    num: "04",
    company: "Code Club & Vigyan Rang",
    role: "Technical Lead · Fest Organiser",
    period: "2024 – present",
    place: "Atria Institute of Technology",
    sub: "200+ members, 1,000+ applicants.",
    points: [
      "Lead full-stack initiatives for a 200-plus member club: code reviews, design sessions and mentoring from idea to deployment.",
      "Organised a ₹5L tech fest with QR-based registration and shortlisting for 1,000+ applicants and five hackathons of 500+ participants each.",
      "Built real-time tools for several departments, including a live IPL-auction simulator.",
    ],
    image: "/media/life-crowd",
    imageAlt: "A large group photo of hackathon participants",
    bg: "#7f2008",
  },
];

export type Win = {
  name: string;
  result: string;
  detail: string;
  image?: string;
  imageAlt?: string;
};

export const WINS_INTRO = {
  eyebrow: "Wins",
  title: "Fifty-plus hackathons. Seven wins. A different problem every weekend.",
  text: "World models, blockchain, accessibility, healthcare: the theme changes every time. The habit of shipping something that works by the final demo doesn't.",
};

export const WINS: Win[] = [
  {
    name: "Inception",
    result: "Winner",
    detail: "India's first world-model hackathon, with WorldForge AI.",
    image: "/media/win-inception",
    imageAlt: "The team holding the Inception winner's cheque",
  },
  {
    name: "Denova",
    result: "Winner · Solana track",
    detail: "International blockchain hackathon.",
    image: "/media/win-denova",
    imageAlt: "Presenting at the Denova hackathon",
  },
  {
    name: "Cypher 1 & 3",
    result: "Winner, twice",
    detail: "Atria Institute of Technology.",
    image: "/media/win-cypher",
    imageAlt: "Winners on stage with certificates at Cypher",
  },
  {
    name: "HackerRank Orchestrate",
    result: "Bronze",
    detail: "National-level finals.",
    image: "/media/win-hackerrank",
    imageAlt: "Teams at the HackerRank Orchestrate finals",
  },
  {
    name: "Google Solution Challenge",
    result: "Regional qualifier",
    detail: "India regional bootcamp.",
    image: "/media/win-gsc",
    imageAlt: "The team at the Google Solution Challenge regional bootcamp",
  },
  {
    name: "Smart India Hackathon",
    result: "College rank 1",
    detail: "Atria Institute of Technology internal round.",
  },
  {
    name: "Hacktoberfest 2025",
    result: "7 accepted PRs",
    detail: "Contributions to LitmusChaos in a single month.",
  },
  {
    name: "ICPC",
    result: "Regional prelims ×2",
    detail: "Qualified for the regional preliminaries twice.",
  },
];

/**
 * The hackathon wall: every photo from images/winning. Results come from the
 * resume; where a result isn't on it (Cardano), only the event is shown.
 */
export type WallPhoto = { src: string; alt: string; event: string; result?: string; tall?: boolean; wide?: boolean };

export const HACK_WALL = {
  eyebrow: "Hackathon wall",
  title: "Cheques, certificates and very little sleep.",
  text: "Proof from the floor: the photos from the weekends that ended on stage.",
  photos: [
    { src: "/media/win-inception", alt: "The team holding the Inception winner's cheque", event: "Inception", result: "Winner", wide: true, tall: true },
    { src: "/media/win-denova", alt: "Presenting the build at Denova", event: "Denova", result: "Winner · Solana track", wide: true },
    { src: "/media/win-inception-solo", alt: "Ujesh with the Inception cheque", event: "Inception", result: "Winner", tall: true },
    { src: "/media/win-cypher", alt: "Winners on stage with certificates at Cypher", event: "Cypher", result: "Winner" },
    { src: "/media/win-cardano-cheque", alt: "Two teammates holding a cheque at the Cardano hackathon", event: "Cardano hackathon", tall: true },
    { src: "/media/win-gsc", alt: "The team at the Google Solution Challenge bootcamp", event: "Google Solution Challenge", result: "Regional qualifier" },
    { src: "/media/win-cypher-2", alt: "Certificates in hand at Cypher", event: "Cypher, again", result: "Winner" },
    { src: "/media/win-inception-3", alt: "The Inception team on stage", event: "Inception", result: "Winner" },
    // NEEDS_INPUT: add the Cardano placement as `result` once confirmed.
    { src: "/media/win-cardano-floor", alt: "The Cardano hackathon floor", event: "Cardano hackathon", wide: true },
  ] as WallPhoto[],
};

export type Paper = {
  status: string;
  date: string;
  kind: string;
  title: string;
  venue: string;
  text: string;
  visual: "gradmesh" | "viksit" | "vendors" | "oss";
  href?: string;
};

export const RESEARCH_INTRO = {
  eyebrow: "Research",
  title: "Papers, a book chapter and work in progress.",
  text: "Most of my research asks one question: how much training can you squeeze out of the GPUs people already own?",
};

export const RESEARCH: Paper[] = [
  {
    status: "Accepted",
    date: "Jan 2027",
    kind: "Conference paper",
    title: "GradMesh: a network-based distributed GPU architecture for deep learning training",
    venue: "IMPACT-2027 International Conference · DMPedia Conference Series",
    text: "Pools idle consumer GPUs across a LAN into one training cluster with a coordinator-worker design. Up to 1.8× speedup across four GPU nodes. Presenting in January 2027.",
    visual: "gradmesh",
    href: "https://github.com/UJESH2K/Gradmesh-v4",
  },
  {
    status: "Abstract accepted",
    date: "2026",
    kind: "Book chapter",
    title: "Artificial Intelligence for Viksit Bharat 2047: Technologies, Applications and Policy Perspectives",
    venue: "National edited volume · MNNIT Allahabad",
    text: "A selected contribution to a national volume aligned with the Government of India's Viksit Bharat 2047 initiative. Abstract accepted (conditional); full chapter in preparation.",
    visual: "viksit",
  },
  {
    status: "In preparation",
    date: "Ongoing",
    kind: "Independent research · sole author",
    title: "Cross-vendor heterogeneous GPU orchestration for distributed deep learning training",
    venue: "Extends GradMesh toward a full conference paper",
    text: "One orchestration layer over NVIDIA (CUDA), Intel and Apple Silicon (Metal) GPUs, tackling workload partitioning and synchronisation across mismatched hardware and software stacks.",
    visual: "vendors",
  },
  {
    status: "Merged",
    date: "Oct 2025",
    kind: "Open source",
    title: "Seven accepted contributions to LitmusChaos in one month",
    venue: "Hacktoberfest 2025",
    text: "Seven contributions accepted into the LitmusChaos project during Hacktoberfest 2025, all in October.",
    visual: "oss",
    href: "https://holopin.io/@ujesh2k",
  },
];

/**
 * Posts to highlight from LinkedIn, X and Instagram. Paste a post URL and a
 * one-line caption to add one; the Feed section shows them in order and
 * falls back to profile cards while this list is empty.
 */
export type SocialPost = {
  platform: "linkedin" | "x" | "instagram" | "github";
  url: string;
  caption: string;
  date: string;
  /** Optional screenshot under /public, e.g. "/media/post-inception". */
  image?: string;
};

export const SOCIAL_POSTS: SocialPost[] = [];

export const FEED_INTRO = {
  eyebrow: "Around the internet",
  title: "Build logs, hackathon recaps and the occasional win, as they happen.",
};

export const OFF_CLOCK = {
  eyebrow: "Off the clock",
  title: "When I'm not shipping.",
  items: [
    { label: "Marathons", detail: "Long runs are where the hard bugs get solved.", icon: "run" },
    { label: "Gym, daily", detail: "Non-negotiable, deadline week included.", icon: "gym" },
    { label: "Football", detail: "Whenever there are enough people for a side.", icon: "ball" },
    { label: "Dance", detail: "The one thing on this page with no deploy step.", icon: "dance" },
    { label: "Gaming", detail: "Arcade cabinets, shooters, anything with good movement.", icon: "game" },
  ] as { label: string; detail: string; icon: "run" | "gym" | "ball" | "dance" | "game" }[],
};

export type Faq = { q: string; a: string };

export const FAQ_INTRO = {
  title: ["Questions?", "Answered", "right here."],
  label: "Let's talk",
  cta: "Email me",
};

export const FAQS: Faq[] = [
  {
    q: "What kind of roles are you looking for?",
    a: "Software engineering across full-stack product and applied AI or ML systems. I'm at my best on small teams where I can own a feature from schema to deploy and talk to the people using it.",
  },
  {
    q: "What's your core stack?",
    a: "TypeScript with React and Next.js on the front, Node.js and Express with PostgreSQL or MongoDB on the back, Python for ML, and AWS (EC2, S3, Lambda, CloudFront) to ship it. For AI work: RAG, LangChain, embeddings and vector databases like Qdrant.",
  },
  {
    q: "Where are you based, and do you work remotely?",
    a: "Bengaluru, India. My Edactly work is fully remote, and EaseMed was in person in Bengaluru, so either works.",
  },
  {
    q: "What are you researching right now?",
    a: "Cross-vendor GPU orchestration: one layer that trains across NVIDIA, Intel and Apple Silicon GPUs together. It extends GradMesh, which I'm presenting at IMPACT-2027 in January.",
  },
  {
    q: "Can I see the code?",
    a: "Most of it. There are 65+ public projects on GitHub. Client work stays private, but I'm happy to walk through the architecture on a call.",
  },
  {
    q: "Who's the little robot?",
    a: "My stand-in until I can say hello myself. The model is \"Robot Playground\" by Hadrien59 (CC BY 4.0); the jumping, waving and section tours are wired up in code on this site.",
  },
];

export const FOOTER = {
  title: "Say hello.",
  blurb: "Ujesh Kumar Yadav is a Bengaluru-based software engineer building full-stack products, applied AI and distributed GPU systems. Open to good problems.",
  credits: [
    {
      label: "3D robot: \"Robot Playground\" by Hadrien59",
      href: "https://sketchfab.com/3d-models/robot-playground-59fc99d8dcb146f3a6c16dbbcc4680da",
      license: "CC BY 4.0",
      licenseHref: "http://creativecommons.org/licenses/by/4.0/",
    },
  ],
};

/**
 * What the robot says as each section scrolls into view. `corner` is where
 * it lands on screen; `mood` picks the face and the move it makes.
 */
export type RobotMood = "wave" | "happy" | "think" | "cheer" | "peek" | "dizzy" | "sleep";
/** Where the companion sits: one of the four corners, set per section. */
export type RobotCorner = "br" | "bl" | "tr" | "tl";

/**
 * What the robot says as each section reaches the middle of the screen, and
 * where it stands while it says it. Corners are chosen per section to keep
 * clear of that section's heading and text, and alternate so it travels.
 */
export const ROBOT_LINES: Record<string, { line: string; mood?: RobotMood; corner: RobotCorner }> = {
  signals: { line: "I'll follow you down. Click me any time for shortcuts.", mood: "wave", corner: "tl" },
  story: { line: "The short version: eight chapters, all true.", corner: "tr" },
  build: { line: "Here's what he builds. Keep scrolling, the cards fly past.", corner: "br" },
  work: { line: "The projects! One won Inception, one became a paper.", corner: "bl" },
  about: { line: "That's him on stage. He talks faster than I compute.", corner: "tr" },
  experience: { line: "Where he's worked: real users, real deadlines.", corner: "br" },
  wins: { line: "Seven wins out of fifty-plus hackathons. I counted twice.", mood: "cheer", corner: "tr" },
  wall: { line: "The photo wall! Hover a picture, it ripples.", corner: "bl" },
  research: { line: "GradMesh goes to IMPACT-2027 this January.", corner: "tr" },
  feed: { line: "For the day-to-day, these are his profiles.", corner: "bl" },
  offclock: { line: "Marathons and football. I mostly hover.", corner: "tr" },
  faq: { line: "Short on time? The quick answers are here.", corner: "bl" },
  contact: { line: "That's the tour! His inbox is right here.", mood: "wave", corner: "br" },
};

export const ROBOT_IDLE_LINES = [
  "Still here if you need me.",
  "Click me to jump anywhere.",
  "There's more below, promise.",
  "I'd scroll for you, but no thumbs.",
];

/** Hidden extras. None are needed to use the site; all are just for fun. */
export const EASTER_EGGS = {
  cheatCode: "Cheat code accepted. Infinite curiosity unlocked.",
  name: "Hey, that's my human!",
  dizzy: "Whoa. Okay, okay, I'm dizzy.",
  sleep: "Zzz…",
  wake: "Oh! You're back.",
  console: [
    "Hey, you opened the console. You're my kind of visitor.",
    "This site: Next.js, React Three Fiber, GSAP, Lenis, one very patient robot.",
    "Built by Ujesh Kumar Yadav. Say hi: ujeshyadav20k5@gmail.com",
    "Psst: try the classic cheat code. ↑ ↑ ↓ ↓ ← → ← → B A",
  ],
};

export const ROBOT_MENU = {
  prompt: "Where to?",
  stops: [
    { label: "Work", href: "#work" },
    { label: "Experience", href: "#experience" },
    { label: "Wins", href: "#wins" },
    { label: "Research", href: "#research" },
    { label: "Contact", href: "#contact" },
    { label: "Back to top", href: "#top" },
  ],
};
