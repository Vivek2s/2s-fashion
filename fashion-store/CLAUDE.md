# CLAUDE.md — Project memory for the multi-agent build loop

You are working in **fashion-store**, an SEO-first fashion e-commerce storefront.
Read this file fully before doing anything. It is the single source of truth for
how we work here.

## What we're building
A minimal, editorial fashion storefront (aesthetic reference: `lassepedersen.biz`
— clean white, thin type, full-bleed hero video, generous whitespace). The MVP is
the **homepage** (hero + featured collection), then product listing, product
detail, cart, and checkout.

## Stack (do not change without asking)
- **Monorepo:** Nx workspace, npm workspaces. Two apps + shared libs.
- **Frontend:** `apps/web` — Next.js 15 App Router, TypeScript, Tailwind CSS.
  Server-render everything crawlable (SSR/ISR). SEO is a first-class requirement.
- **Backend:** `apps/api` — Node + TypeScript, Express, Mongoose, MongoDB.
- **Shared:** `libs/shared-types` — the ONE place types live. Never redefine
  `Product`/`Collection` in an app; import from `@fashion-store/shared-types`.

## Non-negotiable conventions
1. **Types are shared.** Frontend and backend both import from `libs/shared-types`.
   If the API shape changes, update the shared type first, then both sides.
2. **SEO is a gate, not a feature.** Every page: server-rendered, has metadata via
   `apps/web/lib/seo.ts`, semantic HTML, `next/image`, JSON-LD where relevant.
   Keep `sitemap.ts` and `robots.ts` correct.
3. **TypeScript strict.** No `any` in committed code except where already present
   in scaffolding you're explicitly replacing.
4. **Small, verifiable changes.** Every change must pass `npm run typecheck`,
   `npm run lint`, and `npm run test` before it's considered done.
5. **Match the aesthetic.** White background, `font-serif` display type, muted
   grey secondary text, lots of whitespace, subtle transitions only.

## Commands
- `npm run dev` — run web + api together
- `npm run dev:web` / `npm run dev:api`
- `npm run build` / `npm run lint` / `npm run test` / `npm run typecheck`
- `npm --workspace api run seed` — seed MongoDB with demo products

## How we work: the agent loop
We use a **plan → implement → review → test** loop driven by subagents. See
`docs/AGENT-LOOP.md`. The short version:
- `/plan <task>` — the **orchestrator** breaks the task down and picks which
  specialist(s) to route to.
- `/implement <task>` — routes to `frontend-engineer`, `backend-engineer`, or
  `seo-specialist` to make the change.
- `/review` — the `qa-reviewer` audits the diff against these rules.
- `/test` — run typecheck + lint + tests; fix until green.
- `/loop <feature>` — runs the whole cycle until the feature is done and green.

Always end a unit of work with a green `/test`. If review finds issues, loop back
to implement — do not mark work done with failing checks.
