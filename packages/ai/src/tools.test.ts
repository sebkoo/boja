import { describe, expect, it } from "vitest";
import { z } from "zod";

import { ToolRegistry, type ToolDefinition } from "./tools.js";

const echo: ToolDefinition<{ text: string }, string> = {
  name: "echo",
  description: "returns its input",
  input: z.object({ text: z.string() }),
  execute: async ({ text }) => text,
};

describe("ToolRegistry", () => {
  it("registers and retrieves a tool", () => {
    const registry = new ToolRegistry();
    registry.register(echo);
    expect(registry.get("echo")).toBe(echo);
    expect(registry.names()).toEqual(["echo"]);
  });

  it("rejects a duplicate name", () => {
    const registry = new ToolRegistry();
    registry.register(echo);
    expect(() => registry.register(echo)).toThrow('tool "echo" is already registered');
  });

  it("returns undefined for an unknown tool", () => {
    expect(new ToolRegistry().get("nope")).toBeUndefined();
  });
});
