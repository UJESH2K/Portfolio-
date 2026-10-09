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
