# Console Portfolio

A gaming-console-aesthetic portfolio (Xbox / Steam Deck / PS5 inspired).
First pass = static console dashboard / main menu. No animations, no backend.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind CSS 3 · lucide-react · zustand

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |

## Project layout

```
app/                  Next.js App Router (layout, page, globals.css)
components/console/   Dashboard sections (TopBar, FeaturedTile, etc.)
lib/                  types.ts, data.ts, utils.ts
legacy/               Old assets preserved from the previous Vite site
```

## Editing content

All sample content lives in [`lib/data.ts`](./lib/data.ts). Personal facts
are clearly marked `TODO` so you can swap them in for real data.

## Roadmap

- [ ] Frame-by-frame scroll intro (video → frames → landing)
- [ ] `/admin` route for adding achievements / projects
- [ ] Mini-games section (Easter eggs)
- [ ] Sound effects (Xbox / PS5 / Steam cues)
- [ ] Contact form with mail backend
- [ ] Console controller support (D-pad navigation)
