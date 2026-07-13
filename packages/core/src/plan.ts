import { z } from "zod";

// Version-agnostic ISO check (zod 3/4 moved `.datetime()` around); Date.parse is
// enough rigor until the `.ics` builder imposes its own stricter format.
const IsoDateTime = z
  .string()
  .refine((s) => !Number.isNaN(Date.parse(s)), { message: "must be an ISO-8601 datetime" });

/** A friend as the user names them — no accounts, no network (ADR-0003). */
export const ParticipantSchema = z.object({
  name: z.string().min(1),
});
export type Participant = z.infer<typeof ParticipantSchema>;

export const VenueSchema = z.object({
  name: z.string().min(1),
  area: z.string().min(1).optional(),
  url: z.string().url().optional(),
});
export type Venue = z.infer<typeof VenueSchema>;

/** The pasted "dinner next week with A and B", structured by the agent. */
export const IntentSchema = z.object({
  rawText: z.string().min(1),
  activity: z.string().min(1),
  participants: z.array(ParticipantSchema).min(1),
  window: z
    .object({
      earliest: IsoDateTime,
      latest: IsoDateTime,
    })
    .refine((w) => Date.parse(w.earliest) <= Date.parse(w.latest), {
      message: "window.earliest must not be after window.latest",
    }),
});
export type Intent = z.infer<typeof IntentSchema>;

export const PlanOptionSchema = z
  .object({
    start: IsoDateTime,
    end: IsoDateTime,
    venue: VenueSchema,
    rationale: z.string().min(1),
  })
  .refine((o) => Date.parse(o.start) < Date.parse(o.end), {
    message: "start must be before end",
  });
export type PlanOption = z.infer<typeof PlanOptionSchema>;

/** ADR-0003: the agent proposes exactly 3 time+venue options. */
export const ProposalSchema = z.object({
  intent: IntentSchema,
  options: z.array(PlanOptionSchema).length(3),
});
export type Proposal = z.infer<typeof ProposalSchema>;

/** A confirmed option — the thing the plan card and `.ics` are rendered from. */
export const PlanSchema = z.object({
  title: z.string().min(1),
  start: IsoDateTime,
  end: IsoDateTime,
  venue: VenueSchema,
  participants: z.array(ParticipantSchema).min(1),
});
export type Plan = z.infer<typeof PlanSchema>;

/** "Mina", "Mina & Jae", "Mina, Jae & Sun". */
export function nameList(names: readonly string[]): string {
  const last = names.at(-1);
  if (last === undefined) return "";
  if (names.length === 1) return last;
  return `${names.slice(0, -1).join(", ")} & ${last}`;
}

export function planTitle(intent: Intent): string {
  const activity = intent.activity.charAt(0).toUpperCase() + intent.activity.slice(1);
  return `${activity} with ${nameList(intent.participants.map((p) => p.name))}`;
}

/** The explicit user confirm (ADR-0003's trust model) — the only path from proposal to plan. */
export function confirmPlan(proposal: Proposal, optionIndex: number): Plan {
  const option = proposal.options[optionIndex];
  if (option === undefined) {
    throw new RangeError(`optionIndex ${optionIndex} is out of range (0..${proposal.options.length - 1})`);
  }
  return PlanSchema.parse({
    title: planTitle(proposal.intent),
    start: option.start,
    end: option.end,
    venue: option.venue,
    participants: proposal.intent.participants,
  });
}
