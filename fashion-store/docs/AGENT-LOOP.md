# The multi-agent build loop

This project is set up so you can build features with Claude Code driving a team of
specialist subagents in a **plan → implement → review → test** loop.

## The agents (`.claude/agents/`)

| Agent | Role |
|---|---|
| `orchestrator` | Plans a feature, splits it into steps, routes each to a specialist. Doesn't write app code. |
| `backend-engineer` | Express API, Mongoose models, MongoDB, and the shared type contract. |
| `frontend-engineer` | Next.js App Router pages and components, Tailwind styling. |
| `seo-specialist` | Metadata, JSON-LD, sitemap/robots, Core Web Vitals, semantic HTML, a11y. |
| `qa-reviewer` | Audits the diff against the rules and runs the verification gate. |

## The commands (`.claude/commands/`)

| Command | What it does |
|---|---|
| `/plan <feature>` | Orchestrator produces acceptance criteria + ordered steps + owners. |
| `/implement <task>` | Routes one task to the right specialist. |
| `/review` | qa-reviewer audits the current `git diff` and runs the gate. |
| `/test` | Runs typecheck + lint + tests, fixes until green. |
| `/loop <feature>` | Runs the whole cycle end-to-end until the feature is done and green. |

## The loop, visually

```
        ┌──────────────┐
        │   /plan       │  orchestrator: criteria + steps + owners
        └──────┬───────┘
               │  for each step
               ▼
        ┌──────────────┐
        │  /implement   │  backend / frontend / seo specialist
        └──────┬───────┘
               ▼
        ┌──────────────┐
        │   /review     │  qa-reviewer: APPROVE or REQUEST CHANGES
        └──────┬───────┘
        REQUEST │ APPROVE
        CHANGES │
       ◄────────┘
               ▼
        ┌──────────────┐
        │    /test      │  typecheck + lint + tests must be green
        └──────┬───────┘
          red  │  green
       ◄───────┘
               ▼
             done
```

## How to run it

From the repo root, start Claude Code and just say:

```
/loop Add the product listing page (/shop) with server-rendered product grid,
filters by category, SEO metadata, and a Vitest test on the API filter.
```

Or drive it step by step with `/plan`, then `/implement`, `/review`, `/test`.

## The one rule
**Never call a feature done with a red gate.** `npm run typecheck && npm run lint &&
npm run test` must all pass. `qa-reviewer` enforces this; so should you.
