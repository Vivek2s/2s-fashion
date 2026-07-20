---
description: Run the full verification gate and fix until green.
---
Run the verification gate from the repo root:

```
npm run typecheck
npm run lint
npm run test
```

If anything fails, diagnose and fix (routing to the relevant specialist for
non-trivial fixes), then re-run until all three pass. Report the final status.
