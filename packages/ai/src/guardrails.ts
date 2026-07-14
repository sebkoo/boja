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

/** An attempt to send something out of the app (an `.ics`, a share card). */
export interface OutboundAction {
  kind: string;
  confirmed: boolean;
}

/** The single exit for outbound actions; Story 01 wires it to a no-op / spy. */
export interface OutboundSink {
  send(action: OutboundAction): Promise<void>;
}

/**
 * The trust boundary (ADR-0003): nothing goes outbound without an explicit
 * confirm — the user stays the sender. Complementary to runGuardrails' text
 * checks; this gate is on confirm state, not content.
 */
export function guardOutbound(action: OutboundAction): GuardrailVerdict {
  if (!action.confirmed) {
    return { ok: false, reason: `outbound "${action.kind}" blocked: awaiting an explicit confirm` };
  }
  return { ok: true };
}

/** Send through the sink only when the gate allows it; otherwise the sink is never touched. */
export async function sendOutbound(
  sink: OutboundSink,
  action: OutboundAction,
): Promise<GuardrailVerdict> {
  const verdict = guardOutbound(action);
  if (verdict.ok) {
    await sink.send(action);
  }
  return verdict;
}
