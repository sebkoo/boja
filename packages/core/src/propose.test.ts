import { describe, expect, it } from "vitest";

import { PlanOptionSchema, type Intent, type Venue } from "./plan.js";
import { InsufficientCandidatesError, PrefsSchema, proposeOptions, type Prefs } from "./propose.js";

const intent: Intent = {
  rawText: "dinner next week with Mina and Jae",
  activity: "dinner",
  participants: [{ name: "Mina" }, { name: "Jae" }],
  window: { earliest: "2026-07-13T00:00:00+09:00", latest: "2026-07-19T23:59:59+09:00" },
};

function venue(name: string, area: string): Venue {
  return { name, area };
}

// The retriever (Layer 1) has already applied relevance; proposeOptions must
// preserve this order and only compose venue + slot (ADR-0003 / plan pins).
const ranked: readonly Venue[] = [
  venue("Onion Anguk", "Anguk"),
  venue("Nurichampen", "Seongsu"),
  venue("Sinawi", "Anguk"),
  venue("Mangwon Table", "Mangwon"),
];

// Three Anguk venues so a hard area filter can still yield 3 candidates.
const rankedAnguk3: readonly Venue[] = [
  venue("Onion Anguk", "Anguk"),
  venue("Nurichampen", "Seongsu"),
  venue("Sinawi", "Anguk"),
  venue("Mangwon Table", "Mangwon"),
  venue("Cheongsudang", "Anguk"),
];

const eveningNoFilter: Prefs = { preferredAreas: [], preferredTimeOfDay: "evening", slotMinutes: 120 };

describe("proposeOptions", () => {
  it("returns exactly 3 valid options from 3+ ranked venues", () => {
    const options = proposeOptions(intent, ranked, eveningNoFilter);
    expect(options).toHaveLength(3);
    expect(options.every((o) => PlanOptionSchema.safeParse(o).success)).toBe(true);
  });

  it("is deterministic — same input yields identical options, order included", () => {
    expect(proposeOptions(intent, ranked, eveningNoFilter)).toEqual(
      proposeOptions(intent, ranked, eveningNoFilter),
    );
  });

  it("preserves the retriever's order — does not re-rank by relevance", () => {
    const options = proposeOptions(intent, ranked, eveningNoFilter);
    expect(options.map((o) => o.venue.name)).toEqual(["Onion Anguk", "Nurichampen", "Sinawi"]);
  });

  it("pairs every option with the earliest qualifying slot; options share the slot, differ by venue", () => {
    const options = proposeOptions(intent, ranked, eveningNoFilter);
    // The earliest evening slot in the window: first window day at 19:00 KST, +120min.
    // Offset derived from window.earliest assumes a fixed-offset zone (true for KST; revisit for DST regions).
    expect(options.map((o) => o.start)).toEqual([
      "2026-07-13T19:00:00+09:00",
      "2026-07-13T19:00:00+09:00",
      "2026-07-13T19:00:00+09:00",
    ]);
    expect(options.map((o) => o.end)).toEqual([
      "2026-07-13T21:00:00+09:00",
      "2026-07-13T21:00:00+09:00",
      "2026-07-13T21:00:00+09:00",
    ]);
    expect(new Set(options.map((o) => o.venue.name)).size).toBe(3);
  });

  it("resolves preferredTimeOfDay to a fixed hour (morning → 09:00)", () => {
    const options = proposeOptions(intent, ranked, {
      preferredAreas: [],
      preferredTimeOfDay: "morning",
      slotMinutes: 120,
    });
    expect(options[0]?.start).toBe("2026-07-13T09:00:00+09:00");
    expect(options[0]?.end).toBe("2026-07-13T11:00:00+09:00");
  });

  it("advances to the next window day when earliest is past the slot hour", () => {
    const lateOpen: Intent = {
      ...intent,
      window: { earliest: "2026-07-13T20:00:00+09:00", latest: "2026-07-19T23:59:59+09:00" },
    };
    const options = proposeOptions(lateOpen, ranked, eveningNoFilter);
    // 19:00 on the 13th is before the 20:00 window open, so the slot rolls to the 14th.
    expect(options[0]?.start).toBe("2026-07-14T19:00:00+09:00");
    expect(options[0]?.end).toBe("2026-07-14T21:00:00+09:00");
  });

  it("hard-filters by preferredAreas, preserving order", () => {
    const options = proposeOptions(intent, rankedAnguk3, {
      preferredAreas: ["Anguk"],
      preferredTimeOfDay: "evening",
      slotMinutes: 120,
    });
    expect(options.map((o) => o.venue.name)).toEqual(["Onion Anguk", "Sinawi", "Cheongsudang"]);
  });

  it("applies no area filter when preferredAreas is empty", () => {
    const options = proposeOptions(intent, rankedAnguk3, eveningNoFilter);
    expect(options.map((o) => o.venue.name)).toEqual(["Onion Anguk", "Nurichampen", "Sinawi"]);
  });

  it("throws InsufficientCandidatesError below 3 distinct candidate venues", () => {
    // Only 2 venues at all.
    expect(() => proposeOptions(intent, ranked.slice(0, 2), eveningNoFilter)).toThrow(
      InsufficientCandidatesError,
    );
    // 4 venues, but the area filter leaves only 2 (Onion Anguk, Sinawi).
    expect(() =>
      proposeOptions(intent, ranked, {
        preferredAreas: ["Anguk"],
        preferredTimeOfDay: "evening",
        slotMinutes: 120,
      }),
    ).toThrow(InsufficientCandidatesError);
  });

  it("accepts exactly 3 candidate venues (boundary)", () => {
    expect(proposeOptions(intent, ranked.slice(0, 3), eveningNoFilter)).toHaveLength(3);
  });
});

describe("PrefsSchema", () => {
  it("accepts a well-formed prefs object", () => {
    expect(PrefsSchema.safeParse(eveningNoFilter).success).toBe(true);
  });

  it("rejects an unknown time-of-day", () => {
    expect(
      PrefsSchema.safeParse({ preferredAreas: [], preferredTimeOfDay: "midnight", slotMinutes: 120 })
        .success,
    ).toBe(false);
  });

  it.each([
    ["zero", 0],
    ["negative", -30],
    ["fractional", 90.5],
  ])("rejects a %s slotMinutes", (_label, slotMinutes) => {
    expect(
      PrefsSchema.safeParse({ preferredAreas: [], preferredTimeOfDay: "evening", slotMinutes })
        .success,
    ).toBe(false);
  });
});
