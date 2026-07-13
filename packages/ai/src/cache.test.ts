import { describe, expect, it } from "vitest";

import { InMemoryCache } from "./cache.js";

function cacheWithClock(startMs = 0) {
  let nowMs = startMs;
  const cache = new InMemoryCache(() => nowMs);
  return { cache, advance: (ms: number) => (nowMs += ms) };
}

describe("InMemoryCache", () => {
  it("round-trips a value", async () => {
    const { cache } = cacheWithClock();
    await cache.set("k", { venues: 3 });
    expect(await cache.get("k")).toEqual({ venues: 3 });
  });

  it("returns undefined for a missing key", async () => {
    const { cache } = cacheWithClock();
    expect(await cache.get("missing")).toBeUndefined();
  });

  it("expires a value after its TTL", async () => {
    const { cache, advance } = cacheWithClock();
    await cache.set("k", "v", 1000);
    advance(999);
    expect(await cache.get("k")).toBe("v");
    advance(1);
    expect(await cache.get("k")).toBeUndefined();
  });

  it("keeps a value without TTL forever", async () => {
    const { cache, advance } = cacheWithClock();
    await cache.set("k", "v");
    advance(Number.MAX_SAFE_INTEGER);
    expect(await cache.get("k")).toBe("v");
  });

  it("deletes a value", async () => {
    const { cache } = cacheWithClock();
    await cache.set("k", "v");
    await cache.delete("k");
    expect(await cache.get("k")).toBeUndefined();
  });
});
