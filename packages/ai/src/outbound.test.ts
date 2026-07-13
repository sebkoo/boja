import { describe, expect, it } from "vitest";

import {
  guardOutbound,
  sendOutbound,
  type OutboundAction,
  type OutboundSink,
} from "./guardrails.js";

function makeSink(): { sink: OutboundSink; sent: OutboundAction[] } {
  const sent: OutboundAction[] = [];
  const sink: OutboundSink = {
    send: (action) => {
      sent.push(action);
      return Promise.resolve();
    },
  };
  return { sink, sent };
}

describe("guardOutbound", () => {
  it("blocks an unconfirmed action and attributes it to the trust gate", () => {
    expect(guardOutbound({ kind: "share-card", confirmed: false })).toEqual({
      ok: false,
      reason: expect.stringContaining("confirm"),
    });
  });

  it("allows a confirmed action", () => {
    expect(guardOutbound({ kind: "ics", confirmed: true })).toEqual({ ok: true });
  });
});

describe("sendOutbound", () => {
  it("sends nothing through the sink without an explicit confirm (assert no outbound)", async () => {
    const { sink, sent } = makeSink();
    const verdict = await sendOutbound(sink, { kind: "ics", confirmed: false });
    expect(verdict.ok).toBe(false);
    expect(sent).toHaveLength(0);
  });

  it("passes exactly the one confirmed action to the sink", async () => {
    const { sink, sent } = makeSink();
    const action: OutboundAction = { kind: "ics", confirmed: true };
    const verdict = await sendOutbound(sink, action);
    expect(verdict.ok).toBe(true);
    expect(sent).toEqual([action]);
  });
});
