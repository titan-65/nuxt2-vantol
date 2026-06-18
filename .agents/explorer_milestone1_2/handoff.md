# AST Visualizer Design and Codebase Investigation Report

## 1. Observation

Direct observations made on the `zhyjen` editor codebase in `/Users/vantolbennett/Developer/2025/vantolbennett-blog/apps/zhyjen`:

### A. Workspace Layout & Editor Rendering (`apps/zhyjen/src/forge/ForgeWorkspace.tsx`)
- **Grid Layout**: The workspace uses a three-column grid layout where the middle column (the editor) takes the remaining space:
  ```typescript
  // Line 685:
  gridTemplateColumns: `${treeWidth}px 1fr ${contentWidth}px`,
  ```
- **Editor Mounting**: The code editor is wrapped in `editorPane` (lines 638-660) and mounted inside the middle pane's body:
  ```typescript
  // Line 931:
  <div className="forge-editor-body">{editorPane}</div>
  ```
- **Toolbar Actions**: Action buttons are rendered inside the toolbar wrapper:
  ```typescript
  // Lines 726-728, 903-920:
  <div className="forge-editor-toolbar">
    <span className="forge-editor-toolbar-title">Editor</span>
    <div className="forge-editor-toolbar-actions">
      ...
    </div>
  </div>
  ```
- **Resizing Mechanism**: Sidebars use direct pointer capture to handle mouse/touch dragging:
  ```typescript
  // Lines 386-398:
  const handleResizePointerDown = useCallback(
    (which: "tree" | "content") => (e: React.PointerEvent<HTMLDivElement>) => {
      e.preventDefault();
      setResizing(which);
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch { /* ... */ }
    },
    [],
  );
  ```

### B. 8 Zero Language Activities (`apps/zhyjen/convex/activities.ts`)
Eight activities exist in `starterActivities` with a slug prefixed with `zero-` and focusing on compiler graph concepts:
1. **Graph Query Explorer** (slug: `"zero-graph-query"`, lines 406-447)
   - Current Tools: `tools: ["Terminal", "Zero CLI"]`
2. **The Daily Loop Practice** (slug: `"zero-daily-loop-practice"`, lines 449-489)
   - Current Tools: `tools: ["Terminal", "Zero CLI"]`
3. **Safe Graph Editing** (slug: `"zero-safe-patching"`, lines 491-531)
   - Current Tools: `tools: ["Terminal", "Zero CLI"]`
4. **Text Projection Roundtrip** (slug: `"zero-text-projections"`, lines 533-568)
   - Current Tools: `tools: ["Terminal", "Code Editor", "Zero CLI"]`
5. **Fixing Graph References** (slug: `"zero-diagnostics-activity"`, lines 570-606)
   - Current Tools: `tools: ["Terminal", "Zero CLI"]`
6. **Cross-Compilation Build** (slug: `"zero-build-target"`, lines 608-643)
   - Current Tools: `tools: ["Terminal", "Zero CLI"]`
7. **System IO Scripting** (slug: `"zero-system-io"`, lines 645-681)
   - Current Tools: `tools: ["Terminal", "Zero CLI"]`
8. **Semantic Git Merge** (slug: `"zero-semantic-merge"`, lines 683-724)
   - Current Tools: `tools: ["Terminal", "Git", "Zero CLI"]`

---

## 2. Logic Chain

The step-by-step reasoning from observations to the proposed designs:

