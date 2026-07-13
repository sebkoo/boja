import { describe, expect, it } from "vitest";

import { type Plan } from "./plan.js";
import { toIcs } from "./ics.js";

const plan: Plan = {
  title: "Dinner with Mina & Jae",
  start: "2026-07-14T19:00:00+09:00",
  end: "2026-07-14T21:00:00+09:00",
  venue: { name: "Onion Anguk", area: "Anguk" },
  participants: [{ name: "Mina" }, { name: "Jae" }],
};

const fixedOpts = { uid: "evt-1@boja.app", dtstamp: "20260713T090000Z" };

describe("toIcs", () => {
  it("wraps a single VEVENT in a VCALENDAR", () => {
    const ics = toIcs(plan, fixedOpts);
    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toMatch(/PRODID:.*Boja/);
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(1);
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("emits UID/DTSTAMP/DTSTART/DTEND, with injected uid and dtstamp verbatim", () => {
    const ics = toIcs(plan, fixedOpts);
    expect(ics).toContain("UID:evt-1@boja.app");
    expect(ics).toContain("DTSTAMP:20260713T090000Z");
    expect(ics).toMatch(/\r\nDTSTART:/);
    expect(ics).toMatch(/\r\nDTEND:/);
  });

  it("converts the KST window to UTC Zulu DTSTART/DTEND", () => {
    const ics = toIcs(plan, fixedOpts);
    // 19:00+09:00 -> 10:00Z, 21:00+09:00 -> 12:00Z, on 2026-07-14.
    expect(ics).toContain("DTSTART:20260714T100000Z");
    expect(ics).toContain("DTEND:20260714T120000Z");
  });

  it("uses CRLF line endings and never a lone LF (RFC-5545)", () => {
    const ics = toIcs(plan, fixedOpts);
    expect(ics).toContain("\r\n");
    expect(/[^\r]\n/.test(ics)).toBe(false);
  });

  it("escapes RFC-5545 text specials (backslash, semicolon, comma, newline)", () => {
    const nasty: Plan = {
      title: "Dinner, Drinks; \\ & more\ntonight",
      start: "2026-07-14T19:00:00+09:00",
      end: "2026-07-14T21:00:00+09:00",
      venue: { name: "Bar, Nightcap; Room" },
      participants: [{ name: "Mina" }],
    };
    const ics = toIcs(nasty, fixedOpts);
    // comma -> \, ; semicolon -> \; ; backslash -> \\ ; newline -> \n ; ampersand stays literal.
    expect(ics).toContain("SUMMARY:Dinner\\, Drinks\\; \\\\ & more\\ntonight");
    expect(ics).toContain("LOCATION:Bar\\, Nightcap\\; Room");
    // The escaped newline must not leak a real line break into the value.
    expect(/[^\r]\n/.test(ics)).toBe(false);
  });

  it("is deterministic given injected uid and dtstamp", () => {
    expect(toIcs(plan, fixedOpts)).toBe(toIcs(plan, fixedOpts));
  });

  it("derives deterministic default uid and dtstamp when none are injected", () => {
    expect(toIcs(plan)).toBe(toIcs(plan));
    expect(toIcs(plan)).toMatch(/\r\nUID:.+\r\n/);
  });
});
