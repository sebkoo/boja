# Boja (보자)

**Boja (보자 — "let's hang out") — the AI concierge that turns it into a real plan.**
React Native · Swift / StoreKit 2 · Node.js / TypeScript

> 30-second demo — *ships with Story 01.*

## Why this exists

I've met many people who started as good companions but passed by as strangers quite quickly. Boja is my answer to that — a way to overcome loneliness in crowds, and all the meaningless, empty promises in social media DMs. I'm building it for myself first.

The name is plain Korean: 언제 한번 보자, "let's hang out sometime." This product exists to turn that one sentence into a plan that actually happens.

## What it does — MVP (Story 01)

You paste a group intent — "dinner next week with A and B." Boja proposes three time-and-venue options from your saved preferences and venue notes; you confirm one; it produces a shareable plan card plus a `.ics` calendar file. Nothing is sent to anyone automatically — confirmation stays with you. That is a deliberate trust boundary, not a missing feature.

## Architecture

Monorepo — pnpm workspaces + Turborepo. Four workspaces, a thin MVP slice:

- `apps/mobile` — React Native (Expo, strict TypeScript) with exactly one native Swift module: the StoreKit 2 paywall / receipt bridge. *(scaffolds next — ADR-0001)*
- `apps/api` — Node.js + TypeScript on Fastify, zod at every edge.
- `packages/core` — framework-free domain logic (Plan / Preference types, scheduling rules, zod schemas). Test-first lives here.
- `packages/ai` — the five AI layers as explicit seams (interfaces first; thin slices per story).

Present in the tree today: `apps/api`, `packages/core`, `packages/ai`. `apps/mobile` and the AI slices arrive in later commits.

```mermaid
flowchart LR
  intent["group intent (text)"] --> gw["AI gateway<br/>router + semantic cache"]
  gw --> rag["retrieval<br/>pgvector: prefs + venues"]
  rag --> loop["agent loop<br/>plan -> act -> observe"]
  loop --> tools["typed tools<br/>.ics · venue · share card"]
  tools --> trust["trust gate<br/>explicit user confirm"]
  trust --> card["plan card + .ics"]
```

| Layer | How this repo implements it |
|---|---|
| 1.&nbsp;Retrieval | pgvector embeddings of preferences + venue notes; RAG behind venue proposals |
| 2.&nbsp;Efficiency | one AI gateway; semantic cache on normalized intents; small-model parse → large-model plan; per-request token/cost log |
| 3.&nbsp;Action | typed tool-calling: `.ics` generation, venue lookup, share-card render; MCP-compatible definitions |
| 4.&nbsp;Agent | one plan→act→observe loop, step budget, per-step checkpoint, session memory in Postgres; no free-running autonomy |
| 5.&nbsp;Trust | nothing outbound without explicit confirm; PII redaction in logs; tracing; a golden-set eval that blocks merge on regression |

Full write-up: [`docs/ai-architecture.md`](docs/ai-architecture.md).

## Quickstart

Prerequisites: Node ≥ 22, pnpm 10.13 (`corepack enable pnpm`).

```
pnpm install
pnpm typecheck
pnpm test
pnpm build
```

## Engineering

