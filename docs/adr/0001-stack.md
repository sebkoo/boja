# ADR-0001: Stack — pnpm/Turborepo monorepo, Expo RN + one Swift module, Fastify, Postgres+pgvector

- Date: 2026-07-12
- Status: accepted

## Context

Boja is an iOS-first product with a TypeScript backend and a deliberate native-iOS surface (StoreKit 2 subscriptions). The repo must stay small enough for one person to hold in their head, while keeping the seams — domain logic, AI layers, payments — separately visible and testable.

## Decision

- **Monorepo:** pnpm workspaces + Turborepo. Packages: `apps/mobile`, `apps/api`, `packages/core`, `packages/ai`.
- **Mobile:** React Native via Expo, TypeScript strict, with exactly **one** native Swift module: the StoreKit 2 paywall/receipt bridge. One artifact proves Swift, StoreKit 2, and RN interop together; more native code than that would dilute the point without adding capability the MVP needs.
- **API:** Node.js + TypeScript on **Fastify**, zod validation at every edge.
- **Domain:** `packages/core` is framework-free — plain types, zod schemas, and rules. This is where test-first development is most visible.
- **Data:** target Postgres + pgvector (preference/venue embeddings). Until a story needs persistence, no database ships — SQLite is the accepted interim if Phase 1 pressure demands one.
- **Tests:** Vitest for TS packages; XCTest for the Swift module when it lands; Maestro for UI flows (argued separately in ADR-0005).
- **Config:** root-level `tsconfig.base.json` / ESLint / Prettier, not a `packages/config` package — three workspaces don't justify the indirection.

## Alternatives considered

- **NestJS** instead of Fastify: rejected. NestJS earns its weight through DI, decorators, and module conventions that standardize large-team codebases. Here those same layers would hide exactly what this repo exists to show — explicit seams for retrieval, caching, tool-calling, the agent loop, and guardrails. Fastify keeps the request path one function deep, pairs with zod through its type-provider mechanism, and its plugin model is enough structure for an API this size. (NestJS also runs on top of Express or Fastify anyway; choosing the platform directly removes a layer I'd otherwise have to explain around.)
- **Bare React Native (no Expo):** rejected for now. Expo's managed workflow and `expo/metro-config` monorepo support cut setup cost sharply; the single Swift module is reachable via an Expo native module. If the StoreKit bridge hits a wall inside Expo's tooling, that's the trigger to revisit.
- **Nx** instead of Turborepo: rejected — heavier mental model and generator machinery; Turborepo's task graph + cache is the whole requirement.
- **ORM choice:** deferred until a story needs persistence; deciding now would be speculation.

## Consequences

- Easier: one `turbo` pipeline for lint/typecheck/test/build; core logic testable without booting anything; the five AI layers land as visible interfaces in `packages/ai`.
- Harder: Expo + pnpm requires the hoisted `node-linker` and Metro monorepo config; StoreKit testing needs a real device/simulator lane later.
- Revisit triggers: StoreKit bridge blocked by Expo tooling; API outgrowing a single service; embeddings needing a store before Postgres lands.
