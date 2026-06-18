# Handoff Report: AST Visualizer Design for Zhyjen Editor

## 1. Observation
From inspecting the codebase, we observed the following:
* **Workspace Structure:** `apps/zhyjen/src/forge/ForgeWorkspace.tsx` manages the core workspace grid layout:
  ```tsx
  // lines 685-690:
  gridTemplateColumns: `${treeWidth}px 1fr ${contentWidth}px`,
  "--forge-tree-width": `${treeWidth}px`,
  "--forge-content-width": `${contentWidth}px`,
  ```
  The middle column represents the editor pane. The `.forge-editor-pane` container contains `.forge-editor-body` (line 931) which renders `{editorPane}`.
* **Resizing System:** Drag resizing uses a stable pointer capturing callback on resizer elements (lines 386-418).
* **Toolbar Actions:** The editor toolbar actions are defined in `.forge-editor-toolbar-actions` (lines 903-920) which currently features buttons for formatting, opening the command palette, and editor settings.
* **Bundler & Extensions:** `apps/zhyjen/src/forge/bundler.ts` maps extensions to languages in `languageFromPath` (lines 23-42) but does not include the `.0` file extension.
* **Dependencies:** `apps/zhyjen/package.json` contains no heavy visualization or graphing libraries, meaning a lightweight, inline SVG graph renderer is the best architectural fit for `AstVisualizer.tsx` to prevent bloating the package bundle.
* **Zero Language Activities:** `apps/zhyjen/convex/activities.ts` seeds exactly 8 Zero-lang activities in `starterActivities` (lines 406-724):
  1. `zero-graph-query` (Graph Query Explorer)
  2. `zero-daily-loop-practice` (The Daily Loop Practice)
  3. `zero-safe-patching` (Safe Graph Editing)
  4. `zero-text-projections` (Text Projection Roundtrip)
  5. `zero-diagnostics-activity` (Fixing Graph References)
  6. `zero-build-target` (Cross-Compilation Build)
  7. `zero-system-io` (System IO Scripting)
  8. `zero-semantic-merge` (Semantic Git Merge)

---

## 2. Logic Chain
1. **Interactive AST Pane Split:** To split the pane next to the code editor inside `.forge-editor-body` in `ForgeWorkspace.tsx` without breaking the outer tree/sidebar widths, we can set the `.forge-editor-body` element to `display: flex; flexDirection: row`. If the visualizer toggle is active, we insert a vertical `forge-resizer` and the `AstVisualizer` component.
2. **Resizer Math:** The x-coordinate divider between the editor-visualizer container and the right content sidebar is `window.innerWidth - contentWidth`. During drag-resizing of the visualizer pane, the visualizer width can be calculated as `(window.innerWidth - contentWidth) - e.clientX`.
3. **UI Toggle Button:** Adding a button with the `Network` icon from `lucide-react` to `.forge-editor-toolbar-actions` matches the visual aesthetics of the editor toolbar and provides an intuitive toggle.
4. **AstVisualizer Component:** Designing `AstVisualizer.tsx` as an independent component receiving the active file's `path`, `code`, and `language` allows it to decide whether to show a tip/placeholder (for non-Zero files) or parse the text (for `.0` files). In Zero mode, a regex-based parser will extract functions, variable assignments, calls, and reference dependencies, rendering them in SVG with an interactive inspector.
5. **Activity Alignment:** Updating the 8 Zero language activities in `convex/activities.ts` to reference the AST Graph Visualizer in their steps, hints, and descriptions ensures students utilize the visualizer to navigate semantic graph structures.

---

## 3. Caveats
* **Frontend Parser limitations:** The regex-based parser in the frontend is a mock/live parser that extracts semantic structures from projection text. It does not replace the CLI-based `zero compiler` graph parser, but serves as a real-time reactive graph preview in the browser.
* **Layout on Mobile:** In narrow viewports (< 1020px), `ForgeWorkspace.tsx` wraps columns to a 2x2 grid (lines 763-799). The visualizer should automatically hide or stack when layout wrapping triggers to maintain responsive usability.

