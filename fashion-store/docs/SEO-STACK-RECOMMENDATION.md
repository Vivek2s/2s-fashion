# Frontend Stack Recommendation (SEO-first)

**TL;DR:** Use **Next.js (App Router) + TypeScript + Tailwind CSS**, rendered
with SSR/SSG/ISR, deployed on Vercel (or any Node host). Pair it with your
**Node + TypeScript + Nx + MongoDB** backend over a typed REST or GraphQL API.

## Why Next.js is the best choice for SEO

A fashion storefront lives and dies by organic search (product pages, collection
pages, lookbooks). The single biggest SEO lever is **server-rendered HTML** —
crawlers get fully-formed markup instead of an empty `<div id="root">` that only
fills in after JavaScript runs. A plain client-only React/Vite SPA fails here.

Next.js gives you, out of the box:

- **SSR / SSG / ISR** — server render dynamic pages, statically pre-build stable
  pages, and incrementally regenerate product pages on a schedule. Fast HTML for
  crawlers and users alike.
- **Metadata API** — per-page `<title>`, description, canonical, Open Graph and
  Twitter cards defined in code, plus JSON-LD structured data (`Product`,
  `BreadcrumbList`, `Organization`) that drives rich results.
- **`app/sitemap.ts` and `app/robots.ts`** — sitemap and robots generated at
  build/runtime, no plugins.
- **`next/image`** — automatic responsive images, lazy loading, AVIF/WebP. Image
  weight is the #1 Core Web Vitals problem for fashion sites; this fixes it.
- **Core Web Vitals** — streaming, code-splitting and edge caching give strong
  LCP/CLS/INP, which are ranking signals.
- **Font optimization** (`next/font`) — no layout shift, no render-blocking.

## The runner-up options (and why not)

| Option | SEO verdict |
|---|---|
| **Next.js** ✅ | Best-in-class SSR/SSG/ISR, first-class metadata + image tooling. Recommended. |
| Remix / React Router 7 | Also excellent SSR; smaller ecosystem for commerce. Fine alternative. |
| Astro | Superb for content/marketing (ships zero JS by default); less ideal once you need rich cart/interactivity everywhere. Great for a lookbook-heavy brand site. |
| Nuxt (Vue) | Equivalent to Next if your team prefers Vue. |
| Vite + React SPA (client-only) | ❌ Poor SEO without SSR. Avoid for storefronts. |
| create-react-app | ❌ Deprecated, client-only. Avoid. |

## Recommended full stack

- **Frontend:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · `next/image` · `next/font`
- **State/data:** React Server Components + TanStack Query for client cart/session
- **Backend:** Node + TypeScript in an **Nx** monorepo · Express (or NestJS/Fastify) · **MongoDB** via Mongoose
- **API contract:** typed REST (or GraphQL) with a shared `libs/shared-types` package so frontend and backend never drift
- **Hosting:** Vercel for `web`, any Node host / container for `api`; MongoDB Atlas for the database
- **Monorepo:** Nx runs both apps, shares types, caches builds

## SEO checklist baked into this scaffold

- [x] Server-rendered pages (SSR/ISR)
- [x] Per-page metadata + canonical URLs (`lib/seo.ts`)
- [x] JSON-LD structured data for Organization + Products
- [x] `sitemap.ts` + `robots.ts`
- [x] Optimized responsive images via `next/image`
- [x] Semantic HTML5 landmarks (`header`, `main`, `nav`, `footer`)
- [x] Accessible alt text, heading hierarchy, `lang` attribute
- [x] Fast Core Web Vitals defaults

> Note on the reference site: `lassepedersen.biz` is a Copenhagen session
> hairstylist's portfolio — a clean, white, mostly-image/video editorial layout
> with subtle motion. The prototype here mirrors that aesthetic (full-bleed hero
> video area, generous whitespace, thin type, a quiet featured grid) adapted to a
> shoppable fashion homepage.
