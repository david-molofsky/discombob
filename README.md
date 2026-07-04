# Discombob

A bespoke, single-user ADHD support PWA. Local-only storage, no login, no cloud sync.

## Stack
React 19, TypeScript, Vite, MUI v7, Dexie 4, Zod, Recharts, Day.js, HashRouter.

## Local dev
```
npm install
npm run dev
```

## Build
```
npm run build
```
Output goes to `dist/`.

## Deploy to GitHub Pages
1. Create a GitHub repo named `discombob` (or update `base` in `vite.config.ts` and
   `start_url`/`scope` in the PWA manifest if you use a different name).
2. Push this code to the `main` branch.
3. In the repo Settings → Pages, set Source to "GitHub Actions".
4. The included `.github/workflows/deploy.yml` will build and deploy automatically
   on every push to `main`. You can also trigger it manually from the Actions tab.
5. Your app will be live at `https://<your-username>.github.io/discombob/`.

## Schema changes
Dexie schema lives in `src/db/db.ts`. Any structural change requires bumping
`.version(N)` and adding an upgrade path — see Dexie's docs on `.upgrade()`.

## Notable implementation choices
- No Dexie multiEntry indexes (iOS Safari compatibility) — trigger lists on mood
  entries are stored as a JSON string, not indexed.
- Someday items track `location` (someday_todo / today / someday_completed),
  `origin` (someday / direct), and — only meaningful once in Today — a 3-state
  `state` (not_started / started / done).
- Mood check-ins never overwrite; every save inserts a new row, so multiple
  check-ins per day are supported by design.
- Swipe gestures on Someday are implemented from scratch with pointer events
  (see `src/components/SwipeableItem.tsx`) — no external gesture library.