---

## 4. Conclusion & Design Proposals

### Proposal A: Editor Split & Toggle in `ForgeWorkspace.tsx`

#### 1. State and Resizing Handlers
Add states for visualizer toggle and width:
```typescript
const [showVisualizer, setShowVisualizer] = useState(false);
const [visualizerWidth, setVisualizerWidth] = useState(300);
```
Add `"visualizer"` to the resizing state and update the resize handlers:
```typescript
// Update resizing type:
const [resizing, setResizing] = useState<"tree" | "content" | "visualizer" | null>(null);

// Update handleResizePointerMove:
const handleResizePointerMove = useCallback(
  (e: React.PointerEvent<HTMLDivElement>) => {
    if (resizing === "tree") {
      setTreeWidth(Math.max(160, Math.min(400, e.clientX)));
    } else if (resizing === "content") {
      setContentWidth(Math.max(260, Math.min(600, window.innerWidth - e.clientX)));
    } else if (resizing === "visualizer") {
      const rightBoundary = window.innerWidth - contentWidth;
      setVisualizerWidth(Math.max(150, Math.min(600, rightBoundary - e.clientX)));
    }
  },
  [resizing, contentWidth],
);
```

#### 2. Toolbar Toggle Button
Inside the toolbar actions block (`.forge-editor-toolbar-actions`), append the toggle button:
```tsx
<button
  type="button"
  onClick={() => setShowVisualizer(!showVisualizer)}
  className={showVisualizer ? "active" : ""}
  title={showVisualizer ? "Hide AST Visualizer" : "Show AST Visualizer"}
>
  <Network size={14} />
</button>
```

#### 3. Editor Body Split Layout
Update `.forge-editor-body` layout to render `AstVisualizer` side-by-side with the editor:
```tsx
<div 
  className="forge-editor-body" 
  style={{ display: "flex", flexDirection: "row", height: "100%", position: "relative" }}
>
  <div style={{ flex: 1, minWidth: 0, height: "100%" }}>
    {editorPane}
  </div>
  
  {showVisualizer && (
    <>
      <div
        className={`forge-resizer left ${resizing === "visualizer" ? "active" : ""}`}
        onPointerDown={handleResizePointerDown("visualizer")}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize AST Visualizer"
        title="Drag to resize the AST Visualizer"
        style={{ position: "relative", left: "auto", right: "auto", cursor: "col-resize" }}
      />
      <div 
        style={{ 
          width: `${visualizerWidth}px`, 
          minWidth: "150px", 
          height: "100%", 
          background: "var(--panel)", 
          borderLeft: "1px solid var(--border)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden" 
        }}
      >
        <AstVisualizer
          path={activeFile?.path ?? ""}
          code={activeFile?.content ?? ""}
          language={activeFile?.language ?? ""}
        />
      </div>
    </>
  )}
</div>
```

---

### Proposal B: The `AstVisualizer.tsx` Component
Create a new file `apps/zhyjen/src/forge/AstVisualizer.tsx`:

