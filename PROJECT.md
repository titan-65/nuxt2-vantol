# Project: Zero AST Visualizer & Activities Sync

## Architecture
- **Forge Workspace (`src/forge/ForgeWorkspace.tsx`)**: The main layout. We will split the `.forge-editor-body` layout when the AST Visualizer pane is active.
- **AST Visualizer Component (`src/forge/AstVisualizer.tsx`)**: A new React component that parses or interprets Zero code (or renders live/mock AST node graphs depending on the syntax) and displays nodes and edges dynamically.
- **Convex Activities (`convex/activities.ts`)**: Seeding of 8 Zero-lang activities, which will be updated to guide users on using the AST Graph/Visualizer pane.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|--------------|--------|
| 1 | Explore & Design | Exploration of the codebase, design of visualizer layout and mock/live parser. | None | DONE |
| 2 | AST Visualizer Pane | Implement the split panel layout in ForgeWorkspace and toggle button in the toolbar. | M1 | DONE |
| 3 | AST Graph Render | Build the AstVisualizer component with node/edge visualization support. | M2 | DONE |
| 4 | Sync Activities | Update description/steps in the 8 Zero-lang activities in `activities.ts`. | M3 | DONE |
| 5 | Verify & Audit | Execute seeding mutation, run test commands, run linter, and audit. | M4 | DONE |

## Interface Contracts
### `ForgeWorkspace` ↔ `AstVisualizer`
- `activeFile`: `ForgeFile | null` - the file being edited.
- `astVisualizerOpen`: `boolean` - state controlled by editor toolbar toggle.
