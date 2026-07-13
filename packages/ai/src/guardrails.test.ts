import { describe, expect, it } from "vitest";

import { runGuardrails, type Guardrail } from "./guardrails.js";

function guardrail(name: string, ok: boolean, reason = "blocked"): Guardrail {
  return { name, check: async () => (ok ? { ok: true } : { ok: false, reason }) };
}

describe("runGuardrails", () => {
  it("passes when every guardrail passes", async () => {
    const verdict = await runGuardrails([guardrail("a", true), guardrail("b", true)], "text");
    expect(verdict).toEqual({ ok: true });
  });

  it("passes with no guardrails", async () => {
    expect(await runGuardrails([], "text")).toEqual({ ok: true });
  });

  it("fails on the first failing guardrail and names it", async () => {
    const verdict = await runGuardrails(
      [guardrail("a", true), guardrail("b", false, "too long"), guardrail("c", false)],
      "text",
    );
    expect(verdict).toEqual({ ok: false, reason: "b: too long" });
  });
});