```tsx
import React, { useMemo, useState } from "react";
import { Network, Info, Code, AlertTriangle } from "lucide-react";

export type AstVisualizerProps = {
  path: string;
  code: string;
  language: string;
};

interface AstNode {
  id: string;
  type: string;
  label: string;
  fields: Record<string, string>;
  x: number;
  y: number;
}

interface AstEdge {
  id: string;
  source: string;
  target: string;
  label: string;
}

export function AstVisualizer({ path, code, language }: AstVisualizerProps) {
  const isZeroFile = useMemo(() => {
    return path.endsWith(".0") || language === "zero";
  }, [path, language]);

  const [selectedNode, setSelectedNode] = useState<AstNode | null>(null);

  const { nodes, edges, parseError } = useMemo(() => {
    if (!isZeroFile) return { nodes: [], edges: [], parseError: null };

    const parsedNodes: AstNode[] = [];
    const parsedEdges: AstEdge[] = [];
    let err: string | null = null;

    try {
      // Root Node placement
      parsedNodes.push({
        id: "#root",
        type: "Program",
        label: path.split("/").pop() || "main.0",
        fields: { path },
        x: 200,
        y: 40,
      });

      // Simple regex-based lexical parser for .0 projection syntax
      const fnRegex = /fn\s+(\w+)\s*\(([^)]*)\)\s*\{([^}]*)\}/g;
      let match;
      let fnIndex = 0;
      let xOffset = 100;

      while ((match = fnRegex.exec(code)) !== null) {
        const [_, fnName, params, body] = match;
        const fnId = `#decl_${fnName}`;
        
        parsedNodes.push({
          id: fnId,
          type: "FunctionDeclaration",
          label: `fn ${fnName}`,
          fields: { name: fnName, params: params || "none" },
          x: xOffset + fnIndex * 200,
          y: 120,
        });

        parsedEdges.push({
          id: `edge-root-${fnId}`,
          source: "#root",
          target: fnId,
          label: "decl",
        });

        const lines = body.split(";");
        let stmtIndex = 0;
        lines.forEach((line) => {
          const trimmed = line.trim();
          if (!trimmed) return;

          // Match let assignments: let x = "y"
          const varMatch = /let\s+(\w+)\s*=\s*(.+)/.exec(trimmed);
          if (varMatch) {
            const [_, varName, varValue] = varMatch;
            const varId = `#var_${fnName}_${varName}`;
            
            parsedNodes.push({
              id: varId,
              type: "VariableAssignment",
              label: `let ${varName}`,
              fields: { name: varName, value: varValue },
              x: xOffset + fnIndex * 200 - 60 + stmtIndex * 60,
              y: 220,
            });

            parsedEdges.push({
              id: `edge-${fnId}-${varId}`,
              source: fnId,
              target: varId,
              label: "body",
            });
          }

          // Match function calls: print(x)
          const callMatch = /(\w+)\s*\(([^)]*)\)/.exec(trimmed);
          if (callMatch && !trimmed.startsWith("let")) {
            const [_, callName, callArgs] = callMatch;
            const callId = `#call_${fnName}_${callName}_${stmtIndex}`;
            
            parsedNodes.push({
              id: callId,
              type: "FunctionCall",
              label: `${callName}()`,
              fields: { callee: callName, arguments: callArgs },
              x: xOffset + fnIndex * 200 + 60 + stmtIndex * 60,
              y: 220,
            });

            parsedEdges.push({
              id: `edge-${fnId}-${callId}`,
              source: fnId,
              target: callId,
              label: "body",
            });

            // If argument is a reference to a variable, draw reference edge
            if (callArgs && !callArgs.startsWith('"') && !callArgs.match(/^\d+$/)) {
              const refId = `#var_${fnName}_${callArgs.trim()}`;
              parsedEdges.push({
                id: `edge-${callId}-${refId}`,
                source: callId,
                target: refId,
                label: "arg",
              });
            }
          }
          stmtIndex++;
        });
        fnIndex++;
      }

      if (parsedNodes.length === 1) {
        parsedNodes.push({
          id: "#empty_placeholder",
          type: "EmptyGraph",
          label: "Empty Graph",
          fields: { status: "No functions declared in this .0 file yet." },
          x: 200,
          y: 150,
        });
        parsedEdges.push({
          id: "edge-root-empty",
          source: "#root",
          target: "#empty_placeholder",
          label: "state",
        });
      }
    } catch (e) {
      err = e instanceof Error ? e.message : "Failed to parse Zero file.";
    }

    return { nodes: parsedNodes, edges: parsedEdges, parseError: err };
  }, [code, path, isZeroFile]);

  if (!isZeroFile) {
    return (
      <div className="ast-visualizer-placeholder" style={{ padding: "24px", textAlign: "center", color: "var(--muted)" }}>
        <Network size={48} style={{ margin: "24px auto", color: "var(--muted-strong)" }} />
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 8px", color: "var(--text)" }}>AST Graph Visualizer</h3>
        <p style={{ fontSize: "0.82rem", lineHeight: 1.5 }}>
          Open a Zero (<code>.0</code>) file to visualize its abstract syntax tree graph database in real-time.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ padding: "10px 12px", borderBottom: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", color: "var(--muted)" }}>AST Graph Visualizer</span>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: "rgba(0,0,0,0.1)" }}>
        <svg viewBox="0 0 400 350" width="100%" height="100%">
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--muted)" />
            </marker>
          </defs>

          {/* Draw Edges */}
          {edges.map((edge) => {
            const sourceNode = nodes.find((n) => n.id === edge.source);
            const targetNode = nodes.find((n) => n.id === edge.target);
            if (!sourceNode || !targetNode) return null;

            return (
              <g key={edge.id}>
                <line
                  x1={sourceNode.x}
                  y1={sourceNode.y}
                  x2={targetNode.x}
                  y2={targetNode.y}
                  stroke="var(--border)"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                  strokeDasharray={edge.label === "arg" ? "3 3" : "none"}
                />
                <text
                  x={(sourceNode.x + targetNode.x) / 2}
                  y={(sourceNode.y + targetNode.y) / 2 - 4}
                  textAnchor="middle"
                  fill="var(--muted)"
                  fontSize="9"
                >
                  {edge.label}
                </text>
              </g>
            );
          })}

          {/* Draw Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            let strokeColor = "rgba(255,255,255,0.1)";
            let fillColor = "rgba(255,255,255,0.05)";
            if (node.id === "#root") {
              strokeColor = "rgba(59, 130, 246, 0.5)";
              fillColor = "rgba(59, 130, 246, 0.1)";
            } else if (node.type === "FunctionDeclaration") {
              strokeColor = "rgba(139, 92, 246, 0.5)";
              fillColor = "rgba(139, 92, 246, 0.1)";
            } else if (node.type === "VariableAssignment") {
              strokeColor = "rgba(16, 185, 129, 0.5)";
              fillColor = "rgba(16, 185, 129, 0.1)";
            } else if (node.type === "FunctionCall") {
              strokeColor = "rgba(245, 158, 11, 0.5)";
              fillColor = "rgba(245, 158, 11, 0.1)";
            }

            return (
              <g key={node.id} transform={`translate(${node.x},${node.y})`} onClick={() => setSelectedNode(node)} style={{ cursor: "pointer" }}>
                <rect
                  x="-45"
                  y="-15"
                  width="90"
                  height="30"
                  rx="6"
                  fill={fillColor}
                  stroke={isSelected ? "var(--accent)" : strokeColor}
                  strokeWidth={isSelected ? 2 : 1}
                />
                <text textAnchor="middle" dy="3" fontSize="10" fill="var(--text)">
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Inspector Details */}
      <div style={{ borderTop: "1px solid var(--border)", padding: "12px", height: "120px", overflowY: "auto", background: "var(--panel)" }}>
        {selectedNode ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 600 }}>{selectedNode.id}</span>
              <span style={{ fontSize: "0.7rem", opacity: 0.6 }}>{selectedNode.type}</span>
            </div>
            {Object.entries(selectedNode.fields).map(([k, v]) => (
              <div key={k} style={{ fontSize: "0.75rem", display: "flex", gap: "8px" }}>
                <span style={{ opacity: 0.5, width: "60px" }}>{k}:</span>
                <code>{v}</code>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: "0.75rem", color: "var(--muted)", textAlign: "center", paddingTop: "12px" }}>
            Select a node in the graph to inspect its AST fields.
          </div>
        )}
      </div>
    </div>
  );
}
```

#### 4. Add Monaco/Language Mapping Support
Update `apps/zhyjen/src/forge/bundler.ts` inside `languageFromPath` to recognize `.0` files as language `"zero"`:
```typescript
    case "0":
    case "zero":
      return "zero";
