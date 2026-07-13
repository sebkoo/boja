# ADR-0004: Name — Boja (보자)

- Date: 2026-07-12
- Status: accepted

## Context

Hard criteria for the name: ≤3 syllables; spellable after one hearing in English and Korean; hints at gathering/plans; no existing App Store app in category, GitHub asset, npm package, or live software-class trademark; at least one of .app/.com/.io plausibly free; no negative meaning in EN/KO/ES/JA.

Eleven candidates checked on 2026-07-12 across the App Store, GitHub, npm, RDAP (domains), and USPTO records via Justia:

| Candidate | Verdict | Deciding evidence |
|---|---|---|
| **Boja** (보자 "let's see each other") | **CLEAR — chosen** | npm free; `boja.app` unregistered at check; no software mark on [Justia](https://trademarks.justia.com/search?q=boja); no category App Store collision (nearest: an unrelated [Bojä credit app](https://apps.apple.com/mx/app/boj%C3%A4/id1666144500)); [meaning](https://en.wiktionary.org/wiki/boja) neutral-positive in the screened languages |
| Ondol (온돌) | CLEAR — runner-up | Legally cleanest (no app, no standalone mark — only a [descriptive mention](https://trademarks.justia.com/906/68/bhd-bio-health-90668092.html)); lost on obscurity and zero free domains |
| Yaksok (약속) | RISKY | The [Yaksok programming language](https://github.com/yaksok/yaksok) owns the GitHub org and npm; Korean store saturated with 약속 scheduling apps |
| Moyeo (모여) | RISKY | Exact-name [social app exists](https://apps.apple.com/no/app/moyeo/id6760990421); EN spelling ambiguity |
| Junto | RISKY | [Junto Socials](https://www.juntosocials.com/) overlaps the concept; multiple live [JUNTO marks](https://trademarks.justia.com/970/06/junto-97006970.html) |
| Madang (마당) | RISKY | [Exact-name AI app](https://apps.apple.com/us/app/madang-ai-art-generator/id6477485209); zero free domains; [PNG city homonym](https://en.wikipedia.org/wiki/Madang) |
| Confab | RISKY | Two live Confab apps ([1](https://apps.apple.com/jp/app/confab/id1598844888), [2](https://apps.apple.com/in/app/confab-connecting-fabulously/id6760545245)); root shared with "confabulation," the standard term for AI hallucination — poor subtext for a trust-first agent |
| Nori (놀이) | BLOCKED | [Nori – Family AI](https://heynori.com/) ships AI reservations — same category |
| Maru (마루) | BLOCKED | Saturated namespace ([maru framework](https://github.com/elixir-maru/maru), MaruOS, all assets taken) |
| Moim (모임) | BLOCKED | [모임(MoIm)](https://apps.apple.com/us/app/%EB%AA%A8%EC%9E%84-moim/id6771765255) is a same-name, same-concept app on the US store |
| Patio | BLOCKED | [The Patio App](https://patio.app/) owns the exact .app domain; generic word, weak mark |

## Decision

**Boja.** The meaning is the product thesis: 언제 한번 보자 ("let's hang out sometime") is the exact sentence the product converts into a confirmed plan. Two syllables, spells itself in English and Korean after one hearing, and had the best asset availability of all eleven candidates.

Canonical introduction, everywhere the name first appears:

> **Boja (보자 — "let's hang out") — the AI concierge that turns it into a real plan.**

## Alternatives considered

See table. Ondol was the legal runner-up; it lost on pronounceability for non-Korean speakers and domain availability, and its meaning (the warm floor a family gathers on) requires explanation where 보자 requires none for the target phrase.

## Consequences

- **Italian homophone, on the record:** "boia" (executioner) appears in the profane exclamation "dio boia" in parts of northern Italy ([reference](https://en.wiktionary.org/wiki/boia)). Italy is outside the screened launch languages (EN/KO/ES/JA); monitored, accepted, revisit before any Italian launch.
- The GitHub handle `boja` is squatted by an empty account, so the org is **boja-app**.
- Honesty caveat: trademark screening was at the Justia-search level, not a formal TESS knockout search. Run the formal search before filing anything or spending on brand.
- `boja.app` and npm `boja` were free at check time; both are being secured (registration is a manual step outside this repo).
