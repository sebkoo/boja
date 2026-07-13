---
description: Refactor, update docs and media, then stage explicit paths, review the diff, and commit.
---

The full ship step, once tests are green:

1. **Refactor** for clarity — behavior unchanged, tests still green.
2. **Docs** — update the README story row; add or amend an ADR if a decision
   changed.
3. **Media** — story recordings go under `docs/media/story-NN/`; update the
   README story row's media cell.
4. **Commit** — stage **explicit paths** → `git diff --cached --name-only` → show
   `git diff --cached` → Conventional Commit with a **WHY + tradeoff** body and
   **no `Co-Authored-By` trailer**.
