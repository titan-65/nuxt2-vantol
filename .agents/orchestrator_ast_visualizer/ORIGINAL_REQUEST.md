# Original User Request

## Follow-up — 2026-06-16T04:25:00Z

Build an interactive AST graph/visualizer pane into the Forge editor to support the Zero language. Additionally, sync the starter code snippets and steps in `activities.ts` to utilize these new editor features.

Working directory: apps/zhyjen
Integrity mode: benchmark

### Requirements

#### R1. Forge AST Graph Visualizer
Add an interactive AST graph/visualizer pane next to the code editor in the Forge. This should visually represent the Zero language graph structures that the user is editing.

#### R2. Sync Activities
Update the starter code snippets, steps, and instructions for the 8 existing Zero language activities in `activities.ts` to explicitly reference and utilize the new AST visualizer and Zero syntax.

### Acceptance Criteria

#### AST Visualizer Implementation
- The Forge editor UI includes a new toggle or pane specifically labeled for the AST Graph or Visualizer.
- The visualizer successfully renders mock or live Zero language nodes and edges without throwing React errors.

#### Activities Alignment
- The `apps/zhyjen/convex/activities.ts` starter code and descriptions explicitly reference the "AST Graph" or "visualizer" in at least 3 Zero activities.
- Running `vp exec convex run activities:seedStarterActivities` executes successfully with exit code 0.
- Running `vp check` and `vp test` inside `apps/zhyjen` passes with exit code 0.
