import { IntentSchema, type Intent } from "@boja/core";

/**
 * The text->Intent seam. Story 01 ships FixtureIntentParser (a deterministic
 * parse); a model-backed adapter swaps in behind this same async interface
 * later (the deferred LLM seam) without the planner changing.
 */
export interface IntentParser {
  parse(rawText: string): Promise<Intent>;
}

export interface FixtureIntentParserConfig {
  window: { earliest: string; latest: string };
}

/** Names after "with", split on comma / the word "and" / "&". */
function participantsFrom(rawText: string): { name: string }[] {
  const match = rawText.match(/\bwith\s+(.+)$/i);
  if (match === null) return [];
  return (match[1] ?? "")
    .split(/,|\band\b|&/i)
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .map((name) => ({ name }));
}

/**
 * Story 01's parser: a minimal deterministic bridge from a pasted line to a
 * structured Intent. No clock (the window is injected) and no inference, so the
 * demo runs end-to-end and reproducibly. IntentSchema.parse guards the shape.
 */
export class FixtureIntentParser implements IntentParser {
  constructor(private readonly config: FixtureIntentParserConfig) {}

  async parse(rawText: string): Promise<Intent> {
    const activity = rawText.trim().split(/\s+/)[0] ?? "";
    return IntentSchema.parse({
      rawText,
      activity,
      participants: participantsFrom(rawText),
      window: this.config.window,
    });
  }
}