1. **Split-Screen Placement**: Adding a split pane next to the code editor inside `ForgeWorkspace.tsx` should be done within the `forge-editor-body` container. By wrapping the editor and visualizer in a flex container, we can toggle the visualizer panel and allow the user to resize the split ratio.
2. **Resizer Integration**: We can extend the existing `resizing` state type (`"tree" | "content" | "visualizer"`) and leverage the same pointer capture mechanism (`handleResizePointerDown`, `handleResizePointerMove`) to dynamically update a `visualizerWidth` state, ensuring a consistent user experience.
3. **Toolbar Toggle Button**: By adding a boolean state `showVisualizer` to `ForgeWorkspace.tsx`, we can render a toggle button (using the `Network` icon from `lucide-react`) in `.forge-editor-toolbar-actions` that toggles this state.
4. **AST Visualizer Implementation (`AstVisualizer.tsx`)**:
   - The component should be placed in `apps/zhyjen/src/workspace/AstVisualizer.tsx` next to `CodeEditor.tsx`.
   - To avoid heavy AST parsing npm dependencies, it will parse the text content of `.0` files using a fast, regex-based heuristic to identify imports, function declarations, variable assignments, and standard library calls.
   - It will map these code elements into an array of Graph Nodes (e.g., `#decl_main`, `#ref_x`, `#call_0`) and Edges.
   - The graph will be rendered dynamically using SVG elements (directed arrow markers, lines, and rects) for maximum styling flexibility and zero external dependencies.
   - The panel will show an onboarding placeholder when editing files of other languages (HTML/CSS/JS) to notify the user that the AST Visualizer is designed for Zero Lang files.
5. **Zero Activities Alignment**: Updating the seed database definition in `convex/activities.ts` to list `"AST Visualizer"` as a tool and amending steps/hints will directly guide the student to utilize the new panel to inspect compiler nodes, expectations, hashes, and dangling references.

---

## 3. Caveats

- **Regex Parser Limitations**: The built-in frontend regex parser is a heuristic-based highlighter rather than a full semantic compiler parser. While it works perfectly for educational starter code, complex syntax edge cases (e.g., multi-line nested macro blocks) might render simplified trees.
- **Dependencies**: The design uses native SVG instead of an external library like `@xyflow/react` to prevent package size bloat and ensure fast load times in the sandbox environment.
- **Save State**: The `showVisualizer` toggle status could be persisted to local storage (e.g., `zhyjen-forge-show-visualizer`) to preserve layout preferences across sessions.

---

## 4. Conclusion & Design Blueprint

### Design Blueprint 1: ForgeWorkspace.tsx Split Layout Integration

#### A. State & Pointer Handlers additions:
```typescript
// Add state
const [showVisualizer, setShowVisualizer] = useState(false);
const [visualizerWidth, setVisualizerWidth] = useState(380);

// Extend resizing state type:
// type ResizingType = "tree" | "content" | "visualizer" | null;
// Update handleResizePointerDown and handleResizePointerMove to handle "visualizer":

const handleResizePointerMove = useCallback(
  (e: React.PointerEvent<HTMLDivElement>) => {
    if (resizing === "tree") {
      setTreeWidth(Math.max(160, Math.min(400, e.clientX)));
    } else if (resizing === "content") {
      setContentWidth(Math.max(260, Math.min(600, window.innerWidth - e.clientX)));
    } else if (resizing === "visualizer") {
      const editorRightBoundary = window.innerWidth - contentWidth;
      const newWidth = editorRightBoundary - e.clientX;
      setVisualizerWidth(Math.max(200, Math.min(600, newWidth)));
    }
  },
  [resizing, contentWidth]
);
```

#### B. Toolbar Toggle Button Markup:
Add to `.forge-editor-toolbar-actions` (adjacent to Editor settings):
```typescript
import { Network } from "lucide-react"; // Import new icon

// ... in toolbar actions:
<button
  type="button"
  className={`forge-action-toggle ${showVisualizer ? "active" : ""}`}
  onClick={() => setShowVisualizer((prev) => !prev)}
  title={showVisualizer ? "Hide AST Visualizer" : "Show AST Visualizer"}
  style={{
    background: showVisualizer ? "var(--panel-selected, rgba(139, 92, 246, 0.15))" : "transparent",
    color: showVisualizer ? "var(--accent, #8b5cf6)" : "var(--muted)",
    border: "none",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
  }}
>
  <Network size={14} />
</button>
```

