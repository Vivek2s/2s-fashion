# ATELIER — SEO-first fashion storefront (Claude Code starter)

A ready-to-build fashion e-commerce storefront, wired for a **multi-agent Claude
Code build loop**. Aesthetic reference: `lassepedersen.biz` (clean, white,
editorial). Download, install, and start driving the loop.

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind — SSR/ISR for SEO
- **Backend:** Node + TypeScript + Express + Mongoose + MongoDB
- **Monorepo:** Nx + npm workspaces, shared type contract in `libs/shared-types`
- **Agents:** `.claude/` with 5 specialist subagents + 5 slash commands

> Full SEO rationale: [`docs/SEO-STACK-RECOMMENDATION.md`](docs/SEO-STACK-RECOMMENDATION.md).
> Architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
> How the agent loop works: [`docs/AGENT-LOOP.md`](docs/AGENT-LOOP.md).

## 0. See it right now (no build)
Open `prototype/index.html` in a browser. It's the full responsive homepage
(hero + featured collection), works on desktop and phone. Use it as the visual
target for the real Next.js build.

## 1. Prerequisites
- Node.js 20+
- MongoDB running locally (or a MongoDB Atlas connection string)
- [Claude Code](https://docs.claude.com/en/docs/claude-code) installed:
  `npm install -g @anthropic-ai/claude-code`

## 2. Install
```bash
npm install
cp .env.example .env        # edit MONGODB_URI if needed
```

## 3. Seed the database (optional but recommended)
```bash
npm --workspace api run seed
```

## 4. Run
```bash
npm run dev                 # web on :3000, api on :4000
# or individually:
npm run dev:web
npm run dev:api
```
Open http://localhost:3000. The homepage renders featured products from the API;
if the API is down it falls back to seed data so the page always renders.

## 5. Build with the agent loop
From the repo root, start Claude Code (`claude`) and try:
```
/loop Add the /shop product listing page: server-rendered grid, category filter,
per-page SEO metadata, and a Vitest test for the API category filter.
```
Or step through it: `/plan` → `/implement` → `/review` → `/test`.
See [`docs/AGENT-LOOP.md`](docs/AGENT-LOOP.md) for the full workflow.

## Verify gate
Everything should stay green:
```bash
npm run typecheck && npm run lint && npm run test
```

## What's included vs. what the loop builds
**Included:** monorepo config, shared types, working home page (SSR + ISR + SEO),
products API + model + seed, standalone prototype, all Claude Code agent config.
**Build next with the loop:** product listing, product detail (with `Product`
JSON-LD), cart, checkout, auth, search, CMS for the journal/lookbook.

## Notes
- Replace the hero `<source>` with a real campaign video (`apps/web/components/Hero.tsx`
  and `prototype/index.html`).
- Demo images are Unsplash hotlinks; swap for your own asset pipeline / CDN.
- Consider NestJS or Fastify instead of Express if you want more structure — the
  `backend-engineer` agent can migrate it.
