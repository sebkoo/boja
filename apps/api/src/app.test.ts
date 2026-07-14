import { describe, expect, it } from "vitest";

import { buildApp } from "./app.js";
import { FIXTURE_VENUES } from "./fixtures/venues.js";

describe("GET /health", () => {
  it("returns ok", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ status: "ok" });
  });
});

describe("buildApp injectable opts", () => {
  it("decorates the default fixture venues", () => {
    const app = buildApp();
    expect(app.venues).toEqual(FIXTURE_VENUES);
  });

  it("decorates a default no-op outbound sink", async () => {
    const app = buildApp();
    await expect(
      app.outboundSink.send({ kind: "ics", confirmed: true }),
    ).resolves.toBeUndefined();
  });

  it("uses injected venues over the default", () => {
    const customVenues = [
      { name: "Test Venue A", area: "Test" },
      { name: "Test Venue B", area: "Test" },
    ];
    const app = buildApp({ venues: customVenues });
    expect(app.venues).toBe(customVenues);
  });

  it("uses the injected outbound sink over the default", async () => {
    const calls: unknown[] = [];
    const spySink = {
      send: async (action: unknown) => {
        calls.push(action);
      },
    };
    const app = buildApp({ outbound: spySink });
    expect(app.outboundSink).toBe(spySink);
    await app.outboundSink.send({ kind: "ics", confirmed: true });
    expect(calls).toEqual([{ kind: "ics", confirmed: true }]);
  });
});
