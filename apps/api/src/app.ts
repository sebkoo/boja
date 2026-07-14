import type { OutboundSink } from "@boja/ai";
import type { Venue } from "@boja/core";
import Fastify from "fastify";
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { z } from "zod";

import { FIXTURE_VENUES } from "./fixtures/venues.js";
import { registerPlanRoutes } from "./routes/plans.js";

declare module "fastify" {
  interface FastifyInstance {
    venues: readonly Venue[];
    outboundSink: OutboundSink;
  }
}

/** Story 01's default outbound sink — nothing leaves the app until a route wires a real one. */
const noopOutboundSink: OutboundSink = {
  send: async () => {},
};

export interface BuildAppOpts {
  venues?: readonly Venue[];
  outbound?: OutboundSink;
}

export function buildApp(opts: BuildAppOpts = {}) {
  const app = Fastify({ logger: false }).withTypeProvider<ZodTypeProvider>();
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.decorate("venues", opts.venues ?? FIXTURE_VENUES);
  app.decorate("outboundSink", opts.outbound ?? noopOutboundSink);

  app.setErrorHandler((err, _request, reply) => {
    if (err instanceof RangeError) {
      return reply.code(400).send({ message: err.message });
    }
    throw err;
  });

  app.get(
    "/health",
    {
      schema: {
        response: {
          200: z.object({ status: z.literal("ok") }),
        },
      },
    },
    async () => ({ status: "ok" as const }),
  );

  registerPlanRoutes(app);

  return app;
}
