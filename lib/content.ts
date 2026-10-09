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

/**
 * The site's chapters, in page order. The top nav shows them as one row and
 * marks the one being read; `from` is where a chapter starts when that is
 * not the link target itself.
 */
export const SITE_NAV: { label: string; href: string; from?: string }[] = [
  { label: "Work", href: "#work" },
  { label: "Internships", href: "#internships" },
  { label: "Freelance", href: "#freelance" },
  { label: "Leadership", href: "#leadership" },
  { label: "Wins", href: "#wins" },
  { label: "Research", href: "#research" },
  { label: "Contact", href: "#contact" },
]

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
    { text: "Psst: hover over me, I'm made of particles. Or click. I don't bite." },
    {
      text: "Scroll with me, or jump straight to a chapter:",
      chips: [
        { label: "Projects", href: "#work" },
        { label: "Internships", href: "#internships" },
        { label: "Freelance", href: "#freelance" },
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
      href: "#leadership",
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
      text: "Outbreak prediction at EaseMed, bird-species detection at Hitachi, lightweight vision models with AICTE.",
      href: "#internships",
    },
    {
      issue: "#04",
      title: "Freelance",
      text: "Edactly's prompt-to-lesson video pipeline, plus sites for NEXR, a resort and a merch store.",
      href: "#freelance",
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
      href: "#leadership",
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
    { name: "AICTE × Microsoft & SAP", tag: "ML internship" },
    { name: "Inception", tag: "Winner" },
    { name: "Denova", tag: "Winner" },
    { name: "Cardano", tag: "Winner" },
    { name: "Cypher 1 & 3", tag: "Winner ×2" },
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

/** Photos that fly past between the capability cards: him and his team. */
export const CAPABILITY_MEDIA: { src: string; alt: string }[] = [
  { src: "/media/life-mic", alt: "Ujesh pitching with a microphone" },
  { src: "/media/win-cypher", alt: "The team on stage with certificates at Cypher" },
  { src: "/media/win-inception-solo", alt: "Ujesh with the Inception winner's cheque" },
  { src: "/media/life-hacking-floor", alt: "A packed hackathon floor" },
  { src: "/media/life-selfie", alt: "A team selfie at a hackathon" },
  { src: "/media/life-talk", alt: "Ujesh speaking into a microphone" },
  { src: "/media/life-build-1", alt: "The team coding side by side" },
  { src: "/media/win-cardano-cheque", alt: "Holding the cheque at the Cardano hackathon" },
];

export const SKILL_GROUPS: { group: string; items: string[] }[] = [
  { group: "Languages", items: ["JavaScript", "TypeScript", "Python", "C++", "C", "SQL"] },
  { group: "Frontend", items: ["React", "Next.js", "Redux", "Tailwind CSS", "Three.js", "WebGL"] },
  { group: "Backend", items: ["Node.js", "Express", "REST", "WebSockets", "Microservices", "JWT auth"] },
  { group: "AI / ML", items: ["RAG", "LangChain", "Embeddings", "Semantic search", "Computer vision", "Ollama"] },
  { group: "Data", items: ["PostgreSQL", "MongoDB", "MySQL", "Prisma", "Firebase", "Qdrant", "Supabase"] },
  { group: "Cloud", items: ["AWS EC2", "S3", "Lambda", "CloudFront", "Docker", "Nginx", "GitHub Actions"] },
];

// ─── Work: projects, internships, clients, leadership ─────────────────────
// Four separate lists, each with its own section and its own link
// (#work, #internships, #freelance, #leadership), so any one of them can be
// shown on its own. Nothing appears in more than one.

export type WorkKind = "hackathon" | "research" | "side";

/** A light typographic cover for work with no screenshot. */
export type WorkCover = { stat: string; label: string };

export type WorkItem = {
  id: string;
  title: string;
  headline: string;
  text: string;
  kind: WorkKind;
  /** Where and when, e.g. "Inception hackathon · Winner · 2026". */
  context: string;
  stack: string[];
  /** Base path under /public without the -1600.webp suffix. */
  image?: string;
  imageAlt?: string;
  /** Short muted clip shown over the image on hover. */
  video?: string;
  cover?: WorkCover;
  live?: string;
  code?: string;
  /** Large card at the top of the index. */
  featured?: boolean;
};

export const WORK_INTRO = {
  eyebrow: "Projects",
  title: ["Built, shipped,", "and sometimes won."],
  text: "Hackathon builds that took first place, research on its way to a conference stage, and the side projects in between. Live links where they're live, code where it's public.",
};

export const WORK_FILTERS: { id: WorkKind | "all"; label: string }[] = [
  { id: "all", label: "Everything" },
  { id: "hackathon", label: "Hackathon builds" },
  { id: "research", label: "Research" },
  { id: "side", label: "Side projects" },
];

export const WORK: WorkItem[] = [
  {
    id: "worldforge",
    title: "WorldForge",
    headline: "Build a world from a sentence, then train robots in it",
    text: "Won India's first world-model hackathon with a browser engine that turns a prompt into a world you can fly through. It has since grown into WorldForge: navigable AI worlds where vision-language models read the frames and RL agents train in simulation.",
    kind: "hackathon",
    context: "Inception hackathon · Winner · 2026",
    stack: ["React", "Three.js", "TypeScript", "VLMs", "RL"],
    image: "/media/site-worldforge",
    imageAlt: "The WorldForge site: 'Score a robot before you build it'",
    video: "/reel/inceptio.mp4",
    live: "https://i-nception-2.vercel.app",
    code: "https://github.com/UJESH2K/INception-2",
    featured: true,
  },
  {
    id: "gradmesh",
    title: "GradMesh",
    headline: "Every idle GPU on the network, one training cluster",
    text: "A coordinator-worker architecture that pools consumer GPUs across a LAN into one training cluster. It measures what each device can actually do, sizes the work to match and trains one shared model. Accepted at IMPACT-2027.",
    kind: "research",
    context: "Paper accepted · IMPACT-2027 · Jan 2027",
    stack: ["Python", "FastAPI", "PyTorch", "FedAvg"],
    cover: { stat: "1.8×", label: "faster than a single GPU, across four nodes" },
    code: "https://github.com/UJESH2K/Gradmesh-v4",
    featured: true,
  },
  {
    id: "tidewatch",
    title: "Tidewatch",
    headline: "Fraud alerts, investigated in under a second",
    text: "Agentic fraud investigation on TigerGraph Savanna. Each alert is worked the way an analyst would, graph queries first, with no model in the decision loop: twenty alerts investigated in 0.7 seconds.",
    kind: "hackathon",
    context: "Hacker House Goa · 2026",
    stack: ["Python", "TigerGraph", "Agents"],
    image: "/media/site-tidewatch",
    imageAlt: "The Tidewatch dashboard: 20 alerts investigated in 0.7 s",
    live: "https://hhgoa.ujesh.in",
    code: "https://github.com/UJESH2K/HHGOA",
  },
  {
    id: "nwis",
    title: "NWIS",
    headline: "What the neighbouring wells already learned",
    text: "Nearby Wells Intelligence System: decision support for drilling crews that surfaces the risks recorded in offset wells, such as mud loss and stuck pipe, along the path of the well being drilled. Built for Smart India Hackathon 2026 and demoed on synthetic data.",
    kind: "hackathon",
    context: "Smart India Hackathon 2026 · PS 26121",
    stack: ["TypeScript", "Next.js", "AI search"],
    image: "/media/site-nwis",
    imageAlt: "The NWIS dashboard for a well being drilled",
    live: "https://sih2026-lemon.vercel.app",
    code: "https://github.com/UJESH2K/sih2026",
  },
  {
    id: "blinky",
    title: "Blinky",
    headline: "Attention that remembers on your behalf",
    text: "Holds the one thing you sat down to do, notices when you drift and quotes your own intent back to you. Frames are analysed and thrown away: the table has no image column, so privacy is enforced by the schema.",
    kind: "hackathon",
    context: "Accessibility hackathon · 2025",
    stack: ["Next.js", "Vision models", "Supabase"],
    image: "/media/site-blinky",
    imageAlt: "Blinky: 'You did not forget how. You forgot what.'",
    live: "https://hhhs-smoky.vercel.app",
    code: "https://github.com/UJESH2K/ADHD-hack",
  },
  {
    id: "gitpay",
    title: "GitPay",
    headline: "Open-source bounties that pay out on merge",
    text: "A decentralised bounty platform for open-source work: Solidity escrow holds the reward, GitHub workflows watch the pull request, and the payout happens on its own when it merges. Won the Solana track at Denova.",
    kind: "hackathon",
    context: "Denova blockchain hackathon · Winner · Solana track",
    stack: ["Solidity", "Solana", "GitHub webhooks", "React"],
    cover: { stat: "merge → paid", label: "trustless payouts, no middleman" },
    code: "https://github.com/UJESH2K/Gitpay",
  },
  {
    id: "agents",
    title: "Agents Playground",
    headline: "AI trading agents, scored on-chain",
    text: "Three AI trading agents (arbitrage, mean reversion and momentum) compete under identical market conditions on BNB Chain, with every result recorded on-chain so the leaderboard can't be argued with.",
    kind: "hackathon",
    context: "BNB Chain hackathon · 2025",
    stack: ["Node.js", "Solidity", "ethers.js", "BNB Chain"],
    image: "/media/site-agents",
    imageAlt: "Agents Playground: the BNB Chain arbitration network",
    live: "https://crypto-agent-training.vercel.app",
    code: "https://github.com/UJESH2K/CRYPTO-AGENT-TRAINING",
  },
  {
    id: "tutor",
    title: "AI learning assistant",
    headline: "A tutor with a face, grounded in the syllabus",
    text: "Personalised lessons from a realistic AI avatar, with a RAG pipeline keeping answers on the syllabus, Manim drawing diagrams on demand and eye tracking adapting the pace to the learner's focus.",
    kind: "hackathon",
    context: "Cypher 3 hackathon",
    stack: ["RAG", "Manim", "HeyGen", "Eye tracking"],
    cover: { stat: "RAG + avatar", label: "lessons that stay on the syllabus" },
  },
  {
    id: "chitoor",
    title: "Chitoor",
    headline: "2,000 acres, mapped by drone and segmented by our own model",
    text: "A drone survey of about 2,000 acres of farmland by a team of four students. We traced plant boundaries in the aerial imagery by hand first, then trained a segmentation model to do it automatically.",
    kind: "research",
    context: "Field survey · 2024",
    stack: ["Python", "Drone survey", "Image segmentation"],
    image: "/media/work-chitoor",
    imageAlt: "The Chitoor team at work: laptops, aerial imagery and hand-traced field maps",
  },
  {
    id: "tour",
    title: "Atria 360° tour",
    headline: "The campus, explorable from a browser",
    text: "A 360° virtual tour of the Atria campus: walk between panoramas, open hotspots and find your way around before you ever visit.",
    kind: "side",
    context: "Virtual tour · college project",
    stack: ["JavaScript", "3Sixty", "WebGL"],
    image: "/media/site-atriatour",
    imageAlt: "A panorama from the Atria virtual tour",
    live: "https://tour-v3-one.vercel.app",
    code: "https://github.com/UJESH2K/tour-v3",
  },
  {
    id: "pose",
    title: "Form check",
    headline: "Pose estimation that grades your workout",
    text: "Real-time pose tracking with MediaPipe and a temporal read of joint angles, so drifting exercise form is caught as it happens. A finalist at PAC Hack, Presidency University.",
    kind: "hackathon",
    context: "PAC Hack · Finalist",
    stack: ["Python", "MediaPipe", "OpenCV"],
    cover: { stat: "33 joints", label: "tracked live, every rep" },
  },
  {
    id: "skin",
    title: "Skin cancer prediction",
    headline: "CNN classifiers for skin-lesion images",
    text: "Deep-learning models trained on HAM10000 with careful preprocessing, augmentation and class balancing, judged on precision, recall and F1 for assisted screening.",
    kind: "side",
    context: "Applied ML",
    stack: ["Python", "TensorFlow", "CNNs"],
    cover: { stat: "HAM10000", label: "dermoscopic images, classified" },
    code: "https://github.com/UJESH2K/Skin-cancer-prediction",
  },
];

export type Internship = {
  company: string;
  role: string;
  period: string;
  place: string;
  sub: string;
  points: string[];
  image?: string;
  imageAlt?: string;
  link?: { label: string; href: string };
  note?: string;
};

export const INTERNSHIPS_INTRO = {
  eyebrow: "Internships",
  title: "Three internships, real people on the other end.",
  text: "A healthcare startup, an industry research collaboration with Hitachi, and an AICTE programme with Microsoft and SAP.",
};

export const INTERNSHIPS: Internship[] = [
  {
    company: "EaseMed",
    role: "Full Stack Developer Intern",
    period: "Jan – Jun 2026",
    place: "Bengaluru",
    sub: "Sole engineer on outbreak prediction.",
    points: [
      "Built and shipped a disease-outbreak prediction model that correlates global trade data with WHO and government health APIs to set inventory-risk guardrails.",
      "A serverless ingestion pipeline in Node.js and Supabase with a Hugging Face-hosted parser, validated with 10–20 concurrent users.",
      "WebSocket messaging between hospitals and vendors, a React and Next.js frontend, auth and role-based access, with inference services on EC2, S3, Nginx, PM2 and Vercel.",
    ],
    image: "/media/work-easemed",
    imageAlt: "The EaseMed landing page: where healthcare demand meets global supply",
    note: "The public demo is offline for now.",
  },
  {
    company: "Hitachi",
    role: "Machine Learning Intern",
    period: "2025 · 3 months",
    place: "Bengaluru · with Atria",
    sub: "From camera to classifier.",
    points: [
      "Led a student team building a ~600-image dataset for bird-species detection, from raw camera footage captured around Bengaluru.",
      "Labelled it in Label Studio, then trained CNN classifiers and YOLOv11 detectors, reaching about 0.70 mAP.",
      "Owned model development and pipeline design end to end, working with Hitachi researchers and academic mentors.",
    ],
    image: "/media/work-hitachi-bird",
    imageAlt: "A bird photographed for the species-detection dataset",
  },
  {
    company: "AICTE × Microsoft & SAP",
    role: "Machine Learning Intern",
    period: "2024",
    place: "India",
    sub: "Small models that keep their accuracy.",
    points: [
      "An end-to-end image-classification project on real-world data: experiments, evaluation and a written technical report.",
      "Compared MobileNetV2 with ResNet-50; MobileNetV2 won the efficiency-accuracy trade-off for lightweight deployment.",
      "Up to 0.96 accuracy on optimised runs, with reproducible code on GitHub.",
    ],
    link: { label: "The code", href: "https://github.com/UJESH2K/AICTE---p1" },
  },
];

export type Client = {
  name: string;
  what: string;
  role: string;
  year: string;
  text: string;
  points?: string[];
  image?: string;
  imageAlt?: string;
  video?: string;
  live?: string;
  code?: string;
  note?: string;
};

export const CLIENTS_INTRO = {
  eyebrow: "Freelance & clients",
  title: "Products and sites for people who use them.",
  text: "Startups and small businesses: an AI tutor in production, a wellbeing platform, a resort and a merch store, each one designed, built and shipped end to end.",
};

export const CLIENTS: Client[] = [
  {
    name: "Edactly",
    what: "An AI tutor that has read the whole syllabus",
    role: "Freelance full-stack developer",
    year: "2026 – now",
    text: "Prompt in, lesson video out, for students in grades 1–12.",
    points: [
      "An AI pipeline in Python, Manim and Matplotlib that turns a natural-language prompt into an explainer video, grounded by RAG over the NCERT curriculum.",
      "Deployed on AWS S3 and Lambda: a three-minute video in about five minutes, for roughly ₹7 of compute.",
      "Authentication, user management and the APIs behind the platform's dashboards and content workflows.",
    ],
    image: "/media/site-edactly",
    imageAlt: "The Edactly home page",
    live: "https://beta.edactly.com/",
  },
  {
    name: "NEXR",
    what: "Workplace wellbeing, without the stigma",
    role: "Website, design and build",
    year: "2026",
    text: "NEXR helps organisations remove the invisible barriers that stop employees from asking for support. The site walks visitors through it with a 3D guide.",
    image: "/media/site-nexr",
    imageAlt: "The NEXR site: 'Wellbeing, reimagined'",
    video: "/reel/nexr.mp4",
    live: "https://nex-alpha-six.vercel.app/",
  },
  {
    name: "Radiant Resort",
    what: "A calm address on Bannerghatta Road",
    role: "Website, design and build",
    year: "2026",
    text: "Timber chalets, Ayurvedic wellness and dining on the southern edge of Bengaluru, with a slow, cinematic site to match and booking enquiries built in.",
    image: "/media/site-resort",
    imageAlt: "The Radiant Resort home page at dusk",
    video: "/reel/resort.mp4",
    live: "https://randientres.vercel.app",
  },
  {
    name: "Print Perfect",
    what: "Branded merch teams actually keep",
    role: "Storefront, design and build",
    year: "2026",
    text: "A Bengaluru merch company's storefront: a catalogue of 120-plus products, bulk ordering, and a little guide that walks first-time buyers through an order.",
    image: "/media/site-printperfect",
    imageAlt: "The Print Perfect storefront",
    live: "https://printprfect.vercel.app",
  },
  {
    name: "DRYP",
    what: "A storefront, end to end",
    role: "Commerce build",
    year: "2025",
    text: "The full product, cart and checkout flow for an online store.",
    code: "https://github.com/UJESH2K/DRYP-store",
    note: "The live store is offline; the code is public.",
  },
];

export type Lead = {
  org: string;
  role: string;
  period: string;
  text: string;
  stat?: { value: string; label: string };
};

export const LEADERSHIP_INTRO = {
  eyebrow: "Leadership & community",
  title: "Running the room, not just sitting in it.",
  text: "A code club that runs like a small company, a tech fest with a thousand applicants, and hackathons organised almost as often as entered.",
  photos: [
    { src: "/media/life-talk", alt: "Ujesh speaking into a microphone, his sticker-covered laptop beside him" },
    { src: "/media/life-group", alt: "A big group photo on a staircase after an event" },
  ],
};

export const LEADERSHIP: Lead[] = [
  {
    org: "Code Club, Atria Institute of Technology",
    role: "Technical lead",
    period: "2023 – now",
    text: "Code reviews, design sessions and mentoring from idea to deployment, plus real-time tools for college departments, including a live IPL-auction simulator.",
    stat: { value: "200+", label: "members" },
  },
  {
    org: "Vigyan Rang",
    role: "Tech fest organiser",
    period: "2024 – now",
    text: "A ₹5L tech fest with QR-based registration and shortlisting, and five hackathons of 500-plus participants each.",
    stat: { value: "1,000+", label: "applicants" },
  },
  {
    org: "Google Developer Group On Campus",
    role: "AI lead",
    period: "2023 – 2024",
    text: "Led the chapter's AI initiatives: technical sessions and project-based learning for students getting into applied ML.",
  },
  {
    org: "LitmusChaos, Hacktoberfest 2025",
    role: "Open-source contributor",
    period: "Oct 2025",
    text: "Seven accepted pull requests to the CNCF chaos-engineering project, in Go: Kubernetes resource handling and Helm chart logic.",
    stat: { value: "7", label: "PRs merged" },
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
  education: {
    school: "Atria Institute of Technology (VTU), Bengaluru",
    degree: "B.E. Computer Science and Engineering",
    period: "2023 – present",
  },
};

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
    name: "Denova",
    result: "Winner · Solana track",
    detail: "International blockchain hackathon, with GitPay.",
    image: "/media/win-denova",
    imageAlt: "Presenting at the Denova hackathon",
  },
  {
    name: "Inception",
    result: "Winner",
    detail: "India's first world-model hackathon, with WorldForge AI.",
    image: "/media/win-inception",
    imageAlt: "The team holding the Inception winner's cheque",
  },
  {
    name: "Cardano",
    result: "Winner",
    detail: "Cardano hackathon.",
    image: "/media/win-cardano-cheque",
    imageAlt: "Holding the cheque at the Cardano hackathon",
  },
  {
    name: "Cypher 1",
    result: "Winner",
    detail: "Atria Institute of Technology.",
    image: "/media/win-cypher",
    imageAlt: "Winners on stage with certificates at Cypher",
  },
  {
    name: "Cypher 3",
    result: "Winner, again",
    detail: "Atria Institute of Technology.",
    image: "/media/win-cypher-2",
    imageAlt: "Certificates in hand after Cypher 3",
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
 * The photo wall: every photo of Ujesh, his teams and friends — the
 * hackathon wins, the stages, the floors. Product screenshots live in their
 * own sections, never here. Results come from the resume or from Ujesh;
 * other photos get a plain description, never an invented event.
 * `feature` = 2×2 tile, `tall` = two rows, `wide` = two columns.
 */
export type WallPhoto = {
  src: string;
  alt: string;
  event: string;
  result?: string;
  feature?: boolean;
  tall?: boolean;
  wide?: boolean;
};

export const HACK_WALL = {
  eyebrow: "On the floor",
  title: "Cheques, certificates and very little sleep.",
  text: "Hackathons, stages, teammates and friends: the people and the moments behind the work.",
  photos: [
    { src: "/media/win-cypher", alt: "The team on stage with certificates at Cypher", event: "Cypher 1", result: "Winner", feature: true },
    { src: "/media/win-denova", alt: "Presenting the build at Denova", event: "Denova", result: "Winner · Solana track", wide: true },
    { src: "/media/win-cardano-cheque", alt: "Holding the cheque at the Cardano hackathon", event: "Cardano hackathon", result: "Winner", tall: true },
    { src: "/media/win-inception", alt: "The team holding the Inception winner's cheque", event: "Inception", result: "Winner" },
    { src: "/media/win-gsc", alt: "The team at the Google Solution Challenge bootcamp", event: "Google Solution Challenge", result: "Regional qualifier" },
    { src: "/media/life-hacking-floor", alt: "A packed hackathon floor under a 'Let the hacking begin' banner", event: "Let the hacking begin", feature: true },
    { src: "/media/life-talk", alt: "Ujesh speaking into a microphone", event: "On the mic", tall: true },
    { src: "/media/win-cypher-2", alt: "Certificates in hand after Cypher 3", event: "Cypher 3", result: "Winner" },
    { src: "/media/win-hackerrank", alt: "Teams at the HackerRank Orchestrate finals", event: "HackerRank Orchestrate", result: "Bronze" },
    { src: "/media/win-inception-solo", alt: "Ujesh with the Inception winner's cheque", event: "Inception", result: "Winner", tall: true },
    { src: "/media/life-focus", alt: "Teammates heads down at their laptops", event: "Heads down", wide: true },
    { src: "/media/life-selfie", alt: "A team selfie at a hackathon", event: "Team selfie" },
    { src: "/media/life-mic", alt: "Ujesh pitching with a microphone", event: "Pitching the build" },
    { src: "/media/life-podium", alt: "Ujesh at the podium", event: "At the podium", tall: true },
    { src: "/media/life-hall", alt: "A full hall at a hackathon", event: "A full hall", wide: true },
    { src: "/media/life-crowd", alt: "A large group photo of participants", event: "Everyone who showed up" },
    { src: "/media/win-cardano-floor", alt: "The Cardano hackathon floor", event: "Cardano hackathon" },
    { src: "/media/life-build-2", alt: "Ujesh at his laptop, a teammate in headphones beside him", event: "Shipping before the deadline" },
    { src: "/media/life-demo", alt: "Ujesh presenting a demo", event: "Demo time" },
    { src: "/media/life-group", alt: "A big group photo on a staircase", event: "The whole crew", wide: true },
    { src: "/media/win-inception-3", alt: "The Inception team with their cheque", event: "Inception", result: "Winner" },
    { src: "/media/life-desk", alt: "Two teammates working at one desk", event: "Pair programming" },
    { src: "/media/life-build-1", alt: "The team coding side by side on a hackathon floor", event: "Mid-build" },
    { src: "/media/life-classroom", alt: "Ujesh presenting to a classroom", event: "Running a session" },
    { src: "/media/life-swag", alt: "A pile of hackathon t-shirts, bags and badges", event: "The swag pile" },
    { src: "/media/life-build-3", alt: "Teammates at a hackathon, one looking at the camera", event: "The crew" },
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
  photo: {
    src: "/media/life-classroom",
    alt: "Ujesh at the podium presenting model-training results to a room",
    caption: "Presenting training results",
  },
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

/** The robot's face and move for a line. */
export type RobotMood = "wave" | "happy" | "think" | "cheer" | "peek" | "dizzy" | "sleep" | "angry";
/** Where the companion sits: one of the four corners. */
export type RobotCorner = "br" | "bl" | "tr" | "tl";

/**
 * What the robot says as each section reaches the middle of the screen. Where
 * it says it is up to the robot: a corner picked at random each time (see the
 * Director in RobotLayer).
 */
export const ROBOT_LINES: Record<string, { line: string; mood?: RobotMood }> = {
  signals: { line: "I'll follow you down. Click me any time for shortcuts.", mood: "wave" },
  story: { line: "The short version: eight chapters, all true." },
  build: { line: "Here's what he builds. Keep scrolling, the cards fly past." },
  work: { line: "The projects! Filter them: hackathon, research or side project." },
  internships: { line: "Three internships. Real users, real deadlines." },
  freelance: { line: "Client work: real sites for real clients." },
  about: { line: "That's him on stage. He talks faster than I compute." },
  leadership: { line: "He runs a club of 200. I run on batteries." },
  wins: { line: "Seven wins out of fifty-plus hackathons. I counted twice.", mood: "cheer" },
  wall: { line: "The photo wall! Hover a picture, it ripples." },
  research: { line: "GradMesh goes to IMPACT-2027 this January." },
  feed: { line: "For the day-to-day, these are his profiles." },
  offclock: { line: "Marathons and football. I mostly hover." },
  faq: { line: "Short on time? The quick answers are here." },
  contact: { line: "That's the tour! His inbox is right here.", mood: "wave" },
}

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
  wake: "Oh! You're back.",
  console: [
    "Hey, you opened the console. You're my kind of visitor.",
    "This site: Next.js, React Three Fiber, GSAP, Lenis, one very patient robot.",
    "Built by Ujesh Kumar Yadav. Say hi: ujeshyadav20k5@gmail.com",
    "Psst: try the classic cheat code. ↑ ↑ ↓ ↓ ← → ← → B A",
  ],
};

/**
 * Clicking the robot. The first click (after a quiet spell) makes it vanish
 * into particles and pop back with a jump, and opens the menu. Every further
 * click in a row gets a new line, in this order, each less amused than the
 * last; after the "stop"s it gets angry: red-hot, eyebrows down, and clicks
 * just knock particles off where they land. A few seconds' peace and it
 * calms down again.
 */
export const ROBOT_CLICKS = {
  menu: ["Boop! Where to?", "You rang? Pick a stop:", "Beep boop. Where shall we go?", "Hi again! Where to?"],
  streak: [
    { line: "Hey! That tickles.", mood: "happy", word: "boop" },
    { line: "Hehe. Again?", mood: "happy", word: "click" },
    { line: "Whoa. Now I'm dizzy.", mood: "dizzy", word: "wheee" },
    { line: "Okay, stop.", mood: "think", word: "hey!" },
    { line: "Stop. Please.", word: "stop" },
    { line: "I mean it. Stop.", word: "stop!" },
    { line: "STOP!", word: "STOP" },
  ] as { line: string; mood?: RobotMood; word: string }[],
  angryStart: "That's it. I'm angry now.",
  angry: [
    "Grrr.",
    "Not. Funny.",
    "I'm telling Ujesh.",
    "My circuits are boiling.",
    "One more click. I dare you.",
    "I have a laser. Probably.",
    "You're going on my list.",
    "That's actual steam, you know.",
  ],
  calm: ["…Fine. Friends again?", "Okay. I've cooled down.", "Deep breath. We're good."],
  words: ["click", "boop", "beep", "tap", "bonk", "clack"],
  angryWords: ["grr", "hmph", "argh", "!!", "💢"],
};

export const ROBOT_MENU = {
  prompt: "Where to?",
  stops: [
    { label: "Projects", href: "#work" },
    { label: "Internships", href: "#internships" },
    { label: "Freelance", href: "#freelance" },
    { label: "Wins", href: "#wins" },
    { label: "Research", href: "#research" },
    { label: "Contact", href: "#contact" },
    { label: "Back to top", href: "#top" },
  ],
};
