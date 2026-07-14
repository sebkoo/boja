import { FixturePlanner, FixtureVenueRetriever, guardOutbound } from "@boja/ai";
import {
  confirmPlan,
  InsufficientCandidatesError,
  IntentSchema,
  PlanCardSchema,
  ProposalSchema,
  toIcs,
  toPlanCard,
  type Prefs,
} from "@boja/core";
import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";

const DEFAULT_PREFS: Prefs = {
  preferredAreas: [],
  preferredTimeOfDay: "evening",
  slotMinutes: 120,
};
const DEFAULT_STEP_BUDGET = 4;

export function registerPlanRoutes(app: FastifyInstance): void {
  app.withTypeProvider<ZodTypeProvider>().post(
    "/plans/propose",
    {
      schema: {
        body: IntentSchema,
        response: {
          200: ProposalSchema,
          422: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const planner = new FixturePlanner({
        retriever: new FixtureVenueRetriever(app.venues),
        prefs: DEFAULT_PREFS,
        stepBudget: DEFAULT_STEP_BUDGET,
      });

      try {
        return await planner.propose(request.body);
      } catch (err) {
        if (err instanceof InsufficientCandidatesError) {
          return reply.code(422).send({ message: err.message });
        }
        throw err;
      }
    },
  );

  app.withTypeProvider<ZodTypeProvider>().post(
    "/plans/confirm",
    {
      schema: {
        body: z.object({ proposal: ProposalSchema, optionIndex: z.number().int().nonnegative() }),
        response: {
          200: z.object({ card: PlanCardSchema, ics: z.string() }),
        },
      },
    },
    async (request) => {
      const { proposal, optionIndex } = request.body;

      const verdict = guardOutbound({ kind: "ics", confirmed: true });
      if (!verdict.ok) {
        throw new Error(verdict.reason);
      }

      const plan = confirmPlan(proposal, optionIndex);
      return { card: toPlanCard(plan), ics: toIcs(plan) };
    },
  );
}
