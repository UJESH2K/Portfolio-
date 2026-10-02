# Ujesh Kumar Yadav — Portfolio

A single-page portfolio whose structure and motion follow
[juncastudio.com](https://juncastudio.com/), with a 3D robot that greets
visitors on the landing page, talks in speech bubbles and walks them
through the site.

**Stack:** Next.js 14 (App Router) · TypeScript · React Three Fiber + drei ·
GSAP · Lenis · plain CSS (`app/site.css`) · Tailwind (for `/admin` only)

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Editing content

All copy lives in [`lib/content.ts`](./lib/content.ts), in the
**STUDIO SITE** block near the end. Components never hold copy of their own.

| What | Export |
| --- | --- |
| Landing eyebrow and the robot's opening lines | `LANDING` |
| "The story so far" chapters | `STORY` |
| Selected work cards | `WORK` |
| Experience cards | `ROLES` |
| Wins stage | `WINS`, `STATS` |
| Research strip | `RESEARCH` |
| Highlighted LinkedIn / X / Instagram posts | `SOCIAL_POSTS` |
| What the robot says per section | `ROBOT_LINES` |

Anything not yet known is marked `NEEDS_INPUT` and hidden by the UI:

```bash
grep -n NEEDS_INPUT lib/content.ts
```

Still to fill in: X and Facebook profile URLs (`SOCIALS`), post URLs for
`SOCIAL_POSTS`, the résumé PDF at `public/resume.pdf`, and a portrait photo
(`ABOUT.portrait`).

## Adding a highlighted post

Add an entry to `SOCIAL_POSTS`:

```ts
{ platform: "linkedin", url: "https://www.linkedin.com/posts/…", caption: "Won Inception!", date: "Jun 2026" }
```

Posts added from `/admin` appear in the same strip once Supabase is
configured.

## Images

Photos used by the site are WebP pairs in `public/media/` (`name-800.webp`
and `name-1600.webp`); content entries reference the base path without the
suffix, e.g. `"/media/win-inception"`. Original photos live in `images/`
(git-ignored).

## How the page is built

- [`app/page.tsx`](./app/page.tsx) composes the sections in
  [`components/studio/sections/`](./components/studio/sections/).
- [`components/studio/Hero.tsx`](./components/studio/Hero.tsx) is the landing
  page over shader smoke ([`HeroSmoke.tsx`](./components/studio/HeroSmoke.tsx)).
- [`components/studio/robot/`](./components/studio/robot/) holds the robot:
  `RobotScene.tsx` (one fixed canvas; clip windows, expressions, cursor
  tracking, jumps), `RobotLayer.tsx` (speech balloon, click menu, section
  cues, idle nudges) and `sfx.ts` (synthesised sounds, off by default).
  Shared state is in [`lib/robot.ts`](./lib/robot.ts).
- Sections cue the robot with a `data-cue="key"` attribute matching a key in
  `ROBOT_LINES`.
- [`IdleDoodles.tsx`](./components/studio/IdleDoodles.tsx) draws the
  hand-drawn hint arrows, ported from the NEXR site.

The previous 3D homepage is preserved in `legacy/universe-homepage-2026-09/`
and its components remain in `components/site/`.

## Credits

- 3D robot: ["Robot Playground"](https://sketchfab.com/3d-models/robot-playground-59fc99d8dcb146f3a6c16dbbcc4680da)
  by Hadrien59, licensed [CC BY 4.0](http://creativecommons.org/licenses/by/4.0/).
  Optimised with gltf-transform; the credit must stay visible on the site
  (footer and FAQ).
- Fonts: Cabinet Grotesk (Fontshare, ITF Free Font License), Geist and Geist
  Mono (OFL).
