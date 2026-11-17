/**
 * Where the "résumé" buttons point without JavaScript (and where to send
 * people directly): the /resume page, which shows every résumé.
 */
export const RESUME = { href: "/resume", label: "Résumés", short: "Résumé", download: false, external: false };

export type ResumeKind = {
  id: string;
  /** The page for this résumé: /resume/<slug>. */
  slug: string;
  title: string;
  /** Two or three letters on the folder tile. */
  short: string;
  blurb: string;
  /** Under /public. A missing file shows as "coming soon". */
  file: string;
  /** A picture of page one, for phones (their browsers rarely show a PDF inline). */
  preview: string;
  /** What the /resume page says about this one. */
  about: string;
  /** Tile colours: band across the top of the page, and the page tint. */
  band: string;
  tint: string;
};

/** The résumés in the picker and on /resume. PDFs and previews live in public/resumes/. */
export const RESUMES: ResumeKind[] = [
  {
    id: "software",
    slug: "software-engineering",
    title: "Software Engineering",
    short: "SWE",
    blurb: "The general one: backend, distributed systems, AI",
    about: "My general résumé. Production backends at an early-stage start-up, freelance AI work, GradMesh and seven hackathon wins.",
    file: "/resumes/ujesh-software-engineering.pdf",
    preview: "/resumes/ujesh-software-engineering.webp",
    band: "#0d0d0d",
    tint: "#fbfaf6",
  },
  {
    id: "aiml",
    slug: "ai-ml",
    title: "AI / ML",
    short: "AI",
    blurb: "Efficient training, LLM agents, retrieval and vision",
    about: "For machine-learning roles: distributed deep-learning training, LLM agents and retrieval, and applied AI in production.",
    file: "/resumes/ujesh-ai-ml.pdf",
    preview: "/resumes/ujesh-ai-ml.webp",
    band: "#ff5a1f",
    tint: "#fff4ee",
  },
  {
    id: "research",
    slug: "research",
    title: "Research",
    short: "R&D",
    blurb: "Distributed and ML systems, publications",
    about: "My research CV. Straggler-aware distributed training on heterogeneous consumer GPUs (GradMesh), the IMPACT-2027 paper and a book chapter.",
    file: "/resumes/ujesh-research.pdf",
    preview: "/resumes/ujesh-research.webp",
    band: "#1f3a2c",
    tint: "#f1f5f1",
  },
];

export const resumeBySlug = (slug: string) => RESUMES.find((r) => r.slug === slug);

/** Opens the résumé picker from anywhere on the page. */
export const RESUME_EVENT = "pfl:open-resume";
export const openResumePicker = () => window.dispatchEvent(new Event(RESUME_EVENT));
