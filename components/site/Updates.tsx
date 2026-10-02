"use client";

import { useRef } from "react";
import { gsap, useGsap } from "@/lib/gsap";
import type { Post } from "@/lib/content";

/**
 * Latest updates — LinkedIn-style: a photo, a caption, an optional link.
 * Posted from /admin so new milestones show up without a redeploy. Renders
 * nothing until at least one post exists.
 */
export default function Updates({ posts }: { posts: Post[] }) {
  const root = useRef<HTMLElement>(null);

  useGsap(
    () => {
      gsap.from("[data-post]", {
        y: 24,
        autoAlpha: 0,
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: root.current, start: "top 75%", once: true },
      });
    },
    root,
    [posts.length]
  );

  if (posts.length === 0) return null;

  return (
    <section ref={root} id="updates" className="relative mx-auto max-w-5xl px-5 py-24 md:px-8 md:py-32">
      <p className="mono text-accent">Latest</p>
      <h2 className="display mt-2 text-d2">
        What I&apos;m <span className="serif lowercase">up to</span>
      </h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <article key={p.id} data-post className="glass flex flex-col overflow-hidden rounded-xl will-move">
            {p.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.imageUrl} alt="" className="h-48 w-full object-cover" />
            )}
            <div className="flex flex-1 flex-col justify-between gap-4 p-5">
              <p className="text-[14px] leading-snug text-white/75">{p.caption}</p>
              <div className="flex items-center justify-between">
                <span className="mono text-white/40">
                  {new Date(p.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                {p.linkUrl && (
                  <a
                    href={p.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mono text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
                  >
                    {p.linkLabel ?? "View"}
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
