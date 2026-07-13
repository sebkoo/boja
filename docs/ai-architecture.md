# AI architecture

The long form of the five-layer table in the README. Each layer below names the
seam that already exists in `packages/ai/src/` or marks the work as planned.

Status: interfaces-first. The seams exist as TypeScript interfaces plus thin
implementations; most behavior lands per story (the Story 01 end-to-end demo is
the kill criterion in ADR-0003).

## Overview

The request path, layer by layer, is the flowchart in the README:
intent → gateway/cache → retrieval → agent loop → typed tools → trust gate →
plan card + `.ics`.

## Layer 1 — Retrieval

- Seam: `VenueRetriever` (`packages/ai/src/retrieval.ts`).
- Plan: pgvector embeddings of preferences + venue notes; RAG behind venue
  proposals. The store is deferred until a story needs persistence (ADR-0001).
- Status: interface defined; embedding + store *planned*.
- Open: *(TODO: embedding model; how venue notes are chunked)*.

## Layer 2 — Efficiency

- Seam: `Cache` / `InMemoryCache` (`packages/ai/src/cache.ts`).
- Plan: one AI gateway; semantic cache on normalized intents; small-model parse
  → large-model plan; per-request token/cost log.
- Status: in-memory cache implemented; semantic keying + gateway *planned*.
- Open: *(TODO: cache-key normalization; the model routing table)*.

## Layer 3 — Action

- Seam: `ToolDefinition` / `ToolRegistry` (`packages/ai/src/tools.ts`).
- Plan: typed tool-calling — `.ics` generation, venue lookup, share-card render;
  MCP-compatible definitions.
- Status: registry + typed definitions implemented; concrete tools *planned*.

## Layer 4 — Agent

- Seam: `Planner` / `PlannerContext` (`packages/ai/src/agent.ts`).
- Plan: one plan→act→observe loop, step budget, per-step checkpoint, session
  memory in Postgres; no free-running autonomy.
- Status: planner interface defined; loop + memory *planned*.

## Layer 5 — Trust

- Seam: `Guardrail` / `runGuardrails` (`packages/ai/src/guardrails.ts`).
- Plan: nothing outbound without an explicit confirm (ADR-0003); PII redaction
  in logs; tracing; a golden-set eval that blocks merge on regression.
- Status: guardrail runner implemented; redaction, tracing, eval *planned*.
- The explicit-confirm boundary is the product wedge, not a feature toggle
  (ADR-0003; README "What it does").

## Evaluation

*(planned)* A golden-set eval gating merges — see `docs/system-design.md` and
the CI commit. No accuracy or latency numbers are claimed until the eval exists.

## Provenance

Traces to ADR-0001 (stack, data), ADR-0003 (trust wedge), the README five-layer
table, and the interfaces in `packages/ai/src/`. Anything marked *planned* or
*TODO* does not exist yet.
