import { PROFILE, SOCIALS } from "./content";

/**
 * Where the "résumé" buttons point. With /public/resume.pdf in place at build
 * time (next.config.mjs sets NEXT_PUBLIC_HAS_RESUME), they download it;
 * until then they open the full history on LinkedIn instead of a 404.
 */
export const RESUME = process.env.NEXT_PUBLIC_HAS_RESUME
  ? { href: PROFILE.resumeUrl, label: "Download résumé", short: "Résumé (PDF)", download: true, external: false }
  : {
      href: SOCIALS.find((s) => s.id === "linkedin")?.href ?? "https://www.linkedin.com/in/ujesh-kumar-yadav/",
      label: "Full résumé on LinkedIn",
      short: "Résumé (LinkedIn)",
      download: false,
      external: true,
    };

export type ResumeKind = {
  id: string;
  title: string;
  /** Two or three letters on the folder tile. */
  short: string;
  blurb: string;
  /** Under /public. A missing file shows as "coming soon". */
  file: string;
  /** Tile colours: band across the top of the page, and the page tint. */
  band: string;
  tint: string;
};

/** The résumés in the picker. Drop the PDFs into public/resumes/ with these names. */
export const RESUMES: ResumeKind[] = [
  {
    id: "software",
    title: "Software Engineering",
    short: "SWE",
    blurb: "Full-stack products, APIs and cloud",
    file: "/resumes/ujesh-software-engineering.pdf",
    band: "#0d0d0d",
    tint: "#fbfaf6",
  },
  {
    id: "aiml",
    title: "AI / ML",
    short: "AI",
    blurb: "Applied AI, RAG and computer vision",
    file: "/resumes/ujesh-ai-ml.pdf",
    band: "#ff5a1f",
    tint: "#fff4ee",
  },
  {
    id: "research",
    title: "Research",
    short: "R&D",
    blurb: "GradMesh, papers and distributed training",
    file: "/resumes/ujesh-research.pdf",
    band: "#1f3a2c",
    tint: "#f1f5f1",
  },
  {
    id: "general",
    title: "General",
    short: "CV",
    blurb: "Everything on one page",
    file: "/resumes/ujesh-resume.pdf",
    band: "#8a6a4c",
    tint: "#f8f3ec",
  },
];

/** Opens the résumé picker from anywhere on the page. */
export const RESUME_EVENT = "pfl:open-resume";
export const openResumePicker = () => window.dispatchEvent(new Event(RESUME_EVENT));
