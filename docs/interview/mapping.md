# Interview mapping

> Structure only. Each row pairs a real repo artifact with a plausible interview
> question and a 60-second answer *outline* — bullets, not prose — grounded in a
> recorded decision. Thin areas are marked (interface only) / (planned). No
> answer invents a fact, metric, or URL beyond what the ADRs, VOICE.md, or the
> tree already state.

| Repo artifact | Likely interview question | 60-second answer skeleton |
|---|---|---|
| `pnpm-workspace.yaml`, `turbo.json` (ADR-0001) | Why a monorepo at one-maintainer scale, and what does it cost? | • pnpm workspaces + Turborepo: apps/mobile, apps/api, packages/core, packages/ai (ADR-0001)<br>• keep domain / AI / payments seams separately testable; hold it in one head (ADR-0001)<br>• one turbo pipeline; task graph + cache<br>• cost: Expo + pnpm needs a hoisted node-linker + Metro config (ADR-0001)<br>• rejected Nx and a `packages/config` (ADR-0001) |
| `apps/api/src/app.ts` `buildApp` (ADR-0001) | Why Fastify over NestJS? | • request path one function deep — show the AI seams, don't hide them behind DI/decorators (ADR-0001)<br>• Fastify + zod type-provider; the plugin model is enough at this size<br>• NestJS earns its weight on large teams and runs on Fastify anyway (ADR-0001) |
| one Swift StoreKit module (ADR-0001); `apps/mobile` *(scaffolds next)* | Walk through StoreKit 2 receipt validation and server notifications. | • single native module = StoreKit 2 paywall / receipt bridge (ADR-0001)<br>• server notification + validation flow *(planned — not built)*<br>• verified with XCTest + StoreKitTest when it lands (ADR-0001, ADR-0005)<br>• (planned) |
| monetization: StoreKit now, Stripe later (README; ADR-0003) | How do you reconcile subscription state across StoreKit and Stripe? | • iOS via StoreKit 2 now; a web companion via Stripe later (README; ADR-0003)<br>• source-of-truth + reconciliation design *(planned)*<br>• (planned) |
| `VenueRetriever` (`packages/ai/src/retrieval.ts`); pgvector (ADR-0001) | Design the retrieval layer — embeddings, store, ranking. | • seam exists: `VenueRetriever` (retrieval.ts) — (interface only)<br>• pgvector embeddings of preferences + venue notes; RAG behind venue proposals (ADR-0001; README L1)<br>• store deferred until a story needs it; SQLite interim (ADR-0001)<br>• open: embedding model, note chunking (ai-architecture.md) |
| `Planner` (`packages/ai/src/agent.ts`); `runGuardrails` (`guardrails.ts`) | What breaks in an agent loop, and how do you contain it? | • loop: plan→act→observe, step budget, per-step checkpoint, no free-running autonomy (README L4) — (interface only)<br>• containment: trust gate — nothing outbound without explicit confirm (ADR-0003); guardrail runner (guardrails.ts)<br>• failure modes (budget exhaustion, bad tool output) + eval *(planned)* |
| `runGuardrails` (`guardrails.ts`); golden-set eval (README L5) | How do you stop an LLM feature from regressing in CI? | • golden-set eval blocks merge on regression (README L5) — (planned)<br>• guardrail runner exists (guardrails.ts); harness + CI lane (system-design.md; CI commit)<br>• no accuracy numbers claimed until the eval exists (ai-architecture.md) |
| `apps/api` `buildApp`; `packages/core` `confirmPlan` (ADR-0001) | How would you scale the plan service? | • stateless propose/confirm path → scale horizontally; framework-free core testable without booting (ADR-0001)<br>• semantic cache cuts model calls (`Cache`, cache.ts; README L2)<br>• persistence via Postgres + pgvector when a story needs it (ADR-0001)<br>• open: rate limiting, auth, multi-user sharing (system-design.md) — endpoints (planned) |

## Provenance

Every row cites an ADR, the README, VOICE.md, or a path/symbol in the tree.
Questions are plausible prompts, not transcripts; answer skeletons are outlines
of recorded decisions, with (interface only) / (planned) marking what is not
built yet.
