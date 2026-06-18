# Project Plan: Zero Language Lessons Integration

## Architecture
- **Framework**: Convex backend + Vite+ toolchain.
- **Lessons Schema / Mutation**: `apps/zhyjen/convex/lessons.ts`
- **Seeding Entry Point**: `vp exec convex run lessons:seedStarterLessons`
- **Reference Material**: `/Users/vantolbennett/.gemini/antigravity/brain/d66d2c6f-9796-408b-b651-6ad82b08c193/zerolang_reference.md`

## Milestones
| # | Name | Scope | Dependencies | Status | Conversation ID |
|---|---|---|---|---|---|
| 1 | Explore | Investigate current lessons structure, verify type definitions, read Zero language reference | None | DONE | 886bbe74-0f22-4aa7-a97e-28c41492227c, c581cf8d-49ef-43c1-94cc-06e32e3bc5bc, 31f2742f-05ba-44e7-8465-16ec5c77f21a |
| 2 | E2E Test Suite | Setup E2E test scripts/cases following Tier 1-4 methodology | M1 | DONE | 51997dc9-cffe-473a-a0be-21ee0c2d12a0 |
| 3 | Implementation | Add 7-10 comprehensive Zero language lessons from basic to advanced levels | M1, M2 | DONE | 618a5249-7810-4913-b975-6f03a4373d1a |
| 4 | Seeding Validation | Execute seeding mutation, check DB state, and resolve schema validation | M3 | DONE | c44e4a42-eb33-452f-bfa8-f1b24f862314, 51997dc9-cffe-473a-a0be-21ee0c2d12a0 |
| 5 | Verification & Audit | Challenger empirical verification + Forensic Auditor check | M4 | DONE | ed4094c5-1bc9-4719-828d-1c5ca11debb9, d54f9110-f791-4910-9bb7-053fbb831adb, 844520a0-a1fe-42da-97c0-fa5fcc439590 |

## Interface Contracts
- New lessons must conform exactly to the typescript interface/type structure defined in `apps/zhyjen/convex/lessons.ts`.
- Seeding action/mutation `lessons:seedStarterLessons` must run successfully.

## Code Layout
- Backend code: `apps/zhyjen/convex/`
  - `lessons.ts` - Mutation logic and lesson data definitions.
- Frontend or tests: `apps/zhyjen/` (using Vite+ `vp` CLI)
