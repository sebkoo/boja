# CLAUDE.md

## Project

**Boja (보자 — "let's hang out") — the AI concierge that turns it into a real plan.**

iOS-first product with a TypeScript backend. Monorepo — pnpm workspaces +
Turborepo:

- `apps/mobile` — React Native (Expo, strict TS) + one Swift StoreKit 2 module *(scaffolds in Phase 1)*
- `apps/api` — Node.js + TypeScript on Fastify, zod at every edge
- `packages/core` — framework-free domain logic (zod schemas + rules); test-first lives here
- `packages/ai` — the five AI layers as explicit seams (interfaces first)

Decisions are recorded as ADRs in `docs/adr/`. Current status: **Phase 1**
(scaffolding, docs, harness, CI). Phase 2 is Story 01 — paste intent → three
options → confirm → plan card + `.ics`.

## Commands

- `pnpm install` — install deps (Node ≥ 22, pnpm 10.13; `corepack enable pnpm`)
- `pnpm typecheck` — `turbo run typecheck` across workspaces
- `pnpm test` — `turbo run test`; Vitest runs as `vitest run` (never bare `vitest`, which watches)
- `pnpm build` — `turbo run build`
- `pnpm format` — Prettier
- Guards (local, via lefthook): `scripts/forbidden-words.sh` (voice) and
  `scripts/no-ai-attribution.sh` (provenance) run on pre-commit + commit-msg;
  pre-push runs `pnpm typecheck && pnpm test`.

See "Shell commands" below for the non-interactive rules every command must follow.

## Shell commands

Every shell command run in this repo must be non-interactive:

- Use `vitest run`, never bare `vitest` (bare form watches and blocks).
- Use `git --no-pager <cmd>` for any git command whose output can page (`log`, `diff`, `show`, etc.).
- Pass `--yes` / `-y` / `CI=1` on any command that might otherwise prompt for confirmation.
- No watch modes (`--watch`, dev servers left running in foreground, etc.) in this session.

## Style

- **TypeScript strict** everywhere.
- `packages/core` stays **framework-free** — plain types, zod schemas, rules.
- **zod at all edges** (API boundaries, tool I/O).
- **All human-facing copy derives from `docs/VOICE.md`** — never write user-facing
  strings from scratch; trace each line back to VOICE.md.

## TDD gate

- Write the **red test first**; see it fail, then make it green.
- red→green stays visible in history (the test lands with or before the code).
- **Coverage ≥ 80%** on `packages/core` + `apps/api` (enforced once CI lands).

## Commit rules

- **Conventional Commits**, atomic — one concern per commit.
- Imperative subject ≤ 72 chars; body explains **WHY + the tradeoff**.
- Flow: stage **explicit paths** → `git diff --cached --name-only` → show
  `git diff --cached` → commit. Lefthook guards run on commit.
- **No `Co-Authored-By` trailer** — the `commit-msg` guard
  (`scripts/no-ai-attribution.sh`) rejects tool-authorship trailers.

## Model / effort routing table

| Task                                          | Model                                        | Effort / mode                                                                                          |
|-----------------------------------------------|----------------------------------------------|--------------------------------------------------------------------------------------------------------|
| Architecture, ADRs, system design, planning   | Opus 4.8 (Fable 5 if available)              | xhigh–max + plan mode                                                                                   |
| Feature loops (core/api) + tests              | Sonnet 5 (default); Opus 4.8 for ADR-level   | high                                                                                                   |
| Large multi-file story sessions — Phase 2+ ONLY | Opus 4.8 (Fable 5 if available) + ultracode | xhigh — ONLY if every subagent change lands as an individually reviewed atomic commit; NEVER in Phase 0–1 |
| Doc prose / VOICE-governed copy               | Opus 4.8                                     | high                                                                                                   |
| Mechanical edits, renames, lockfiles, format  | Haiku 4.5                                    | low                                                                                                   |
| Quick Q&A / status                            | Haiku 4.5                                    | low–medium                                                                                             |

## VOICE.md

`docs/VOICE.md` is the single source of truth for all human-facing copy — README,
app strings, store listings, posts. Every derived line traces back to it.

## Definition of done

- Tests green: `pnpm typecheck && pnpm test`.
- Guards pass (voice + provenance).
- Docs / ADR updated when behavior or a decision changed.
- Diff shown before the commit.
- One atomic commit, Conventional format, WHY + tradeoff in the body.
