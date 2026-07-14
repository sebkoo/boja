import { describe, expect, it } from "vitest";

import { buildApp } from "../app.js";
import { FIXTURE_VENUES } from "../fixtures/venues.js";

const validIntent = {
  rawText: "dinner next week with Mina and Jae",
  activity: "dinner",
  participants: [{ name: "Mina" }, { name: "Jae" }],
  window: { earliest: "2026-07-13T00:00:00+09:00", latest: "2026-07-19T23:59:59+09:00" },
};

describe("POST /plans/propose", () => {
  it("returns 200 with exactly 3 options for a valid intent", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "POST", url: "/plans/propose", payload: validIntent });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.options).toHaveLength(3);
    expect(body.intent).toEqual(validIntent);
  });

  it("returns 400 for an intent with empty participants", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/plans/propose",
      payload: { ...validIntent, participants: [] },
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 for a flipped window (earliest after latest)", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/plans/propose",
      payload: {
        ...validIntent,
        window: { earliest: "2026-07-19T23:59:59+09:00", latest: "2026-07-13T00:00:00+09:00" },
      },
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 for a non-ISO datetime in the window", async () => {
    const app = buildApp();
    const res = await app.inject({
      method: "POST",
      url: "/plans/propose",
      payload: {
        ...validIntent,
        window: { earliest: "not-a-date", latest: "2026-07-19T23:59:59+09:00" },
      },
    });
    expect(res.statusCode).toBe(400);
  });

  it("carries options only -- no card, no ics, nothing outbound pre-confirm", async () => {
    const app = buildApp();
    const res = await app.inject({ method: "POST", url: "/plans/propose", payload: validIntent });
    const body = res.json();
    expect(Object.keys(body).sort()).toEqual(["intent", "options"]);
    expect(body.card).toBeUndefined();
    expect(body.ics).toBeUndefined();
  });

  it("returns 422 when the venue store has fewer than 3 candidates", async () => {
    const app = buildApp({ venues: FIXTURE_VENUES.slice(0, 2) });
    const res = await app.inject({ method: "POST", url: "/plans/propose", payload: validIntent });
    expect(res.statusCode).toBe(422);
  });
});
