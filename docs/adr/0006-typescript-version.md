# 6. Standardize on TypeScript 6.0.3

- Status: Accepted
- Date: 2026-07-13

## Context

The repo started with root TypeScript at `^7.0.2`, the newest line at the time.
`apps/mobile` pinned TypeScript `~6.0.3` instead, because Expo SDK 57 validates
and ships against that version. Two costs followed:

1. A split toolchain. The monorepo carried two TypeScript versions — 7 at the
   root, 6.0.3 in mobile — each typechecking on its own. Every contributor had
   to hold both in mind.
2. eslint could not run. typescript-eslint (latest `8.64`) declares a peer
   range of TypeScript `<6.1`. Against the root's TS 7 the parser refused to
   load, so `pnpm lint` failed outright. That is why the pre-push hook ran only
   `typecheck` + `test` and CI had no lint gate — a linter that cannot parse the
   code is not a gate.

TypeScript 7 is a compiler rewrite, not a language change, so the source
compiled identically under either line. The version choice was buying newness,
not a capability the code depended on.

## Decision

Standardize every workspace on TypeScript `~6.0.3` — the version `apps/mobile`
already uses. Root `devDependencies` moves from `^7.0.2` to `~6.0.3`; the mobile
pin stays as explicit local record of Expo's requirement.

## Consequences

- eslint runs. Back inside typescript-eslint's supported range, `pnpm lint`
  parses and passes; lint becomes a real gate in both the pre-push hook and CI.
- One toolchain. A single TypeScript version across `packages/core`,
  `packages/ai`, `apps/api`, and `apps/mobile`. The core/mobile split described
  in the `apps/mobile` scaffold commit is gone.
- A full-green pipeline: lint → typecheck → test → coverage → build all pass,
  locally and in CI. No source changes were needed to compile under TS 6.
- Tradeoff: the repo gives up TypeScript 7's newer compiler for now and sits one
  line behind the latest. This was judged the smaller cost against losing lint
  as an enforceable gate.

## Alternatives considered

- Keep TS 7, run lint as non-blocking (`continue-on-error`). Rejected: a step
  that fails every run and is ignored is weaker signal than a clean gate, and it
  hides real findings behind expected noise.
- Keep TS 7, drop lint from CI entirely. Rejected: gives up lint signal and only
  defers the same decision.
- Downgrade to TS 6.0.3 (this ADR). Chosen: makes lint enforceable, unifies the
  toolchain, and aligns the repo with the version Expo already validates.

## Revisit

Reconsider moving back toward TypeScript 7 once typescript-eslint supports it.
The bar for reversing this: eslint runs green on TS 7 across the workspaces, with
lint still a gate.

## Relationship to other ADRs

Refines ADR-0001 — the framework and monorepo choices stand; only the TypeScript
version changes. Makes real the lint gate that CLAUDE.md and the CI pipeline
assume.
