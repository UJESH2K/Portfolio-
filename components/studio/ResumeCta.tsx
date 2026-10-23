"use client";

import { RESUME, openResumePicker } from "@/lib/resume";
import { Cta } from "./primitives";

/** The section-level résumé button: opens the picker of résumés. */
export default function ResumeCta({ width = 280 }: { width?: number }) {
  return (
    <Cta
      href={RESUME.href}
      width={width}
      onClick={(e) => {
        e.preventDefault();
        openResumePicker();
      }}
    >
      Pick a résumé
    </Cta>
  );
}