<!-- CI badge is live; the coverage badge stays pending until a reporter is wired -->
[![CI](https://github.com/sebkoo/boja/actions/workflows/ci.yml/badge.svg)](https://github.com/sebkoo/boja/actions/workflows/ci.yml)
![coverage pending](https://img.shields.io/badge/coverage-pending-lightgrey)
![license MIT](https://img.shields.io/badge/license-MIT-blue)

- **Test-first.** Every behavior lands with its test first; red→green is visible in history. Vitest for TypeScript; XCTest for the Swift module (its phase); Maestro for UI flows.
- **Commit guards (local, lefthook).** Pre-commit + commit-msg run a voice check (`scripts/forbidden-words.sh`, derived from `docs/VOICE.md`) and an authorship-provenance check (`scripts/no-ai-attribution.sh`). Pre-push runs `pnpm typecheck && pnpm test`.
- **Coverage gate ≥ 80%** on `packages/core` + `apps/api` — arrives with CI.
- **ADRs** — decisions recorded, not assumed:
  - [ADR-0001](docs/adr/0001-stack.md) — stack
  - [ADR-0002](docs/adr/0002-license.md) — license (MIT)
  - [ADR-0003](docs/adr/0003-concept-selection.md) — concept selection
  - [ADR-0004](docs/adr/0004-naming.md) — naming
  - [ADR-0005](docs/adr/0005-ui-testing.md) — UI testing

### Human-owned, AI-assisted

I build this repo with AI coding agents, but the process is enforced by the
repo, not by good intentions:

- **Prompt engineering** — the agent's instructions are versioned, not
  improvised. [`CLAUDE.md`](CLAUDE.md)'s routing table pins the model and
  reasoning effort to each task — planning at high effort in plan mode,
  mechanical edits low — and the [`.claude/commands/`](.claude/commands) are
  reusable, named prompts, not ad-hoc asks.
- **Context engineering** — the durable context the agent works from lives in
  the repo: [`CLAUDE.md`](CLAUDE.md) (the rules, the TDD and commit gates),
  [`docs/VOICE.md`](docs/VOICE.md) (the source for every user-facing line), and
  the ADRs (each decision, with its tradeoff). Same project, every session.
- **Harness engineering** — a scaffold rejects bad output by machine, not by
  trust: the test-first gate, two lefthook guards (`forbidden-words.sh` for
  voice, `no-ai-attribution.sh` for provenance), `pnpm typecheck && pnpm test`
  on pre-push, and the CI gates (lint → typecheck → test → coverage → build).
  Break the voice, drop provenance, or fail a gate and the change never lands.
- **Loop engineering** — one iteration is a fixed cycle: `/story` (plan, tests
  first) → `/green` (typecheck + tests pass) → `/ship` (stage explicit paths,
  review the diff, commit) → `/adr` (record a decision). Small steps, each
  closed before the next.
- **The invariant is human ownership**: I read every diff before it commits —
  the history is atomic, one concern each, with the reasoning in the body.

The claim isn't "an agent wrote code." It's that the guardrails, the atomic
history, and per-diff review make AI-assisted work as verifiable as a test
makes a behavior verifiable.

## User stories

| # | Story | Status | Test | Media |
|---|---|---|---|---|
| 01 | paste intent → 3 options → confirm → plan card + `.ics` | planned | — | *ships with Story 01* |

## Progress

**Now** — Story 01: paste intent → three options → confirm → plan card + `.ics`.
**Done** — Phase 1 (scaffolding, docs, harness, CI); Story 01 domain rules in `packages/core` and AI seams in `packages/ai`.
**Next** — the Fastify plan endpoints in `apps/api`, then the Expo screen and Maestro flow in `apps/mobile`; then the StoreKit 2 paywall, pgvector retrieval, and evals in CI.

Story 01: core ✅✅✅ · ai ✅✅✅✅ · api ◻◻◻ · mobile ◻◻◻◻◻

- **core** — `proposeOptions` · `toIcs` · `toPlanCard`
- **ai** — `FixtureVenueRetriever` · `FixturePlanner` / `StepBudget` · outbound gate · `FixtureIntentParser`
- **api** — `buildApp` wiring · `POST /plans/propose` · `POST /plans/confirm`
- **mobile** — `PlannerPort` · `PlanScreen` · render test · Maestro flow · i18n copy

A check lands only after its commits are on `main`. Tracked in the ADRs and [`docs/system-design.md`](docs/system-design.md).

```mermaid
flowchart LR
  P1["Phase 1: scaffolding, CI"]:::done
  S1["Story 01: core, ai, api, mobile"]:::current
  S2["Story 02+"]:::planned
  P1 --> S1 --> S2
  classDef done fill:#1a7f37,stroke:#116329,color:#ffffff
  classDef current fill:#0969da,stroke:#0a3069,color:#ffffff
  classDef planned fill:#8b949e,stroke:#6e7681,color:#ffffff
```

## Monetization

Free tier: one active plan. Pro subscription: unlimited plans, reminders, preference memory. iOS via StoreKit 2; a web companion via Stripe later. Pricing hypotheses and funnel events are recorded in [`docs/monetization.md`](docs/monetization.md); region and price point are pre-launch hypotheses there, to be validated.

## Contributing

Contribution guide and seeded good-first-issues are *planned*. All human-facing copy derives from `docs/VOICE.md`.

## License

MIT © Ben Koo. See [LICENSE](LICENSE).
