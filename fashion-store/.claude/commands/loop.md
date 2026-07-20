---
description: Run the full plan -> implement -> review -> test loop for a feature until green.
argument-hint: <feature description>
---
Drive the full agent loop for the feature below. Repeat until the feature is
complete and the gate is green:

1. `orchestrator` plans the feature (acceptance criteria + ordered steps + owners).
2. For each step: route to the specialist to implement, then to `qa-reviewer`.
3. If review REQUESTS CHANGES, loop back to the specialist for that step.
4. When all steps are implemented, run the full gate (`npm run typecheck && npm run
   lint && npm run test`). If red, fix and repeat.
5. Stop only when every acceptance criterion is met and the gate is green. Summarize
   what changed and what to verify manually (e.g. run `npm run dev` and check the page).

Feature: $ARGUMENTS
