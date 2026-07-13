import { describe, expect, it } from "vitest";

import {
  InsufficientCandidatesError,
  ProposalSchema,
  type Intent,
  type Prefs,
  type Venue,
} from "@boja/core";

import { FixturePlanner, StepBudget, StepBudgetExceededError } from "./agent.js";
import { FixtureVenueRetriever } from "./retrieval.js";

const intent: Intent = {
  rawText: "dinner next week with Mina and Jae",
  activity: "dinner",
  participants: [{ name: "Mina" }, { name: "Jae" }],
  window: { earliest: "2026-07-13T00:00:00+09:00", latest: "2026-07-19T23:59:59+09:00" },
};

const store: readonly Venue[] = [
  { name: "Onion Anguk", area: "Anguk" },
  { name: "Nurichampen", area: "Seongsu" },
  { name: "Sinawi", area: "Anguk" },
  { name: "Mangwon Table", area: "Mangwon" },
];

const prefs: Prefs = { preferredAreas: [], preferredTimeOfDay: "evening", slotMinutes: 120 };

function planner(overrides: { store?: readonly Venue[]; stepBudget?: number } = {}): FixturePlanner {
  return new FixturePlanner({
    retriever: new FixtureVenueRetriever(overrides.store ?? store),
    prefs,
    stepBudget: overrides.stepBudget ?? 4,
  });
}

describe("FixturePlanner", () => {
  it("proposes a valid 3-option Proposal for the intent", async () => {
    const proposal = await planner().propose(intent);
    expect(ProposalSchema.safeParse(proposal).success).toBe(true);
    expect(proposal.options).toHaveLength(3);
    expect(proposal.intent).toEqual(intent);
  });

  it("composes the retriever then core.proposeOptions, preserving order", async () => {
    const proposal = await planner().propose(intent);
    expect(proposal.options.map((o) => o.venue.name)).toEqual([
      "Onion Anguk",
      "Nurichampen",
      "Sinawi",
    ]);
  });

  it("refuses to exceed the step budget (no free-running loop)", async () => {
    await expect(planner({ stepBudget: 1 }).propose(intent)).rejects.toThrow(
      StepBudgetExceededError,
    );
  });

  it("propagates InsufficientCandidatesError when the store has fewer than 3 venues", async () => {
    await expect(planner({ store: store.slice(0, 2) }).propose(intent)).rejects.toThrow(
      InsufficientCandidatesError,
    );
  });

  it("is deterministic across calls", async () => {
    const p = planner();
    expect(await p.propose(intent)).toEqual(await p.propose(intent));
  });
});

describe("StepBudget", () => {
  it("throws StepBudgetExceededError once the max is reached", () => {
    const budget = new StepBudget(2);
    budget.spend("a");
    budget.spend("b");
    expect(() => budget.spend("c")).toThrow(StepBudgetExceededError);
  });
});
