import {
  proposeOptions,
  ProposalSchema,
  type Intent,
  type Prefs,
  type Proposal,
} from "@boja/core";

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

const DEFAULT_VENUE_LIMIT = 12;

/** Thrown when the plan->act loop would exceed its step budget (no free-running autonomy). */
export class StepBudgetExceededError extends Error {
  constructor(
    readonly step: string,
    readonly max: number,
  ) {
    super(`step "${step}" exceeds the budget of ${max}`);
    this.name = "StepBudgetExceededError";
  }
}

/** A per-run step counter — the Layer-4 loop must spend within an explicit budget. */
export class StepBudget {
  private used = 0;
  constructor(readonly max: number) {}

  spend(step: string): void {
    if (this.used >= this.max) throw new StepBudgetExceededError(step, this.max);
    this.used += 1;
  }
}

export interface FixturePlannerConfig {
  retriever: VenueRetriever;
  prefs: Prefs;
  stepBudget: number;
  venueLimit?: number;
}

/**
 * Story 01's planner: a bounded retrieve->plan loop with no live inference.
 * Retrieval (Layer 1) then core.proposeOptions (deterministic ranking) inside a
 * fresh StepBudget per call; the Model/LLM seam stays interface-only until a
 * story needs it (ADR-0005 / YAGNI).
 */
export class FixturePlanner implements Planner {
  constructor(private readonly config: FixturePlannerConfig) {}

  async propose(intent: Intent): Promise<Proposal> {
    const budget = new StepBudget(this.config.stepBudget);

    budget.spend("retrieve");
    const venues = await this.config.retriever.retrieve(
      intent,
      this.config.venueLimit ?? DEFAULT_VENUE_LIMIT,
    );

    budget.spend("plan");
    const options = proposeOptions(intent, venues, this.config.prefs);

    return ProposalSchema.parse({ intent, options });
  }
}
