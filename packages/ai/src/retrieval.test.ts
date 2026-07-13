import { describe, expect, it } from "vitest";

import type { Intent, Venue } from "@boja/core";

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

describe("FixtureVenueRetriever", () => {
  it("returns the curated store in stable ranked order", async () => {
    const retriever = new FixtureVenueRetriever(store);
    const venues = await retriever.retrieve(intent, 10);
    expect(venues.map((v) => v.name)).toEqual([
      "Onion Anguk",
      "Nurichampen",
      "Sinawi",
      "Mangwon Table",
    ]);
  });

  it("respects the limit", async () => {
    const retriever = new FixtureVenueRetriever(store);
    const venues = await retriever.retrieve(intent, 2);
    expect(venues).toHaveLength(2);
    expect(venues.map((v) => v.name)).toEqual(["Onion Anguk", "Nurichampen"]);
  });

  it("returns all when the store is smaller than the limit", async () => {
    const retriever = new FixtureVenueRetriever(store.slice(0, 2));
    const venues = await retriever.retrieve(intent, 3);
    expect(venues).toHaveLength(2);
  });

  it("is deterministic for the same intent", async () => {
    const retriever = new FixtureVenueRetriever(store);
    expect(await retriever.retrieve(intent, 3)).toEqual(await retriever.retrieve(intent, 3));
  });

  it("returns a fresh array that does not leak the internal store", async () => {
    const retriever = new FixtureVenueRetriever(store);
    const first = await retriever.retrieve(intent, 4);
    first.pop();
    expect(await retriever.retrieve(intent, 4)).toHaveLength(4);
  });
});
