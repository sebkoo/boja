# System design — Boja (interview format, v0)

A system-design writeup in interview format: requirements, API, data model, the
request path, and the trade-offs already recorded as ADRs. v0 is a skeleton;
sections marked *(planned)* fill in as stories land. No performance numbers are
claimed until they are measured in this repo.

## 1. Problem

Turn a group intent ("dinner next week with A and B") into a confirmed plan:
propose three time+venue options → the user confirms one → emit a plan card plus
an `.ics` file. Nothing is sent automatically (ADR-0003). The v0 scope is
Story 01 (README).

## 2. Requirements

### Functional
- Parse free-text intent into structured form — `IntentSchema`
  (`packages/core/src/plan.ts`).
- Propose three options — `ProposalSchema` / `PlanOptionSchema`.
- Confirm one option into a `Plan` — `confirmPlan`.
- Emit a shareable plan card + `.ics`. *(tool planned — Layer 3)*

### Non-functional
- Trust: no outbound side effects without an explicit confirm (ADR-0003).
- Single-player useful; recipients need no account (ADR-0003).
- One maintainer: test-first, small surface (ADR-0001).
- *(TODO: latency / cost targets — set once the agent loop is measured)*

## 3. API (v0)

- `apps/api` on Fastify, zod at every edge (ADR-0001), assembled by `buildApp()`
  (`apps/api/src/app.ts`).
- Endpoints *(planned)*:
  - `POST /plans/propose` — intent → proposal (three options).
  - `POST /plans/confirm` — proposal + choice → plan + `.ics`.
- Today: a route stub only (`app.get(...)`); the story endpoints land with
  Story 01.

## 4. Data model

- Framework-free types in `packages/core/src/plan.ts`: `Participant`, `Venue`,
  `Intent`, `PlanOption`, `Proposal`, `Plan` — each a zod schema plus its
  inferred type.
- Persistence: none yet. Postgres + pgvector is the target; SQLite is the
  accepted interim (ADR-0001). *(schema / migrations planned)*

## 5. Request path

Reference the README flowchart; expand per story:
intent → gateway/cache → retrieval → agent loop → typed tools → trust gate →
plan card + `.ics`. Layer detail lives in `docs/ai-architecture.md`.

## 6. Trade-offs (recorded)

- Fastify over NestJS — keep the request path one function deep (ADR-0001).
- Expo + exactly one Swift module — prove StoreKit interop without widening the
  native surface (ADR-0001).
- MIT despite a paid app — the moat is the operated service, not the code
  (ADR-0002).
- Maestro for UI flows — black-box, low-maintenance at one maintainer (ADR-0005).

## 7. Open questions

*(TODO: rate limiting; auth model; multi-user plan sharing; eval harness shape)*

## Provenance

Traces to ADR-0001..0005, the `packages/core` types, `apps/api` `buildApp`, and
the README. Endpoints and numbers marked *(planned)* do not exist yet.
