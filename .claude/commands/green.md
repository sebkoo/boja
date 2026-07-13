---
description: Write the minimal code to turn the red tests green, then confirm the pre-push gate.
---

Turn the current story's **red tests green** with the **minimal** code that passes
them:

1. Implement just enough — no surface beyond what a test requires.
2. Keep `packages/core` framework-free; zod at edges.
3. Run `pnpm typecheck && pnpm test` (the pre-push gate) until green.

Stop when tests pass. Refactor, docs, and the commit belong to `/ship`.
