# Handoff Report: AST Visualizer Design for ZhyJen Editor

## 1. Observation
From inspecting the `apps/zhyjen` codebase, the following structures and code snippets were directly observed:

### A. Forge Workspace Layout and Code Editor Pane
- **File Path**: `apps/zhyjen/src/forge/ForgeWorkspace.tsx`
- **Line 931**: The editor body renders the `editorPane` in a containing div:
  ```tsx
  <div className="forge-editor-body">{editorPane}</div>
  ```
- **Lines 638-660**: `editorPane` is memoized and returns `<CodeEditor>` component:
  ```tsx
  const editorPane = useMemo(() => {
    if (!activeFile) {
      return (
        <div className="forge-editor-empty">
          <Sparkles size={32} />
          <p>Open a file from the sidebar to start editing.</p>
        </div>
      );
    }
    return (
      <CodeEditor
        ref={editorRef}
        path={activeFile.path}
        code={activeFile.content}
        language={activeFile.language}
        settings={settings}
        onChange={(value) => updateContent(activeFile.path, value)}
        onCursorPosition={setCursorPosition}
        onMarkers={handleMarkers}
        readOnly={isMentorView}
      />
    );
  }, [activeFile, updateContent, settings, handleMarkers]);
  ```
- **Lines 903-920**: The toolbar action buttons inside the editor toolbar:
  ```tsx
  <div className="forge-editor-toolbar-actions">
    {/* Presence avatars and format/command/settings buttons */}
    <button type="button" onClick={() => void handleFormat()} title="Format document (Shift+Alt+F)">
      <AlignLeft size={14} />
    </button>
    <button type="button" onClick={() => setCommandPaletteOpen(true)} title="Command palette (Ctrl+Shift+P)">
      <Command size={14} />
    </button>
    <button type="button" onClick={() => setSettingsOpen(true)} title="Editor settings">
      <Settings size={14} />
    </button>
  </div>
  ```

### B. Resizing Logic
- **Lines 386-418**: Resizing sidebar elements is handled by pointer capture event callbacks:
  ```tsx
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

### C. Editor CSS Rules
- **File Path**: `apps/zhyjen/src/pages/forge.css`
- **Lines 529-533**: `.forge-editor-body` layout:
  ```css
  .forge-editor-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  ```

### D. Zero Language Activities
- **File Path**: `apps/zhyjen/convex/activities.ts`
- **Lines 21-1700**: Contains the array `starterActivities` containing 8 Zero-specific learning activities:
  1. `zero-graph-query` (Graph Query Explorer, line 406): Explores program graph and identifies AST nodes.
  2. `zero-daily-loop-practice` (The Daily Loop Practice, line 449): Commands like `check`, `run`, `patch`.
  3. `zero-safe-patching` (Safe Graph Editing, line 491): Patching with expectation guards.
  4. `zero-text-projections` (Text Projection Roundtrip, line 533): Exporting/importing `.0` projection files.
  5. `zero-diagnostics-activity` (Fixing Graph References, line 570): Fixing unbound references.
  6. `zero-build-target` (Cross-Compilation Build, line 608): Building compilation targets.
  7. `zero-system-io` (System IO Scripting, line 645): Scripting standard library modules.
  8. `zero-semantic-merge` (Semantic Git Merge, line 682): Resolving graph semantic conflicts.

---

## 2. Logic Chain

Based on the observations above, the design for the four requested components is structured as follows:

### A. Split Pane Integration in `ForgeWorkspace.tsx`
1. To introduce a side-by-side pane split, we must update the DOM structure of `.forge-editor-body` (from line 931). Instead of directly rendering `{editorPane}`, we will place a horizontal flex-row container.
2. To allow toggle control, we introduce a state `const [showVisualizer, setShowVisualizer] = useState(false);` in `ForgeWorkspace`.
3. To support resizing of the visualizer pane, we define `const [visualizerWidth, setVisualizerWidth] = useState(320);` and extend the pointer resize handlers:
   - Add `"visualizer"` to the union of resizable panes.
   - Update `handleResizePointerMove` to adjust the visualizer width:
     ```typescript
     } else if (resizing === "visualizer") {
       const boundary = window.innerWidth - contentWidth;
       setVisualizerWidth(Math.max(200, Math.min(600, boundary - e.clientX)));
     }
     ```
4. Define the DOM structure inside `.forge-editor-body` when active:
  ```tsx
  <div className="forge-editor-body-split" style={{ display: "flex", flexDirection: "row", height: "100%", width: "100%" }}>
    <div className="forge-editor-pane-left" style={{ flex: 1, minWidth: 0, height: "100%" }}>
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
          aria-label="Resize visualizer pane"
          title="Drag to resize the visualizer pane"
          style={{ position: "relative", zIndex: 10, cursor: "col-resize" }}
        />
        <div className="forge-visualizer-pane" style={{ width: `${visualizerWidth}px`, minWidth: "200px", height: "100%", flexShrink: 0 }}>
          <AstVisualizer activeFile={activeFile} />
        </div>
      </>
    )}
  </div>
  ```

### B. UI Toggle Button in Editor Toolbar
1. We will place a new toggle button inside the `forge-editor-toolbar-actions` container (around line 920 in `ForgeWorkspace.tsx`).
2. The button will use the `Network` icon from `lucide-react` (representing graph nodes and edges).
3. The button will conditionally show a highlighted background color when `showVisualizer` is `true`.
4. Implementation design for the toolbar:
  ```tsx
  <button
    type="button"
    onClick={() => setShowVisualizer(!showVisualizer)}
    title={showVisualizer ? "Hide AST Visualizer" : "Show AST Visualizer"}
    className={`forge-toolbar-toggle ${showVisualizer ? "active" : ""}`}
    style={showVisualizer ? { background: "rgba(139, 92, 246, 0.25)", color: "#8b5cf6" } : undefined}
  >
    <Network size={14} />
  </button>
  ```

### C. Visualizer Rendering Component (`AstVisualizer.tsx`)
1. To keep the app bundle lightweight and remove the need for external rendering engine dependencies, the component will draw the nodes and edges using an inline SVG wrapper.
2. SVG zoom and pan state will be maintained locally inside `AstVisualizer`:
   ```typescript
   const [pan, setPan] = useState({ x: 0, y: 0 });
   const [zoom, setZoom] = useState(1);
   ```
3. An inspection state is added to show attributes of the selected node:
   ```typescript
   const [selectedNode, setSelectedNode] = useState<AstNode | null>(null);
   ```
4. **Conditional Display Rule**:
   - Check if `activeFile` is open and ends with `.0` (or another Zero file naming convention).
   - **If open is a Zero file**: Draw a mock/live interactive graph mapping the code. It displays:
     - Nodes: Root Program node, Import nodes, Function declaration node (`#decl_main`), Block body nodes, System write statements, and Warning nodes for unbound references.
     - Edges: Structural edges (solid) and Reference edges (dashed). Unbound/dangling edges are colored in **red** for visual warning feedback.
   - **If open is a non-Zero file** (HTML/CSS/JS): Show a friendly educational placeholder.
     - Provide an explanation banner: *"AST Visualizer: Open a Zero (.0) file to see its semantic node graph."*
     - Show a static interactive illustration of a generic HTML or JS tree (e.g., `document` -> `body` -> `button` -> `click handler`) so students can see and click around an AST tree structure to learn the concept.

