# ADR-0003: Concept — an AI concierge that turns "let's hang out sometime" into a confirmed plan

- Date: 2026-07-12
- Status: accepted

## Context

"언제 한번 보자" — "let's hang out sometime" — is where plans go to die. The concept under decision: paste a group intent ("dinner next week with A and B") → an agent proposes 3 time+venue options from saved preferences and venue data → the user confirms → the app produces a shareable plan card and an `.ics` file. No auto-messaging anyone.

Market scan, 2026-07-12 (point-in-time; links were live on that date):

| Product | Shape | Notes |
|---|---|---|
| [GetTogether Planner](https://gettogetherplanner.com/) | web/PWA | Closest overall: AI itinerary from group preferences, freemium with free = 1 event. Requires group date-polling. |
| [Continua](https://techcrunch.com/2025/08/12/google-vet-raises-8m-for-continua-to-bring-ai-agents-to-group-chats/) | AI agent in the group chat | $8M raised; "3 real options" framing; the agent messages your friends. |
| [Dayli](https://apps.apple.com/au/app/dayli-your-social-ai/id6749581449) | iOS social AI | Syncs calendars, suggests times/activities; network-dependent. |
| [Weeve](https://getweeve.io/) | iOS/Android | Text → plan with shareable link; lighter (no venue curation). |
| [Gather](https://apps.apple.com/us/app/gather-plan-hangout-with-ai/id6504154185), [PalsSocial](https://apps.apple.com/us/app/palssocial-hangout-planner/id6747454246) | iOS | Early AI event/hangout planners. |
| [Howbout](https://howbout.app/) | shared social calendar | 8M users; AI suggestions bolted onto a calendar network everyone must join. |
| [Partiful](https://partiful.com/), [TimeTree](https://timetreeapp.com/intl/en), [Doodle](https://doodle.com/), [When2meet](https://www.when2meet.com/), [LettuceMeet](https://lettucemeet.com/) | invites / calendars / polls | Coordination utilities, little or no AI planning. |
| [Timeleft](https://timeleft.com/), [222](https://www.fastcompany.com/91356813/222-aims-to-end-loneliness-by-engineering-chance), [Pie](https://techcrunch.com/2025/03/04/andy-dunns-new-app-pie-uses-ai-to-help-you-make-friends/) | strangers → dinner | Matchmaking among strangers — adjacent, not this problem. |
| [Fabriq](https://ourfabriq.com/), [Geneva](https://www.geneva.com/about), [Luma](https://luma.com/), [Amie](https://amie.so/) | adjacent | Relationship reminders / group comms / event hosting / personal AI calendar. |
| [IRL](https://techcrunch.com/2023/06/26/irl-shut-down-fake-users/) | — | Dead (2023, fabricated user numbers). |

Open source: no repo in this niche above ~5 GitHub stars at scan time — hackathon-scale only.

Honest verdict: the niche is occupied and crowding, with no winner. Entry is credible only with a sharp wedge.

## Decision

Build the concierge, with the wedge stated up front:

1. **Trust model:** nothing goes outbound without an explicit user confirm. The user stays the sender. This is the philosophical opposite of an agent that joins the group chat.
2. **No network requirement:** the output (plan card + `.ics`) is shareable anywhere; friends need no account. The app is useful single-player from day 1.
3. **Artifact quality:** a standards-compliant `.ics` and a plan card worth forwarding.
4. **Venue curation:** preference memory + retrieval over venue data is the quality bet — the part that must be genuinely better, not just present.

Monetization shape decided now, built later: free = 1 active plan; Pro subscription for unlimited plans, reminders, preference memory.

## Alternatives considered

- **(a) Post-hangout "keep in touch" memory agent:** rejected for now — overlaps Fabriq's established relationship-reminder ground; weaker 30-second demo.
- **(b) Recurring friend/couple ritual planner:** rejected for now — least crowded of the three per the scan, but the value shows over weeks, not in a demo. Retained as the stronger pivot.

## Consequences

- The differentiators are thin and copyable; the bet is execution quality, not moat.
- **Kill criterion:** if Story 01's end-to-end demo is not achievable within 3 working sessions, revisit this decision against the fallbacks above.
- The scan is point-in-time; re-scan before any positioning claim in store listings.
