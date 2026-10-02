"use client";

import { motion } from "framer-motion";
import type { Project } from "@/lib/content";
import { isMissing } from "@/lib/content";
import { NO_PHOTO_IMAGE } from "@/lib/placeholderImage";
import TiltCard from "./TiltCard";

/**
 * One project, shown properly: a large, uncropped-feeling media block (full
 * width, generous height, object-contain-friendly aspect ratio — never the
 * hover-shrink-to-a-sliver treatment the old ProjectReel grid used) plus
 * real copy, a subtle 3D tilt, and a functional "View Project" link when
 * there's actually somewhere for it to go. Used by both the Featured Work
 * and Freelance chapters.
 */
export default function CaseStudyCard({ project, reverse = false }: { project: Project; reverse?: boolean }) {
  const href = project.live ?? project.repo;

  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <TiltCard strength={4} className="group">
        <div
          className={`glass grid gap-0 overflow-hidden rounded-2xl md:grid-cols-2 ${
            reverse ? "md:[&>*:first-child]:order-2" : ""
          }`}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden md:aspect-auto">
            {project.videoUrl ? (
              <video
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                src={project.videoUrl}
                poster={project.imageUrl}
                muted
                loop
                playsInline
                autoPlay
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={project.imageUrl ?? NO_PHOTO_IMAGE}
                alt={project.title}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
              />
            )}
          </div>

          <div className="flex flex-col justify-center gap-4 p-8 md:p-10">
            <p className="mono text-accent">{project.year}</p>

            <h3 className="display text-3xl md:text-4xl">{project.title}</h3>

            {!isMissing(project.subtitle) && (
              <p className="text-[15px] text-white/70">{project.subtitle}</p>
            )}

            <p className="text-[14px] leading-relaxed text-white/55">{project.description}</p>

            {project.stack.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span key={s} className="mono rounded-full border border-white/15 px-2.5 py-1 text-white/60">
                    {s}
                  </span>
                ))}
              </div>
            )}

            {href && (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
                className="mono mt-2 inline-flex w-fit items-center gap-2 text-white transition-all duration-300 hover:gap-3 hover:text-accent"
              >
                View Project
                <span aria-hidden>→</span>
              </a>
            )}
          </div>
        </div>
      </TiltCard>
    </motion.article>
  );
}
