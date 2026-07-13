import { describe, expect, it } from "vitest";

import {
  IntentSchema,
  PlanOptionSchema,
  ProposalSchema,
  confirmPlan,
  nameList,
  planTitle,
  type Intent,
  type PlanOption,
  type Proposal,
} from "./plan.js";

const intent: Intent = {
  rawText: "dinner next week with Mina and Jae",
  activity: "dinner",
  participants: [{ name: "Mina" }, { name: "Jae" }],
  window: { earliest: "2026-07-13T00:00:00+09:00", latest: "2026-07-19T23:59:59+09:00" },
};

function option(day: number): PlanOption {
  return {
    start: `2026-07-${String(day).padStart(2, "0")}T19:00:00+09:00`,
    end: `2026-07-${String(day).padStart(2, "0")}T21:00:00+09:00`,
    venue: { name: "Onion Anguk", area: "Anguk" },
    rationale: "quiet enough to talk, near both",
  };
}

const proposal: Proposal = { intent, options: [option(14), option(16), option(18)] };

describe("IntentSchema", () => {
  it("accepts a structured intent", () => {
    expect(IntentSchema.parse(intent)).toEqual(intent);
  });

  it("rejects an empty participant list", () => {
    expect(IntentSchema.safeParse({ ...intent, participants: [] }).success).toBe(false);
  });

  it("rejects a window that ends before it starts", () => {
    const flipped = { ...intent, window: { earliest: intent.window.latest, latest: intent.window.earliest } };
    expect(IntentSchema.safeParse(flipped).success).toBe(false);
  });
});

describe("PlanOptionSchema", () => {
  it("rejects an option whose end is not after its start", () => {
    expect(PlanOptionSchema.safeParse({ ...option(14), end: option(14).start }).success).toBe(false);
  });

  it("rejects a non-ISO datetime", () => {
    expect(PlanOptionSchema.safeParse({ ...option(14), start: "next tuesday" }).success).toBe(false);
  });
});

describe("ProposalSchema", () => {
  it("accepts exactly 3 options", () => {
    expect(ProposalSchema.safeParse(proposal).success).toBe(true);
  });

  it("rejects 2 or 4 options — ADR-0003 says exactly 3", () => {
    expect(ProposalSchema.safeParse({ intent, options: proposal.options.slice(0, 2) }).success).toBe(false);
    expect(ProposalSchema.safeParse({ intent, options: [...proposal.options, option(19)] }).success).toBe(false);
  });
});

describe("nameList", () => {
  it.each([
    [["Mina"], "Mina"],
    [["Mina", "Jae"], "Mina & Jae"],
    [["Mina", "Jae", "Sun"], "Mina, Jae & Sun"],
  ])("%j → %s", (names, expected) => {
    expect(nameList(names)).toBe(expected);
  });

  it("returns an empty string for no names", () => {
    expect(nameList([])).toBe("");
  });
});

describe("confirmPlan", () => {
  it("turns the chosen option into a plan", () => {
    const plan = confirmPlan(proposal, 1);
    expect(plan).toEqual({
      title: "Dinner with Mina & Jae",
      start: proposal.options[1]?.start,
      end: proposal.options[1]?.end,
      venue: proposal.options[1]?.venue,
      participants: intent.participants,
    });
  });

  it("throws RangeError for an index with no option", () => {
    expect(() => confirmPlan(proposal, 3)).toThrow(RangeError);
  });
});

describe("planTitle", () => {
  it("capitalizes the activity", () => {
    expect(planTitle(intent)).toBe("Dinner with Mina & Jae");
  });

  it("leaves Hangul activities untouched", () => {
    expect(planTitle({ ...intent, activity: "저녁" })).toBe("저녁 with Mina & Jae");
  });
});
