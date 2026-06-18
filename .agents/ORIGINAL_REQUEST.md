# Original User Request

## Initial Request — 2026-06-16T03:42:50Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

A comprehensive set of lessons for the new graph-first Zero programming language, ranging from basic to advanced. The lessons will be added to the database via the `seedStarterLessons` mutation in `apps/zhyjen/convex/lessons.ts`.

Working directory: /Users/vantolbennett/Developer/2025/vantolbennett-blog/apps/zhyjen
Integrity mode: demo

Reference material: /Users/vantolbennett/.gemini/antigravity/brain/d66d2c6f-9796-408b-b651-6ad82b08c193/zerolang_reference.md

## Requirements

### R1. Create comprehensive Zero language lessons
Add 7-10 new lessons covering the Zero programming language from basic to advanced levels (e.g., basics, graph editing, the daily loop, diagnostics, compilation, and standard libraries). The structure of each lesson must follow the existing data structure in `apps/zhyjen/convex/lessons.ts` (title, slug, description, area, skillLevel, order, prerequisites, modules).

### R2. Seed the database
After adding the lessons to `apps/zhyjen/convex/lessons.ts`, run the script to seed the database and verify that the new lessons are valid. Use `vp exec convex run lessons:seedStarterLessons` to execute the mutation.

## Acceptance Criteria

### Content Quality
- [ ] `apps/zhyjen/convex/lessons.ts` contains 7-10 new lessons about the Zero language.
- [ ] The content of the lessons accurately reflects the principles of Zero (e.g., graph-first, compiler checks patches, readable projections), leveraging the provided reference material.
- [ ] The syntax of `apps/zhyjen/convex/lessons.ts` remains valid TypeScript.

### Execution Verification
- [ ] The command `vp exec convex run lessons:seedStarterLessons` executes successfully with exit code 0.

## Follow-up — 2026-06-16T04:25:00Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview

Build an interactive AST graph/visualizer pane into the Forge editor to support the Zero language. Additionally, sync the starter code snippets and steps in `activities.ts` to utilize these new editor features.

Working directory: /Users/vantolbennett/Developer/2025/vantolbennett-blog/apps/zhyjen
Integrity mode: benchmark

## Requirements

### R1. Forge AST Graph Visualizer
Add an interactive AST graph/visualizer pane next to the code editor in the Forge. This should visually represent the Zero language graph structures that the user is editing.

### R2. Sync Activities
Update the starter code snippets, steps, and instructions for the 8 existing Zero language activities in `activities.ts` to explicitly reference and utilize the new AST visualizer and Zero syntax.

## Acceptance Criteria

### AST Visualizer Implementation
- [ ] The Forge editor UI includes a new toggle or pane specifically labeled for the AST Graph or Visualizer.
- [ ] The visualizer successfully renders mock or live Zero language nodes and edges without throwing React errors.

### Activities Alignment
- [ ] The `apps/zhyjen/convex/activities.ts` starter code and descriptions explicitly reference the "AST Graph" or "visualizer" in at least 3 Zero activities.
- [ ] Running `vp exec convex run activities:seedStarterActivities` executes successfully with exit code 0.
- [ ] Running `vp check` and `vp test` inside `apps/zhyjen` passes with exit code 0.

