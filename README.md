# Mohamed Suhail: portfolio

One scrolling page. Next.js 16 · React 19 · TypeScript · React Three Fiber · Motion · Lenis. Plain CSS (`src/app/globals.css`).

```bash
npm run dev        # http://localhost:3000, drafts are visible and marked
npm run build      # production build, drafts are hidden
npm run start      # serve the production build
npm run typecheck
```

## The page, top to bottom
Near-black 3D hero → ticker → **About** → **Work** → **Achievements** → **NightBerrieZ** → **Contact** → footer.
Each section has an id (`#about`, `#work`, `#achievements`, `#building`, `#contact`), and the header and menu scroll to them. Project details open as a panel on the same page.

## Where to edit things
Everything personal lives in `src/content/`. The page reads from these files; you should not need to touch components.

| What | File |
|---|---|
| Name, headline, intro line, email, phone, WhatsApp, resume, site URL | `profile.ts` |
| Projects (name, overview, features, tech, links, screenshots) | `projects.ts` |
| Hackathons and awards (event, organizer, year, result, certificate, proof) | `achievements.ts` |
| NightBerrieZ wording and "ways to join in" | `startup.ts` |
| About section copy and journey | `about.ts` |
| Social profile links (empty ones are hidden) | `social.ts` |
| Nav items | `nav.ts` |
| Ticker words | `src/app/page.tsx` (the `ticker` list) |

### Publishing a project
1. Put images in `public/projects/<slug>/` (create the folder).
2. In `projects.ts`, fill in `status`, `overview`, `features` (only what is really built), `tech`, `links` and `screenshots`.
3. Change `visibility` from `"draft"` to `"public"`.

Drafts appear only under `npm run dev`, marked **Draft**, and are never in the production build.

### Adding an achievement
Copy the commented example in `achievements.ts`. Use `kind: "winner"` only for real wins and `"participant"` for events you took part in. Certificates go in `public/certificates/`.

## Motion
Smooth wheel scrolling (Lenis), a short name-only loader, a 3D sculpture ("the Spire": pearl-ceramic drums, silver rings, glass plates, a travelling light channel) that assembles on load, follows the pointer and can be paused from the round header button, scroll-filled statement, scroll-reactive ticker, parallax, stacked rounded sections, magnetic buttons, rolling labels, hide-on-scroll nav, custom cursor (mouse only).
All of it respects `prefers-reduced-motion`, and the page stays readable if scripts or the 3D bundle fail to load.

## Hero
`src/components/hero/` holds the hero (`Hero.tsx`), the 3D scene (`SculptureScene.tsx`) and the no-WebGL drawing (`SculptureFallback.tsx`). The headline lines are the `LINES` list in `Hero.tsx`. The round header control pauses/resumes the 3D render (state in `src/lib/motionStore.ts`).

## Reference study
`docs/REFERENCES.md` lists the sites studied and what was learned from each.
