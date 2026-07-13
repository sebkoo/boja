# ADR-0005: UI-flow testing — Maestro, on top of Vitest and XCTest

- Date: 2026-07-12
- Status: accepted

## Context

ADR-0001 fixed the lower test layers (Vitest for TS packages, XCTest for the Swift StoreKit module) and deferred the UI-flow layer to this ADR. The flow that must stay provably working is Story 01's demo path: paste intent → three options → confirm → plan card + `.ics`. One person maintains this; a flaky or high-maintenance E2E suite would be abandoned within weeks, which is worse than having none.

Constraints:

- Must run against an Expo app (managed workflow, dev builds) without forking the native project setup.
- Must not require test code compiled into the app binary.
- A handful of critical flows, not a pyramid inversion — logic coverage lives in Vitest at `packages/core`/`packages/ai`.

## Decision

**Maestro** for UI flows: black-box YAML flows checked into `apps/mobile/.maestro/`, run against a simulator build locally first, CI lane later. Scope is deliberately small — the Story 01 happy path and the paywall gate, nothing else until a regression proves a flow has earned a test.

Layer map, complete:

| Layer | Tool | Lives in |
|---|---|---|
| Domain rules, AI seams, API routes | Vitest | `packages/*`, `apps/api` |
| StoreKit 2 bridge | XCTest + StoreKitTest | the Swift module |
| Critical UI flows | Maestro | `apps/mobile/.maestro/` |

## Alternatives considered

- **Detox:** the gray-box synchronization is genuinely better at knowing when RN is idle, but it earns that by compiling test infrastructure into the app and coupling to the native build — historically the friction point with Expo. For two or three flows, that setup cost is the whole budget. Rejected.
- **Appium / WebDriver:** the most general and the most flaky; a session-based driver stack and locator maintenance for a two-flow suite is machinery without a customer. Rejected.
- **XCUITest for RN flows:** wrong layer — it would test React Native UI through Swift, duplicating what Maestro does declaratively. XCTest stays scoped to the Swift module where it is native to the code under test.
- **No E2E at all:** tempting given the maintenance argument, but Story 01 is the kill criterion (ADR-0003); the one flow the product bets on should not be verifiable only by hand. Rejected.

## Consequences

- Easier: flows are YAML — readable in review, no app-side instrumentation, reusable across dev and release builds.
- Harder: black-box means Maestro can't know when the JS thread is idle; waits are explicit, and a slow agent response can flake a flow. Mitigation: the demo flow runs against a stubbed agent fixture, not live inference.
- CI needs a macOS simulator lane eventually; until then Maestro runs locally, which is acceptable at one maintainer.
- Revisit triggers: flow count grows past ~5; Maestro's iOS support stalls; StoreKit paywall proves untestable black-box (then that one flow moves to XCUITest).
