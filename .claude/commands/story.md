---
description: Pick the next story and scaffold it test-first (red tests + core→api→mobile outline).
argument-hint: <story number, e.g. 01>
---

Pick the next user story (`$ARGUMENTS` = the story number, e.g. `01`) and scaffold
it **test-first**. Do not write implementation code — leave the tests red.

1. Read the story's row in the README "User stories" table and check scope in
   `docs/system-design.md`.
2. Write the **failing (red) tests** first: `packages/core` for domain rules,
   `apps/api` for routes, `apps/mobile` (Maestro / jest-expo) for the UI flow.
3. Outline the slice **core → api → mobile**, naming the `packages/ai` seams it
   touches — interfaces only, no implementation.
4. Confirm or link the story's row in the README "User stories" table.

Implementation is `/green`; refactor + docs + commit are `/ship`.
