import { describe, expect, it } from "vitest";

import { IntentSchema } from "@boja/core";

import { FixtureIntentParser } from "./intent.js";

const demoWindow = { earliest: "2026-07-13T00:00:00+09:00", latest: "2026-07-19T23:59:59+09:00" };
const parser = new FixtureIntentParser({ window: demoWindow });

describe("FixtureIntentParser", () => {
  it("parses the demo paste into a structured Intent", async () => {
    expect(await parser.parse("dinner next week with Mina and Jae")).toEqual({
      rawText: "dinner next week with Mina and Jae",
      activity: "dinner",
      participants: [{ name: "Mina" }, { name: "Jae" }],
      window: demoWindow,
    });
  });

  it("produces an Intent that satisfies IntentSchema", async () => {
    const intent = await parser.parse("dinner next week with Mina and Jae");
    expect(IntentSchema.safeParse(intent).success).toBe(true);
  });

  it("extracts a comma-and-and participant list", async () => {
    const intent = await parser.parse("lunch next week with Mina, Jae and Sun");
    expect(intent.activity).toBe("lunch");
    expect(intent.participants).toEqual([{ name: "Mina" }, { name: "Jae" }, { name: "Sun" }]);
  });

  it("is deterministic for the same input", async () => {
    const text = "dinner next week with Mina and Jae";
    expect(await parser.parse(text)).toEqual(await parser.parse(text));
  });
});
