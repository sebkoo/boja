import { z } from "zod";

import { nameList, type Plan } from "./plan.js";

/** The shareable plan card as a framework-free, copy-free view-model. Labels and
 *  date formatting live in the mobile i18n layer, not here (VOICE governs copy). */
export const PlanCardSchema = z.object({
  title: z.string().min(1),
  who: z.string().min(1),
  venueName: z.string().min(1),
  venueArea: z.string().min(1).optional(),
  start: z.string().min(1),
  end: z.string().min(1),
});
export type PlanCard = z.infer<typeof PlanCardSchema>;

/** Project a confirmed plan into its card view-model (ISO passthrough; who via nameList). */
export function toPlanCard(plan: Plan): PlanCard {
  return {
    title: plan.title,
    who: nameList(plan.participants.map((p) => p.name)),
    venueName: plan.venue.name,
    // Omit the key entirely (not undefined) when the venue carries no area.
    ...(plan.venue.area !== undefined ? { venueArea: plan.venue.area } : {}),
    start: plan.start,
    end: plan.end,
  };
}
