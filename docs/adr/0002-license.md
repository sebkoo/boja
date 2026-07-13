# ADR-0002: License — MIT

- Date: 2026-07-12
- Status: accepted

## Context

The repo is public from day 1 and doubles as a portfolio of engineering judgment. The product monetizes via subscriptions (StoreKit 2 now, Stripe later). The question is whether a permissive license undermines a paid app whose code is public.

## Decision

MIT, copyright Ben Koo.

## Alternatives considered

- **Apache-2.0** — the serious contender, rejected on two grounds:
  - *Patent grant:* irrelevant at this repo's scale. The grant exists so that many corporate contributors cross-license patents covering their contributions. I hold no patents, none are pending, and a one-author consumer scheduling app asserts nothing patentable against its users. The clause would document a protection nobody here can give or needs; it becomes worth revisiting only if outside contributions arrive at scale.
  - *Trademark clause:* Apache-2.0 states explicitly that the license grants no trademark rights. That clause is declaratory, not constitutive — trademark rights arise from use in commerce (and registration), independent of any code license. MIT's silence leaves the "Boja" mark exactly as enforceable. I rejected the explicit clause, not the right itself.
- **AGPL / BSL (source-available):** rejected. The moat is not the code — it's venue-data quality, preference memory, and the operated service. A restrictive license costs readers and contributors while protecting nothing that matters here; several funded teams already built adjacent products without this code (ADR-0003).
- **No license (all rights reserved):** rejected — a public repo without a license invites neither use nor trust.

## Consequences

- Easier: zero-friction reading, forking, citing; standard badge; no CLA overhead.
- Harder: nothing prevents verbatim code lifting by a competitor. Accepted: the subscription sells the operated service, not the source.
- Revisit trigger: sustained outside contributions → re-examine Apache-2.0 for its contributor patent grant.