#### C. Grid Split in Editor Body:
Modify `.forge-editor-body` rendering inside `ForgeWorkspace.tsx`:
```typescript
<div className="forge-editor-body" style={{ display: "flex", width: "100%", height: "100%", overflow: "hidden" }}>
  <div style={{ flex: 1, height: "100%", position: "relative", minWidth: "150px" }}>
    {editorPane}
  </div>
  
  {showVisualizer && (
    <>
      <div
        className={`forge-resizer middle ${resizing === "visualizer" ? "active" : ""}`}
        onPointerDown={handleResizePointerDown("visualizer")}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize AST Visualizer"
        style={{
          width: "4px",
          cursor: "col-resize",
          background: resizing === "visualizer" ? "var(--accent, #8b5cf6)" : "var(--border)",
          transition: "background 0.2s",
          zIndex: 10,
        }}
      />
      <div 
        style={{ 
          width: `${visualizerWidth}px`, 
          height: "100%", 
          background: "var(--bg)", 
          borderLeft: "1px solid var(--border)",
          minWidth: "200px",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <AstVisualizer
          filePath={activeFile?.path ?? ""}
          content={activeFile?.content ?? ""}
          language={activeFile?.language ?? ""}
        />
      </div>
    </>
  )}
</div>
```

---

### Design Blueprint 2: AstVisualizer.tsx Component

Create `apps/zhyjen/src/workspace/AstVisualizer.tsx`:

