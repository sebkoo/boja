import type { Plan } from "./plan.js";

const PRODID = "-//Boja//Story01//EN";

export interface IcsOptions {
  uid?: string;
  dtstamp?: string;
}

/** Escape an RFC-5545 TEXT value: backslash first, then ; , and newline (section 3.3.11). */
function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Format an offset-aware ISO instant as UTC Zulu basic form: YYYYMMDDTHHMMSSZ. */
function toZulu(iso: string): string {
  const d = new Date(iso);
  const p = (n: number): string => String(n).padStart(2, "0");
  return (
    `${d.getUTCFullYear()}${p(d.getUTCMonth() + 1)}${p(d.getUTCDate())}` +
    `T${p(d.getUTCHours())}${p(d.getUTCMinutes())}${p(d.getUTCSeconds())}Z`
  );
}

/** A slug for the deterministic default UID — stable across runs, no clock, no randomness. */
function slug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/** Render a confirmed plan as a standards-compliant single-event `.ics` (ADR-0003 artifact quality). */
export function toIcs(plan: Plan, opts: IcsOptions = {}): string {
  const dtstart = toZulu(plan.start);
  const dtend = toZulu(plan.end);
  // Defaults derived from plan fields (no Date.now / Math.random); the API injects a real DTSTAMP.
  const uid = opts.uid ?? `${dtstart}-${slug(plan.venue.name)}@boja.app`;
  const dtstamp = opts.dtstamp ?? dtstart;
  const location = plan.venue.area ? `${plan.venue.name}, ${plan.venue.area}` : plan.venue.name;

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:${PRODID}`,
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeText(plan.title)}`,
    `LOCATION:${escapeText(location)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // RFC 5545 §3.1 line folding deliberately omitted: MVP summaries stay well under
  // 75 octets; revisit when user-generated titles or Korean venue names
  // (3 bytes/char in UTF-8) can exceed it.
  return lines.map((line) => `${line}\r\n`).join("");
}
