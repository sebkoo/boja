import type { Intent, Proposal } from "@boja/core";

import type { Cache } from "./cache.js";
import type { Guardrail } from "./guardrails.js";
import type { VenueRetriever } from "./retrieval.js";
import type { ToolRegistry } from "./tools.js";

/** Everything a planner is allowed to touch — the loop's seams, made explicit. */
export interface PlannerContext {
  retriever: VenueRetriever;
  cache: Cache;
  tools: ToolRegistry;
  guardrails: readonly Guardrail[];
}

/**
 * The agent loop's contract: intent in, exactly-3-option proposal out
 * (ProposalSchema enforces the count). Proposing is the loop's whole
 * authority — confirmation stays with the user via @boja/core's confirmPlan
 * (ADR-0003's trust model).
 */
export interface Planner {
  propose(intent: Intent): Promise<Proposal>;
}