```

---

### Proposal C: Aligning Convex Activities
Update the 8 Zero-lang activities in `apps/zhyjen/convex/activities.ts` to reference the AST Graph Visualizer:

1. **Graph Query Explorer (`zero-graph-query`)**
   * **Update Description:** "Use the `zero query` command and the AST Graph Visualizer to explore a program graph and identify its AST nodes."
   * **Update Steps:** Add: "Toggle the AST Graph Visualizer in the editor toolbar to view the live graph representation of your `.0` file."
   * **Update Hints:** Add: "Open the AST Graph Visualizer split pane next to the code editor to view the declaration, param list, and block nodes visually."

2. **The Daily Loop Practice (`zero-daily-loop-practice`)**
   * **Update Steps:** Add: "Toggle the AST Visualizer from the toolbar to track node state changes as you patch the graph."
   * **Update Hints:** Add: "Watch the AST Visualizer update live when the Zero compiler processes each patch."

3. **Safe Graph Editing (`zero-safe-patching`)**
   * **Update Description:** "Write explicit graph patches using hash expectation guards and track node hashes in the AST Visualizer."
   * **Update Steps:** Add: "Verify the literal node hash in the AST Visualizer before constructing your expectation guard."
   * **Update Hints:** Add: "The AST Visualizer highlights node hashes and graph states, making it easy to fetch values for `--expect-graph-hash`."

4. **Text Projection Roundtrip (`zero-text-projections`)**
   * **Update Description:** "Export the graph to readable text, make edits in an IDE, and observe the live changes in the AST Visualizer split pane."
   * **Update Steps:** Add: "Open `src/main.0` with the AST Visualizer active. Observe how changes in text are reflected in the visualizer upon import."
   * **Update Hints:** Add: "The AST Visualizer renders a generic placeholder if the projection has syntax errors, but updates with live Zero nodes once imported successfully."

5. **Fixing Graph References (`zero-diagnostics-activity`)**
   * **Update Description:** "Use the `zero check` diagnostic tools and the AST Visualizer to identify and repair a dangling edge."
   * **Update Steps:** Add: "Look at the AST Visualizer, where dangling edges or unbound references are highlighted in red."
   * **Update Hints:** Add: "Dangling edges show up as disconnected red nodes/edges in the AST Visualizer. Use `zero patch` to connect them."

6. **Cross-Compilation Build (`zero-build-target`)**
   * **Update Hints:** Add: "Verify the compilation readiness by reviewing the complete AST tree representation in the AST Visualizer."

7. **System IO Scripting (`zero-system-io`)**
   * **Update Steps:** Add: "Import `std::env` and `std::io` modules and see how these import nodes link to your main routine in the AST Visualizer."

8. **Semantic Git Merge (`zero-semantic-merge`)**
   * **Update Steps:** Add: "Open the conflicted project and use the AST Visualizer to visually compare the conflicting node branches before resolving."
   * **Update Hints:** Add: "The AST Visualizer can highlight the merged node graph structure once `zero merge` has finished successfully."

---

## 5. Verification Method
1. **Compilation Check:** Run `vp check` in `apps/zhyjen` to verify there are no TypeScript, lint, or syntax errors:
   ```bash
   vp check
   ```
2. **Tests Verification:** Run `vp test` in `apps/zhyjen` to verify that existing test suites pass:
   ```bash
   vp test
   ```
3. **Workspace Verification:** Run `vp dev` to start the local zhyjen server and navigate to `/forge?activity=zero-graph-query`. Verify that:
   * The editor toolbar displays the `Network` icon to toggle the AST Visualizer.
   * Clicking the `Network` icon successfully splits the editor body, displaying the visualizer on the right.
   * Opening a `.0` file displays the SVG AST nodes (Root, Fns, Vars, Calls) and links them.
   * Clicking on a node shows its detailed fields in the lower inspector panel.
   * Opening non-zero files displays the generic placeholder text.
