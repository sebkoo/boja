import { z } from "zod";

import { PlanOptionSchema, type Intent, type PlanOption, type Venue } from "./plan.js";

/** Time-of-day resolved to a fixed local hour — the slot's start hour. */
export const TIME_OF_DAY_HOURS = { morning: 9, afternoon: 13, evening: 19 } as const;

/** User preferences that shape (but never re-rank) the retriever's candidate venues. */
export const PrefsSchema = z.object({
  preferredAreas: z.array(z.string()),
  preferredTimeOfDay: z.enum(["morning", "afternoon", "evening"]),
  slotMinutes: z.number().int().positive(),
});
export type Prefs = z.infer<typeof PrefsSchema>;

/** Fewer than 3 distinct candidate venues after filtering — cannot propose (ADR-0003). */
export class InsufficientCandidatesError extends Error {
  constructor(readonly candidateCount: number) {
    super(`need at least 3 candidate venues, got ${candidateCount}`);
    this.name = "InsufficientCandidatesError";
  }
}

const pad = (n: number): string => String(n).padStart(2, "0");

/** Format a naive-UTC instant back into a wall-clock ISO string with its fixed offset. */
function formatSlot(ms: number, offset: string): string {
  const d = new Date(ms);
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}${offset}`
  );
}

/**
 * Compose exactly 3 ranked options from the retriever's already-ranked venues
 * (relevance lives in Layer 1 — this only pairs venue + slot). Deterministic.
 */
export function proposeOptions(
  intent: Intent,
  venues: readonly Venue[],
  prefs: Prefs,
): PlanOption[] {
  const candidates =
    prefs.preferredAreas.length === 0
      ? venues
      : venues.filter((v) => v.area !== undefined && prefs.preferredAreas.includes(v.area));

  if (candidates.length < 3) {
    throw new InsufficientCandidatesError(candidates.length);
  }

  const top = candidates.slice(0, 3);

  // The earliest qualifying slot in the window, shared by all 3 options (they differ by venue).
  // Offset derived from window.earliest assumes a fixed-offset zone (true for KST; revisit for DST regions).
  const earliest = intent.window.earliest;
  const t = earliest.indexOf("T");
  const y = Number(earliest.slice(0, 4));
  const mo = Number(earliest.slice(5, 7));
  const d = Number(earliest.slice(8, 10));
  const rest = earliest.slice(t + 1);
  const offset = rest.match(/([+-]\d{2}:\d{2}|Z)$/)?.[0] ?? "Z";
  const time = rest.slice(0, rest.length - offset.length);
  const earliestNaive = Date.UTC(y, mo - 1, d, Number(time.slice(0, 2)), Number(time.slice(3, 5)), Number(time.slice(6, 8)));

  const hour = TIME_OF_DAY_HOURS[prefs.preferredTimeOfDay];
  let startNaive = Date.UTC(y, mo - 1, d, hour, 0, 0);
  if (startNaive < earliestNaive) startNaive += 24 * 60 * 60 * 1000;
  const endNaive = startNaive + prefs.slotMinutes * 60 * 1000;

  const start = formatSlot(startNaive, offset);
  const end = formatSlot(endNaive, offset);

  return top.map((venue) =>
    // Placeholder rationale — factual only; final VOICE-approved wording lands at /ship (plan Q3).
    PlanOptionSchema.parse({
      start,
      end,
      venue,
      rationale: venue.area ? `In ${venue.area}` : venue.name,
    }),
  );
}
