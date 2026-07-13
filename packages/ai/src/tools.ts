import type { z } from "zod";

/** One capability the agent may call; `input` is the contract the model must satisfy. */
export interface ToolDefinition<Input = unknown, Output = unknown> {
  name: string;
  description: string;
  input: z.ZodType<Input>;
  execute(input: Input): Promise<Output>;
}

// The registry stores tools type-erased; call sites re-validate through each tool's own schema.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyTool = ToolDefinition<any, any>;

export class ToolRegistry {
  private readonly tools = new Map<string, AnyTool>();

  register(tool: AnyTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`tool "${tool.name}" is already registered`);
    }
    this.tools.set(tool.name, tool);
  }

  get(name: string): AnyTool | undefined {
    return this.tools.get(name);
  }

  names(): string[] {
    return [...this.tools.keys()];
  }
}
