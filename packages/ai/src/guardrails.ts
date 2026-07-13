export type GuardrailVerdict = { ok: true } | { ok: false; reason: string };

/** A named check on text crossing a trust boundary — user input in, model output out. */
export interface Guardrail {
  name: string;
  check(text: string): Promise<GuardrailVerdict>;
}

/** Runs guardrails in order; the first failure wins and is attributed to its guardrail. */
export async function runGuardrails(
  guardrails: readonly Guardrail[],
  text: string,
): Promise<GuardrailVerdict> {
  for (const guardrail of guardrails) {
    const verdict = await guardrail.check(text);
    if (!verdict.ok) {
      return { ok: false, reason: `${guardrail.name}: ${verdict.reason}` };
    }
  }
  return { ok: true };
}
