# Plan — Zero AST Visualizer & Activities Sync Validation

We are resuming work on the Zero AST Visualizer & Activities Sync project, where the previous orchestrator was terminated due to resource exhaustion. The predecessor's worker had completed the implementations for:
1. Support for Zero file extension mapping in bundler.
2. Horizontal split pane layout and toolbar toggle in `ForgeWorkspace.tsx`.
3. SVG-based `AstVisualizer.tsx` with dynamic regex parsing for `.0` files, node dependency resolving, highlighting unbound identifiers, and panning/zooming controls.
4. Updates to the 8 Zero language activities in `activities.ts`.
5. Seeding verification test in `src/lessons.verify.test.ts`.

Our goal is to verify, refine, and perform the full validation cycle.

## Steps

### Step 1: Baseline Verification
Spawn a Worker to run `vp check` and `vp test` inside the working directory `apps/zhyjen` to confirm that the code is compiling, formatting is correct, and all existing tests pass.

### Step 2: Implementation Review and Refinement
If there are any failures or gaps, spawn Worker to fix them. Otherwise:
- Spawn Reviewers to review the AST Visualizer integration and activities sync.
- Spawn Challengers to stress test and find any potential React rendering issues, boundary cases, or edge cases.
- Spawn Forensic Auditor to perform integrity audit on the codebase.

### Step 3: Seed and Database Verification
Ensure the activities are correctly seeded to Convex.

### Step 4: Final Hand-off and Synthesis
Write handoff report and notify parent agent of completion.
