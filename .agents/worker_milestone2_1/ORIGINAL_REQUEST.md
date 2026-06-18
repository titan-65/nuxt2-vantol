## 2026-06-15T23:28:32Z
You are a Worker agent.
Your Working Directory: /Users/vantolbennett/Developer/2025/vantolbennett-blog/.agents/worker_milestone2_1

Your task is to implement the AST Graph Visualizer features in the Forge editor and sync the Zero language activities in `activities.ts`.

Inputs:
- Explorer Design Reports:
  - `/Users/vantolbennett/Developer/2025/vantolbennett-blog/.agents/explorer_milestone1_3/handoff.md` (detailed layout logic, resizer math, AstVisualizer component blueprint, and activities updates)
  - `/Users/vantolbennett/Developer/2025/vantolbennett-blog/.agents/explorer_milestone1_1/handoff.md` (additional layout and UI design details)

Implementation Tasks:
1. Update `apps/zhyjen/src/forge/ForgeWorkspace.tsx`:
   - Add state for toggling visualizer visibility and state/handlers for resizable visualizer pane width (using pointer capture, co-existing with outer sidebars).
   - Render a toggle button inside the toolbar actions block (`.forge-editor-toolbar-actions`) using the `Network` icon from `lucide-react`. Make sure to import `Network` from `lucide-react` at the top of the file.
   - Modify the `.forge-editor-body` layout to support horizontal splitting: show the editor pane next to the resizer and `AstVisualizer` when toggle is open.
2. Create `apps/zhyjen/src/forge/AstVisualizer.tsx`:
   - Build a lightweight SVG-based node-and-edge visualizer.
   - When the active file is a Zero language file (ends with `.0` or has language `"zero"`), parse it using simple regex patterns to extract function declarations, variable assignments, calls, and reference dependencies. Highlight unbound/dangling references and their edges in red.
   - When the active file is a web/non-Zero file, render a friendly educational placeholder/tip informing the user that they can visualize a Zero file, with a mock interactive visualization.
   - Include a node inspector panel at the bottom to inspect selected node details and attributes.
3. Update `apps/zhyjen/src/forge/bundler.ts`:
   - Map `.0` files to language `"zero"` inside `languageFromPath` function.
4. Update `apps/zhyjen/convex/activities.ts`:
   - Update the 8 Zero language activities to include `"AST Visualizer"` in the tools list.
   - Explicitly reference the AST Graph / Visualizer in the descriptions, steps, or hints of all 8 Zero activities. Ensure at least 3 Zero activities heavily utilize the visualizer in their steps (e.g. `zero-graph-query`, `zero-diagnostics-activity`, `zero-text-projections`).
5. Run build and tests:
   - Run `vp check` inside `apps/zhyjen` and fix any lint or typescript errors.
   - Run `vp test` inside `apps/zhyjen` and make sure they pass.
   - Run `vp exec convex run activities:seedStarterActivities` inside `apps/zhyjen` and verify it executes with exit code 0.

Write a detailed handoff report to `/Users/vantolbennett/Developer/2025/vantolbennett-blog/.agents/worker_milestone2_1/handoff.md` describing what was modified, compiler test results, and command logs.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When completed, report back to the orchestrator.
