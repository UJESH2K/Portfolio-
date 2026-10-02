import type { CSSProperties } from "react";
import { FEED_INTRO, PROFILE, SOCIALS, SOCIAL_POSTS, isMissing, type Post } from "@/lib/content";
import { ArrowIcon, Eyebrow, SplitWords } from "../primitives";

const NOTES: Record<string, string> = {
  github: `${PROFILE.publicRepos}+ public projects, from GPU meshes to hackathon builds.`,
  linkedin: "Build logs, internships and the occasional win.",
  instagram: "Hackathon floors, race days and everything between.",
  x: "Short thoughts, shipped often.",
  facebook: "Events, photos and announcements.",
  holopin: "Open-source badges, Hacktoberfest included.",
};

const PLATFORM_LABEL: Record<string, string> = {
  linkedin: "LinkedIn",
  x: "X",
  instagram: "Instagram",
  github: "GitHub",
};

/**
 * Around the internet. Highlighted posts (SOCIAL_POSTS in content.ts, plus
 * posts added from /admin) come first; profile cards fill the rest, so the
 * section is never empty while the posts list is.
 */
export default function Feed({ posts }: { posts: Post[] }) {
  const profiles = SOCIALS.filter((s) => s.id !== "email" && !isMissing(s.href) && !isMissing(s.handle));
  const adminPosts = posts.filter((p) => p.linkUrl);

  return (
    <section id="feed" className="feed" data-cue="feed" aria-labelledby="feed-title">
      <div className="wrap">
        <div className="feed__head">
          <div>
            <Eyebrow>{FEED_INTRO.eyebrow}</Eyebrow>
            <h2 id="feed-title" className="h2" data-rv>
              <SplitWords text={FEED_INTRO.title} />
            </h2>
          </div>
        </div>

        <ul className="feed__grid">
          {SOCIAL_POSTS.map((p, i) => (
            <li key={p.url} className="rv" data-rv style={{ "--d": `${i * 0.05}s` } as CSSProperties}>
              <a className="fcard fcard--post" href={p.url} target="_blank" rel="noopener noreferrer">
                {p.image ? (
                  <span className="fcard__img">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`${p.image}-800.webp`} alt="" loading="lazy" />
                  </span>
                ) : null}
                <span className="fcard__platform">
                  <span>{PLATFORM_LABEL[p.platform]}</span>
                  <span>{p.date}</span>
                </span>
                <span>
                  <span className="fcard__handle">{p.caption}</span>
                  <span className="fcard__note">
                    Read the post <ArrowIcon className="cta__ic" />
                  </span>
                </span>
              </a>
            </li>
          ))}
          {adminPosts.map((p, i) => (
            <li key={p.id} className="rv" data-rv style={{ "--d": `${i * 0.05}s` } as CSSProperties}>
              <a className="fcard fcard--post" href={p.linkUrl} target="_blank" rel="noopener noreferrer">
                <span className="fcard__platform">
                  <span>{p.linkLabel ?? "Post"}</span>
                  <span>{new Date(p.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                </span>
                <span className="fcard__handle">{p.caption}</span>
              </a>
            </li>
          ))}
          {profiles.map((s, i) => (
            <li key={s.id} className="rv" data-rv style={{ "--d": `${i * 0.05}s` } as CSSProperties}>
              <a
                className="fcard"
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ "--glow": s.color } as CSSProperties}
              >
                <span className="fcard__platform">
                  <span>{s.label}</span>
                  <ArrowIcon className="cta__ic" />
                </span>
                <span>
                  <span className="fcard__handle">{s.handle}</span>
                  <span className="fcard__note">{NOTES[s.id] ?? ""}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