### D. Aligning Zero Language Activities in `convex/activities.ts`
1. For each of the 8 Zero activities, we add `"AST Visualizer"` to the `tools` array.
2. We modify the descriptions, steps, and hints in `convex/activities.ts` to instruct the student on using the split pane to support their learning path:
   - **Graph Query Explorer (`zero-graph-query`)**:
     - *Steps*: Add "Toggle open the AST Visualizer in the editor toolbar to visually inspect the `#decl_main` declaration node and its parameter block."
     - *Hints*: "Rather than querying via text, the AST Visualizer pane shows structural nodes visually. Try hovering over the function block to see its connected edges."
   - **The Daily Loop Practice (`zero-daily-loop-practice`)**:
     - *Steps*: Add "Observe the AST Visualizer update its node connections in real-time as you patch the graph."
   - **Safe Graph Editing (`zero-safe-patching`)**:
     - *Steps*: Add "Use the AST Visualizer to inspect node hashes and identify the current global graph hash at the top of the visualization."
   - **Text Projection Roundtrip (`zero-text-projections`)**:
     - *Steps*: Add "Observe how the visualizer displays the node tree when opening `main.0` and watch it update immediately after importing code changes."
   - **Fixing Graph References (`zero-diagnostics-activity`)**:
     - *Steps*: Add "Look at the AST Visualizer to identify the unbound reference node, which will be visually flagged in red with a dashed dangling edge."
     - *Hints*: "Click on the warning node in the Visualizer to inspect the unbound symbol ID."
   - **Cross-Compilation Build (`zero-build-target`)**:
     - *Steps*: Add "Use the target toggle in the AST Visualizer to observe compiler IR representation mapping to node variables."
   - **System IO Scripting (`zero-system-io`)**:
     - *Steps*: Add "Import the modules and check the visualizer to see the external library nodes linking to your main code path."
   - **Semantic Git Merge (`zero-semantic-merge`)**:
     - *Steps*: Add "Use the AST Visualizer merge view to identify fields that caused the structural collision on the node."

---

## 3. Caveats
- **Graph Layout Algorithm Complexity**: Implementing a full force-directed layout from scratch in a custom SVG might be CPU-intensive or tricky. A simple layered tree coordinate layout (nodes arranged by depth levels) is recommended for simplicity and performance.
- **Monaco Editor Resizing**: When splitting the pane, Monaco Editor may need to be resized explicitly. Monaco handles `automaticLayout: true` (as observed in `CodeEditor.tsx` line 252), which should trigger a recalculation automatically when the pane widths change, but slight layout reflow latency may occur on low-end devices.

---

## 4. Conclusion
Integrating an AST Graph visualizer next to the code editor inside `ForgeWorkspace.tsx` will significantly enhance the ZhyJen editor's capabilities for learning compiler graphs. The design uses:
1. A clean, resizable horizontal split container inside `.forge-editor-body`.
2. A toolbar toggle button with a `Network` icon to manage visibility state.
3. An SVG-based `AstVisualizer.tsx` component that conditionally displays interactive compiler node trees for Zero files, and a friendly educational mock tree for web files.
4. Updates to the 8 Zero database activities to reference visual AST exploration.

---

## 5. Verification Method
To verify the design, once implemented:
1. Run `vp dev` to start the local zhyjen development environment on port 3003.
2. Navigate to `/forge` workspace.
3. Verify that the `Network` icon button appears on the editor toolbar.
4. Click the toggle button; verify the middle pane splits and reveals the visualizer placeholder explaining the Zero AST concepts.
5. Create a new Zero file named `main.0`. Verify that opening this file triggers the interactive node rendering of `#decl_main` and system IO libraries.
6. Drag the vertical resizer handle; verify that both Monaco Editor and the visualizer resize smoothly.
7. Run test commands `vp check` and `vp test` to verify no compilation or test regressions are introduced in the workspace.
