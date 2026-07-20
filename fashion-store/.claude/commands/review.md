---
description: Review the current diff against project rules and run the gate.
---
Use the `qa-reviewer` subagent. Run `git diff`, check against the non-negotiables in
`CLAUDE.md`, run `npm run typecheck && npm run lint && npm run test`, and return a
verdict (APPROVE / REQUEST CHANGES) with a specific fix list.