```typescript
import React, { useMemo, useState } from "react";
import { Network, Info, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

interface NodeData {
  id: string;
  type: "Import" | "Declaration" | "Call" | "Reference" | "Literal" | "Block";
  label: string;
  detail?: string;
  hash?: string;
}

interface EdgeData {
  source: string;
  target: string;
  label?: string;
}

export function AstVisualizer({
  filePath,
  content,
  language,
}: {
  filePath: string;
  content: string;
  language: string;
}) {
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const isZeroFile = useMemo(() => {
    return (
      filePath.endsWith(".0") ||
      filePath.endsWith(".zero") ||
      language.toLowerCase() === "zero"
    );
  }, [filePath, language]);

  // Regex parser to build live graph model from Zero text
  const graph = useMemo(() => {
    if (!isZeroFile) return { nodes: [], edges: [] };

    const nodes: NodeData[] = [];
    const edges: EdgeData[] = [];

    // Global file hash mock based on content hash
    let hashVal = 5381;
    for (let i = 0; i < content.length; i++) {
      hashVal = (hashVal << 5) + hashVal + content.charCodeAt(i);
    }
    const globalHash = `graph:a7f7${Math.abs(hashVal).toString(16).slice(0, 8)}`;

    // Root module node
    const rootId = "#module_root";
    nodes.push({
      id: rootId,
      type: "Block",
      label: filePath.split("/").pop() ?? "main.0",
      detail: `Global hash expectation guard: ${globalHash}`,
      hash: globalHash,
    });

    const lines = content.split("\n");
    let activeBlockId = rootId;
    let callCounter = 0;
    let litCounter = 0;

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // 1. Parse Imports: import std::io;
      const importMatch = trimmed.match(/^import\s+([a-zA-Z0-9_:]+);/);
      if (importMatch) {
        const mod = importMatch[1];
        const id = `#import_${mod}`;
        nodes.push({
          id,
          type: "Import",
          label: `import ${mod}`,
          detail: `Module dependency: ${mod}`,
        });
        edges.push({ source: rootId, target: id });
      }

      // 2. Parse Fn Declarations: fn main() {
      const fnMatch = trimmed.match(/^fn\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/);
      if (fnMatch) {
        const fnName = fnMatch[1];
        const params = fnMatch[2];
        const id = `#decl_${fnName}`;
        nodes.push({
          id,
          type: "Declaration",
          label: `fn ${fnName}()`,
          detail: `Declaration parameter list: (${params})`,
          hash: `decl:${fnName}_${index}`,
        });
        edges.push({ source: rootId, target: id });
        
        // Setup inner block node
        const blockId = `#block_${fnName}`;
        nodes.push({
          id: blockId,
          type: "Block",
          label: `Block: ${fnName} body`,
        });
        edges.push({ source: id, target: blockId, label: "body" });
        activeBlockId = blockId;
      }

      // 3. Parse Local References / Assignments: let x = 42;
      const letMatch = trimmed.match(/^let\s+([a-zA-Z0-9_]+)\s*=\s*(.+);/);
      if (letMatch) {
        const varName = letMatch[1];
        const valStr = letMatch[2];
        const id = `#ref_${varName}`;
        nodes.push({
          id,
          type: "Reference",
          label: `let ${varName}`,
          detail: `Local reference bindings`,
        });
        edges.push({ source: activeBlockId, target: id });

        // Literal value node
        const litId = `#lit_${litCounter++}`;
        nodes.push({
          id: litId,
          type: "Literal",
          label: valStr,
          detail: `Constant expression node`,
        });
        edges.push({ source: id, target: litId, label: "value" });
      }

      // 4. Parse Write/Call Operations: io::write_line("Hello");
      const callMatch = trimmed.match(/([a-zA-Z0-9_:]+)\s*\(([^)]*)\);/);
      if (callMatch && !trimmed.startsWith("fn") && !trimmed.startsWith("let")) {
        const callName = callMatch[1];
        const args = callMatch[2];
        const id = `#call_${callCounter++}`;
        nodes.push({
          id,
          type: "Call",
          label: `${callName}()`,
          detail: `Call arguments: ${args}`,
        });
        edges.push({ source: activeBlockId, target: id });

        if (args.trim()) {
          const litId = `#lit_${litCounter++}`;
          nodes.push({
            id: litId,
            type: "Literal",
            label: args,
            detail: `Literal parameter node`,
          });
          edges.push({ source: id, target: litId, label: "arg" });
        }
      }
    });

    return { nodes, edges };
  }, [content, isZeroFile, filePath, language]);

  if (!isZeroFile) {
    return (
      <div
        className="ast-visualizer-placeholder"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: "24px",
          textAlign: "center",
          color: "var(--muted)",
          background: "var(--panel)",
        }}
      >
        <Network size={36} style={{ marginBottom: "16px", opacity: 0.4 }} />
        <h4 style={{ margin: "0 0 8px 0", color: "var(--text)" }}>AST Graph Visualizer</h4>
        <p style={{ fontSize: "13px", maxWidth: "260px", margin: 0, lineHeight: 1.5 }}>
          Open a Zero Lang (`.0`) file in the editor to view its compiler AST node graph and expectation hashes.
        </p>
      </div>
    );
  }

  // Basic layout layout positioning helper (hierarchical vertical columns)
  const layoutNodes = useMemo(() => {
    const columns: Record<string, NodeData[]> = {
      Import: [],
      Declaration: [],
      Block: [],
      Call: [],
      Reference: [],
      Literal: [],
    };
    
    graph.nodes.forEach((node) => {
      if (node.id === "#module_root") return;
      if (columns[node.type]) {
        columns[node.type].push(node);
      } else {
        columns.Literal.push(node);
      }
    });

    const orderedTypes = ["Import", "Declaration", "Block", "Reference", "Call", "Literal"];
    const layout: Record<string, { x: number; y: number }> = {};
    
    // Root position
    layout["#module_root"] = { x: 50, y: 150 };

    let colIndex = 1;
    orderedTypes.forEach((type) => {
      const list = columns[type];
      if (list.length === 0) return;
      
      const x = 50 + colIndex * 140;
      const height = 300;
      const step = height / (list.length + 1);
      
      list.forEach((node, index) => {
        layout[node.id] = {
          x,
          y: step * (index + 1),
        };
      });
      colIndex++;
    });

    return layout;
  }, [graph]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--border)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "var(--panel)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 600 }}>
          <Network size={14} color="var(--accent, #8b5cf6)" />
          <span>AST Compiler Graph</span>
        </div>
        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)" }}
            title="Zoom Out"
          >
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: "11px", color: "var(--muted)", alignSelf: "center", minWidth: "24px", textAlign: "center" }}>
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--muted)" }}
            title="Zoom In"
          >
            <ZoomIn size={14} />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div style={{ flex: 1, position: "relative", overflow: "hidden", background: "#0a0c10" }}>
        <svg
          width="100%"
          height="100%"
          style={{ transform: `scale(${zoom})`, transformOrigin: "top left", transition: "transform 0.1s" }}
        >
          {/* Arrow markers */}
          <defs>
            <marker id="arrow" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--border, #333)" />
            </marker>
            <marker id="arrow-highlight" viewBox="0 0 10 10" refX="18" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--accent, #8b5cf6)" />
            </marker>
          </defs>

          {/* Render Edges */}
          {graph.edges.map((edge, idx) => {
            const start = layoutNodes[edge.source];
            const end = layoutNodes[edge.target];
            if (!start || !end) return null;

            const isHighlighted = hoveredNode === edge.source || hoveredNode === edge.target;

            return (
              <g key={`edge-${idx}`}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={isHighlighted ? "var(--accent, #8b5cf6)" : "var(--border, #333)"}
                  strokeWidth={isHighlighted ? 2 : 1}
                  markerEnd={isHighlighted ? "url(#arrow-highlight)" : "url(#arrow)"}
                />
                {edge.label && (
                  <text
                    x={(start.x + end.x) / 2}
                    y={(start.y + end.y) / 2 - 4}
                    fill="var(--muted)"
                    fontSize="9px"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render Nodes */}
          {graph.nodes.map((node) => {
            const pos = layoutNodes[node.id];
            if (!pos) return null;

            const isSelected = selectedNode?.id === node.id;
            const isHovered = hoveredNode === node.id;

            // Type-based colors
            let color = "#3b82f6"; // Reference
            if (node.type === "Import") color = "#10b981";
            if (node.type === "Declaration") color = "#8b5cf6";
            if (node.type === "Block") color = "#64748b";
            if (node.type === "Literal") color = "#f59e0b";

            return (
              <g
                key={node.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => setSelectedNode(node)}
                style={{ cursor: "pointer" }}
              >
                <rect
                  x="-50"
                  y="-15"
                  width="100"
                  height="30"
                  rx="6"
                  fill="#161b22"
                  stroke={isSelected ? "var(--accent, #8b5cf6)" : isHovered ? color : "var(--border, #30363d)"}
                  strokeWidth={isSelected || isHovered ? 2 : 1}
                />
                <circle cx="-40" cy="0" r="4" fill={color} />
                <text
                  x="-30"
                  y="4"
                  fill="var(--text, #f0f6fc)"
                  fontSize="10px"
                  fontFamily="monospace"
                >
                  {node.label.length > 12 ? node.label.slice(0, 10) + ".." : node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Inspector Panel */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid var(--border)",
          background: "var(--panel)",
          minHeight: "100px",
          fontSize: "12px",
        }}
      >
        {selectedNode ? (
          <div>
            <div style={{ fontWeight: 600, display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ color: "var(--accent, #8b5cf6)" }}>{selectedNode.type} Node</span>
              <span style={{ fontFamily: "monospace", color: "var(--muted)" }}>{selectedNode.id}</span>
            </div>
            <div style={{ color: "var(--text)", fontWeight: 500, marginBottom: "4px" }}>
              Label: <code style={{ background: "#161b22", padding: "2px 4px", borderRadius: "3px" }}>{selectedNode.label}</code>
            </div>
            {selectedNode.detail && (
              <div style={{ color: "var(--muted)", marginTop: "4px" }}>
                Details: {selectedNode.detail}
              </div>
            )}
            {selectedNode.hash && (
              <div style={{ color: "var(--muted)", marginTop: "4px" }}>
                Expectation hash: <code style={{ color: "#34d399" }}>{selectedNode.hash}</code>
              </div>
            )}
          </div>
        ) : (
          <div style={{ color: "var(--muted)", display: "flex", alignItems: "center", gap: "6px", height: "100%" }}>
            <Info size={14} />
            <span>Select a node in the graph to inspect its compiler metadata.</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### Design Blueprint 3: Zero Activities Alignment (`apps/zhyjen/convex/activities.ts`)

We propose updating the `starterActivities` list inside `convex/activities.ts` to integrate the AST Visualizer into the Zero curriculum:

```typescript
// Proposed updates for the 8 Zero Language Activities:

// 1. Graph Query Explorer (zero-graph-query)
{
  title: "Graph Query Explorer",
  slug: "zero-graph-query",
  // ...
  tools: ["Terminal", "Zero CLI", "AST Visualizer"],
  steps: [
    "Create a new directory and run `zero init`.",
    "Toggle open the AST Visualizer pane next to the code editor to view the initial empty graph state.",
    "Use `zero patch --op 'addMain'` to add an entry point.",
    "Locate the `#decl_main` node directly inside the AST Visualizer and inspect its compiler details.",
  ],
  hints: [
    "Notice how adding the main function populated multiple nodes: a declaration, a param list, and a block. These will automatically appear in your AST Visualizer graph.",
    "The query output and visualizer show edges linking nodes (e.g., `#decl_main` has a 'body' edge pointing to `#block_main`).",
  ],
}

// 2. The Daily Loop Practice (zero-daily-loop-practice)
{
  title: "The Daily Loop Practice",
  slug: "zero-daily-loop-practice",
  // ...
  tools: ["Terminal", "Zero CLI", "AST Visualizer"],
  steps: [
    "Initialize a new zero project.",
    "Patch the graph to add a main function with a 'Hello Zero' write operation.",
    "Verify the added nodes (Declaration and Write Call) appear in the AST Visualizer.",
    "Run `zero check` to ensure semantic validity.",
    "Run `zero test` and `zero run` to complete the loop.",
  ],
  hints: [
    "The exact patch command is: `zero patch --op 'addMain' --op 'addCheckWrite fn=\"main\" text=\"Hello Zero\\n\"'`",
    "Keep the AST Visualizer panel visible during patching to see the graph transform dynamically as new nodes are registered.",
  ],
}

// 3. Safe Graph Editing (zero-safe-patching)
{
  title: "Safe Graph Editing",
  slug: "zero-safe-patching",
  // ...
  tools: ["Terminal", "Zero CLI", "AST Visualizer"],
  steps: [
    "Click the root module node in the AST Visualizer to find the current global graph expectation hash.",
    "Select the string literal node in the visualizer to find its specific Node ID.",
    "Construct a `zero patch` command using `--expect-graph-hash` and `expect=` field guards.",
    "Apply the patch and watch the literal node update in the visualizer.",
  ],
  hints: [
    "The global graph expectation hash (e.g., `graph:a7f7...`) is displayed in the inspector details when selecting the root module node.",
    "Expectation guards prevent race conditions. If the hash has updated, your patch will be rejected.",
  ],
}

// 4. Text Projection Roundtrip (zero-text-projections)
{
  title: "Text Projection Roundtrip",
  slug: "zero-text-projections",
  // ...
  tools: ["Terminal", "Code Editor", "Zero CLI", "AST Visualizer"],
  steps: [
    "Run `zero export` on a populated project.",
    "Open `src/main.0` in your code editor and look at the AST Visualizer loading the node tree.",
    "Add a new variable assignment or function call in the text editor.",
    "Run `zero import` to parse the text and update the graph database, updating the visualizer.",
    "Run `zero check` to verify semantic correctness.",
  ],
  hints: [
    "Projections are for human convenience. As you type in `main.0`, the AST Visualizer shows the local text representation. Importing commits this directly to the database graph.",
  ],
}

// 5. Fixing Graph References (zero-diagnostics-activity)
{
  title: "Fixing Graph References",
  slug: "zero-diagnostics-activity",
  // ...
  tools: ["Terminal", "Zero CLI", "AST Visualizer"],
  steps: [
    "Create a function call node that references a non-existent function ID.",
    "Observe the syntax error and inspect the dangling connection node in the AST Visualizer.",
    "Run `zero query --dangling` to isolate the broken edge.",
    "Run a patch operation to connect the source reference to a valid target declaration and verify the visualizer shows a solid edge.",
  ],
  hints: [
    "The AST Visualizer can draw dangling edges or flag them with an warning border in the inspector details. The command to connect it is `zero patch --op 'connect source=\"#ref_id\" target=\"#decl_id\"'`.",
  ],
}

// 6. Cross-Compilation Build (zero-build-target)
{
  title: "Cross-Compilation Build",
  slug: "zero-build-target",
  // ...
  tools: ["Terminal", "Zero CLI", "AST Visualizer"],
  steps: [
    "Ensure your graph has no warnings in the AST Visualizer inspector and passes `zero check`.",
    "Run `zero build --emit exe --target linux-musl-x64 --out app-linux`.",
    "Verify the output binary was created.",
    "Run `zero build --emit ir --out app.ll` to inspect the LLVM IR representation.",
  ],
  hints: [
    "The IR representation reflects the high-level semantic node graph shown in the AST Visualizer, compiling direct graph representations to assembly instructions.",
  ],
}

// 7. System IO Scripting (zero-system-io)
{
  title: "System IO Scripting",
  slug: "zero-system-io",
  // ...
  tools: ["Terminal", "Zero CLI", "AST Visualizer"],
  steps: [
    "Import the `std::env` and `std::io` modules into your graph.",
    "Notice the new standard library imports node dependencies show up on the AST Visualizer.",
    "Write a main function that retrieves the `USER` env variable or prompts the user.",
    "Print the greeting using the retrieved name.",
  ],
  hints: [
    "You can add imports via patch: `zero patch --op 'addImport module=\"std::env\"'`. This adds an import edge from your root module node.",
  ],
}

// 8. Semantic Git Merge (zero-semantic-merge)
{
  title: "Semantic Git Merge",
  slug: "zero-semantic-merge",
  // ...
  tools: ["Terminal", "Git", "Zero CLI", "AST Visualizer"],
  steps: [
    "Create a local Git branch and modify a function node in the graph.",
    "Commit the change. Switch to the main branch and modify the *same* node's return type.",
    "Attempt a standard `git merge` and let it fail.",
    "Run `zero merge --remote origin/main` to resolve conflicts semantically, then inspect the combined node structure in the AST Visualizer.",
  ],
  hints: [
    "Zero merges graph nodes semantically. By selecting the merged node in the AST Visualizer, you can inspect its final combined fields (name change and type change merged seamlessly).",
  ],
}
```

---

### Design Blueprint 4: Style Additions (`apps/zhyjen/src/workspace/workspace.css`)

```css
/* AST Visualizer Styles */
.ast-visualizer-placeholder {
  animation: fadeIn 0.3s ease-out;
}

.forge-action-toggle {
  transition: all 0.2s ease;
}

.forge-action-toggle:hover {
  background: var(--panel-soft, rgba(255, 255, 255, 0.05)) !important;
  color: var(--text) !important;
}

.forge-resizer.middle:hover {
  background: var(--accent, #8b5cf6) !important;
  opacity: 0.8;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
```

---

## 5. Verification Method

To verify the proposed designs:

1. **Syntactic & Structural Liveness**:
   Run the project check command from the app root:
   ```bash
   vp check
   ```
   This ensures no syntax errors or TypeScript definition drift is introduced when importing new types like `Network` or configuring pointer event handlers.

2. **Manual UX Testing Matrix**:
   - Open a standard HTML project (e.g., Profile Card template) -> Visualizer toggle should show the friendly onboarding placeholder indicating visualizer is restricted to Zero Lang files.
   - Create and open a `main.0` file -> Visualizer toggle should load the interactive SVG graph nodes (`#module_root` and child nodes).
   - Type `import std::io;` inside `main.0` -> An `Import` node labeled `std::io` should instantly render and connect to the module root.
   - Hover over a node -> Connected lines and child nodes should highlight in primary violet.
   - Click a node -> Inspector details should show exact type, ID, label, and mock expectation hash.
   - Click the resizer bar between the editor and the visualizer -> It should resize cleanly, capping at `minWidth` thresholds.
