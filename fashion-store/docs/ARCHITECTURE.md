# Architecture

```
fashion-store/                 Nx monorepo (npm workspaces)
├── apps/
│   ├── web/                   Next.js 15 App Router (SEO-first storefront)
│   │   ├── app/               routes: layout, page (home), sitemap, robots
│   │   ├── components/        Navbar, Hero, FeaturedCollection, Footer
│   │   └── lib/seo.ts         metadata + JSON-LD helpers
│   └── api/                   Node + TS + Express + Mongoose
│       └── src/
│           ├── main.ts        bootstrap (connect DB, listen)
│           ├── app.ts         express app + routes
│           ├── config/db.ts   mongoose connection
│           ├── models/        Product schema
│           ├── controllers/   thin request handlers
│           ├── routes/        route wiring
│           └── seed.ts        demo data loader
├── libs/
│   └── shared-types/          the ONE contract shared by web + api
├── prototype/index.html       standalone static homepage preview (no build)
├── docs/                      SEO recommendation, this file, agent loop
├── .claude/                   multi-agent config (agents, commands, settings)
└── CLAUDE.md                  project memory / rules for the loop
```

## Data flow
Browser → `apps/web` (Server Component `fetch` with ISR) → `apps/api`
`GET /api/products` → Mongoose → MongoDB. Types flow from `libs/shared-types` into
both apps, so the contract can't silently drift.

## Rendering strategy (SEO)
- Home + collection + product pages: **SSR/ISR** so crawlers get full HTML.
- Cart/checkout: client-interactive, `noindex` via robots.
- Images through `next/image` (AVIF/WebP, responsive, lazy).

## Why Nx
Nx runs both apps with one command, shares the types library without publishing,
and caches builds/tests so the agent loop's `/test` gate stays fast.
