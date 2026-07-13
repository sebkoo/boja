import { describe, expect, it } from "vitest";

import { type Plan } from "./plan.js";
import { PlanCardSchema, toPlanCard } from "./card.js";

const plan: Plan = {
  title: "Dinner with Mina & Jae",
  start: "2026-07-14T19:00:00+09:00",
  end: "2026-07-14T21:00:00+09:00",
  venue: { name: "Onion Anguk", area: "Anguk" },
  participants: [{ name: "Mina" }, { name: "Jae" }],
};

describe("toPlanCard", () => {
  it("projects a confirmed plan into the card view-model", () => {
    expect(toPlanCard(plan)).toStrictEqual({
      title: "Dinner with Mina & Jae",
      who: "Mina & Jae",
      venueName: "Onion Anguk",
      venueArea: "Anguk",
      start: "2026-07-14T19:00:00+09:00",
      end: "2026-07-14T21:00:00+09:00",
    });
  });

  it("omits venueArea when the venue has none", () => {
    const noArea: Plan = { ...plan, venue: { name: "Onion Anguk" } };
    const card = toPlanCard(noArea);
    // toStrictEqual so an explicit `venueArea: undefined` would fail: the key must be absent.
    expect(card).toStrictEqual({
      title: "Dinner with Mina & Jae",
      who: "Mina & Jae",
      venueName: "Onion Anguk",
      start: "2026-07-14T19:00:00+09:00",
      end: "2026-07-14T21:00:00+09:00",
    });
    expect(card.venueArea).toBeUndefined();
  });

  it("formats who via nameList", () => {
    const three: Plan = {
      ...plan,
      participants: [{ name: "Mina" }, { name: "Jae" }, { name: "Sun" }],
    };
    expect(toPlanCard(three).who).toBe("Mina, Jae & Sun");
  });
});

describe("PlanCardSchema", () => {
  it("accepts a projected card", () => {
    expect(PlanCardSchema.safeParse(toPlanCard(plan)).success).toBe(true);
  });

  it("rejects a malformed card", () => {
    expect(PlanCardSchema.safeParse({ title: "x" }).success).toBe(false);
  });
});
