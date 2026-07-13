# App Store Optimization (ASO)

Structure and hypotheses for the App Store listing. No final copy lives here —
all store copy must derive from `docs/VOICE.md`, and every positioning claim
must be re-scanned before publish (ADR-0003). Fields below are placeholders.

## Name / title

- App name: **Boja** (ADR-0004).
- One-liner, from VOICE.md: *Boja (보자 — "let's hang out") — the AI concierge
  that turns it into a real plan.*
- Subtitle: *(TODO — derive from VOICE.md; App Store caps it at 30 chars)*

## Category

- Primary: *(TODO — Social vs Productivity; record the rationale)*
- Secondary: *(TODO)*

## Keywords (hypotheses)

- Seed set: *(TODO — e.g. hangout, plan, group, calendar; validate, never guess
  volumes)*
- Name collisions were screened at pick time (ADR-0004); re-check the live store
  before listing.

## Screenshots / preview

- Must show the Story 01 flow: paste intent → three options → confirm → card.
  *(assets planned — the 30-second demo ships with Story 01, README)*

## Localization

- EN + KO at minimum: VOICE.md is bilingual and ADR-0004 screened EN/KO/ES/JA.
  *(per-locale copy: TODO, from the VOICE.md renderings)*

## Constraints

- No positioning or superlative claim without a fresh market re-scan (ADR-0003).
- No copy that does not trace to VOICE.md.
- Italian homophone caveat before any IT launch (ADR-0004).

## Provenance

Traces to ADR-0004 (name, screening), ADR-0003 (positioning discipline), and
VOICE.md (all copy). Every value marked *TODO* is unset, not assumed.
