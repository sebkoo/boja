# Monetization

Every figure on this page is a **pre-launch hypothesis · to be validated**.
Nothing here is measured: there is no traction, conversion, or revenue data yet,
and none is implied. The value split is recorded in ADR-0003 and the README; the
prices below are starting hypotheses, not adopted prices.

## Value metric

- **Free:** one active plan.
- **Pro:** unlimited plans + reminders + preference memory.
- **Upgrade trigger (hypothesis):** wanting a second concurrent plan, or wanting
  memory / reminders.

Split from ADR-0003 and the README; the trigger is a hypothesis to validate.

## Price hypotheses

Dual region, **US as the primary anchor**. The two regions are parallel App
Store pricing, not an FX-exact conversion. All values below are
*hypothesis · to be validated*.

| Region | Monthly | Annual | Note |
|---|---|---|---|
| **US** (primary) | $6.99 | $59.99 | annual ≈ 28% below 12× monthly · *hypothesis* |
| **KR** | ₩8,900 | ≈ ₩79,000 | nearest App Store tier; parallel, not FX-exact · *hypothesis* |

**Sensitivity band to test:** $4.99–$9.99 / month.

Rationale (hypothesis): social / planning apps show soft willingness-to-pay,
which argues below $9.99; the AI concierge + preference memory argue above
$4.99. So $6.99 is the primary hypothesis and $9.99 is the premium test ceiling.

## Rails

- **iOS:** StoreKit 2 now (ADR-0001 native module; ADR-0003).
- **Web companion:** Stripe later (README; ADR-0003).

## Funnel events

Named placeholders only — **no values recorded**. These name the events to emit;
they carry no counts, rates, or targets in this repo until instrumented.

- `paywall_view`
- `plan_limit_hit`
- `upgrade_start`
- `upgrade_complete`
- `trial_convert`

Growth context lives in `docs/growth.md`. Any funnel number stays out of this
repo until it is measured.

## What this file does not claim

No adoption, conversion, retention, or revenue figure appears here. Every price
is a starting hypothesis to test, not a decision validated in market. Revisit
once real data exists.

## Provenance

Value split and rails trace to ADR-0003 and the README; the StoreKit native
surface to ADR-0001. The price points, annual relationship, and sensitivity band
are pre-launch hypotheses supplied for testing, labeled as such throughout.
