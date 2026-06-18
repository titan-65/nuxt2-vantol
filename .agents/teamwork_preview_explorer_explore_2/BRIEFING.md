# BRIEFING — 2026-06-15T22:43:36-05:00

## Mission
Analyze apps/zhyjen/convex/lessons.ts and zerolang_reference.md to propose 7-10 Zero language lessons matching the Convex database schema.

## 🔒 My Identity
- Archetype: explorer
- Roles: Teamwork explorer, read-only investigator
- Working directory: /Users/vantolbennett/Developer/2025/vantolbennett-blog/.agents/teamwork_preview_explorer_explore_2
- Original parent: ed29c275-1d16-4f65-b8b7-e86071f8d45a
- Milestone: Zero language lessons proposal

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- CODE_ONLY network mode: no external requests, no curl/wget/etc.

## Current Parent
- Conversation ID: ed29c275-1d16-4f65-b8b7-e86071f8d45a
- Updated: 2026-06-16T03:45:00Z

## Investigation State
- **Explored paths**:
  - `apps/zhyjen/convex/lessons.ts` (lines 1 to 256): examined existing lesson seed data (HTML, CSS, JS, etc.) and schema requirements.
  - `apps/zhyjen/convex/schema.ts` (lines 50 to 81): verified the precise table schema and TypeScript representation for `lessons`.
  - `/Users/vantolbennett/.gemini/antigravity/brain/d66d2c6f-9796-408b-b651-6ad82b08c193/zerolang_reference.md` (lines 1 to 63): analyzed Zero language overview, daily loops, projections, builds, and patch commands.
- **Key findings**:
  - The Convex schema defines a lesson using fields: `title` (string), `slug` (string), `description` (string), `area` (string), `skillLevel` (string), `order` (number), `prerequisites` (array of strings), and `modules` (array of string/objects).
  - The new module shape consists of objects containing `title`, `body`, and optional `codeExample`.
  - Zerolang is an experimental graph-first language that uses database-like semantics, CLI tools (`zero query`, `zero patch`, `zero check`, `zero test`, `zero run`, `zero export`, `zero import`, `zero verify-projection`, `zero build`), and optimistic locking hashes.
- **Unexplored areas**:
  - Integration tests verifying database seeding of new lessons. (Not required for read-only investigator role).

## Key Decisions Made
- Proposed 9 highly structured Zero language lessons (orders 7 to 15) matching the database format.
- Coordinated slugs and prerequisites to ensure logical course progression (e.g. `zerolang-daily-loop` requires `intro-to-zerolang`).

## Artifact Index
- `.agents/teamwork_preview_explorer_explore_2/handoff.md` — Complete handoff report with 5 components and proposed lesson seed data.
