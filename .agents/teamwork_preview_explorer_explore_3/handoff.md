# Handoff Report: Zerolang Curriculum Proposals

## 1. Observation

Direct observations of files and reference documentation were performed:

* **File inspected**: `/Users/vantolbennett/Developer/2025/vantolbennett-blog/apps/zhyjen/convex/lessons.ts`
  We observed the lessons database shape and structure used in the seeding function (`seedStarterLessons` at lines 22-256). Specifically, the attributes of each lesson are:
  - `title`: string
  - `slug`: string (e.g. `html-foundations`)
  - `description`: string
  - `area`: string (e.g. `"Learn"`, `"Share"`)
  - `skillLevel`: string (e.g. `"Beginner"`, `"Intermediate"`)
  - `order`: number (the highest order in the existing seed is `6` for `"Web Accessibility"`)
  - `prerequisites`: string[] (contains slugs of prerequisites)
  - `modules`: Array of objects, each containing:
    - `title`: string
    - `body`: string
    - `codeExample`: string
  
  Example structure (lines 33-61):
  ```typescript
  {
    title: "HTML Foundations",
    slug: "html-foundations",
    description: "Learn how to structure a web page...",
    area: "Learn",
    skillLevel: "Beginner",
    order: 1,
    prerequisites: [],
    modules: [
      {
        title: "Page structure",
        body: "Every web page is built on the same...",
        codeExample: '<!DOCTYPE html>\n<html lang="en">...'
      }
    ]
  }
  ```

* **Reference read**: `/Users/vantolbennett/.gemini/antigravity/brain/d66d2c6f-9796-408b-b651-6ad82b08c193/zerolang_reference.md`
  Key command loop and concepts observed:
  - Daily loop (lines 9-16): `zero query`, `zero patch --op help`, `zero patch --op 'addMain'`, `zero check`, `zero test`, `zero run -- <args>`
  - Projections (lines 20-37): `zero export`, `zero verify-projection`, `zero import`
  - Build command (lines 38-47): `zero build --emit exe --target linux-musl-x64 --out .zero/out/app`
  - Core concepts (lines 48-62): Graph architecture (Graph is program database), semantic edits checked by default (nodes and fields guarded by graph hashes and expected values via `zero patch`).

---

## 2. Logic Chain

From these observations, the curriculum design rules were derived:
1. **Structural Alignment**: Each proposed lesson must fit into the observed structure of `lessons.ts` (using keys `title`, `slug`, `description`, `area`, `skillLevel`, `order`, `prerequisites`, `modules`).
2. **Order Sequencing**: The existing database seed has lessons with orders 1 to 6. Our new Zero language lessons should start at order 7 and follow a logical progression (orders 7 to 14) to maintain continuity.
3. **Prerequisite Mapping**: The lessons must build sequentially. Beginners start with no prerequisites, intermediates require the basic commands, and advanced topics build on those intermediates.
4. **Categorization**:
   - Basics, graph editing, daily loop, projections, and diagnostics belong in the `"Learn"` area (Skill Levels: Beginner, Intermediate).
   - Compilation and building belong in the `"Build"` area (Skill Level: Advanced).
   - Collaboration and CI workflows belong in the `"Share"` area (Skill Level: Advanced).

---

## 3. Caveats

* **Skill Level Values**: Based on the observed seed data, we used `"Beginner"`, `"Intermediate"`, and `"Advanced"` for skillLevel.
* **Area Classification**: We categorized lessons under `"Learn"`, `"Build"`, and `"Share"`, matching the theme of the existing project.
* **Read-only Mode**: This proposal is read-only. No edits have been made to `lessons.ts`.

---

## 4. Conclusion

We propose a comprehensive set of 8 Zero language lessons, structured exactly to match the database schema. Below is the complete data structure representing the proposed lessons:

```typescript
const zerolangLessons = [
  {
    title: "Introduction to Zerolang & Graph Architecture",
    slug: "zerolang-intro-and-graph",
    description: "Understand how Zerolang differs from text-based languages and explore the concept of the compiler-owned program graph.",
    area: "Learn",
    skillLevel: "Beginner",
    order: 7,
    prerequisites: [],
    modules: [
      {
        title: "The Graph is the Program",
        body: "In Zerolang, source text is not the source of truth. The program is stored as a compiler-owned semantic graph database. When humans write or view code, they interact with text projections, but compiler tools read and modify the graph directly. This structure prevents syntax parsing errors and allows compiler agents to query and understand program structure instantly.",
        codeExample: "// Text representation is just a projection\n// The source of truth is the graph database in the compiler:\n// Node: #expr_1 (type: 'BinaryExpression', op: '+', left: #expr_2, right: #expr_3)"
      },
      {
        title: "Why Graph-First?",
        body: "Conventional source code is full of ambiguity, whitespace variations, and syntax nuances that require parsing. In a graph-first architecture, the compiler manipulates nodes and fields directly. This guarantees semantic correctness, makes automated program modification extremely fast, minimizes memory requirements, and is optimized for low-resource environments and AI agents.",
        codeExample: "1. Raw Text: a = b + 1; (Requires tokenizer, parser, AST generation)\n2. Program Graph: SetNodeField(node: '#var_a', field: 'value', expr: '#expr_add')"
      },
      {
        title: "Exploring the Graph",
        body: "To read the current state of a program graph, use the query command. It outputs the structure of nodes and fields, allowing you to examine variables, functions, and expression trees within the database before applying edits.",
        codeExample: "# Query the current project's graph\nzero query"
      }
    ]
  },
  {
    title: "The Daily Loop",
    slug: "zerolang-daily-loop",
    description: "Master the essential command cycle of Zerolang: query, patch, check, test, and run.",
    area: "Learn",
    skillLevel: "Beginner",
    order: 8,
    prerequisites: ["zerolang-intro-and-graph"],
    modules: [
      {
        title: "Query and Patch",
        body: "The basic workflow starts by querying the graph to find target node IDs. Once the node ID and target field are known, apply modifications using the patch command. Patches describe exact modifications rather than diff files.",
        codeExample: "# 1. Inspect the graph\nzero query\n\n# 2. Query available patch options\nzero patch --op help"
      },
      {
        title: "Check and Test",
        body: "After patching the graph, verify that the program is still semantically sound. The check command performs type checking and schema verification on the graph. Once checks pass, run the test suites to ensure behavior remains correct.",
        codeExample: "# 3. Run type-checker and semantic checks\nzero check\n\n# 4. Execute test suites\nzero test"
      },
      {
        title: "Running the Program",
        body: "To test the application interactively or during early exploration, use the run command. This runs the graph directly through the Zerolang interpreter without needing to build a standalone executable.",
        codeExample: "# 5. Run the graph with optional arguments\nzero run -- --verbose"
      }
    ]
  },
  {
    title: "Graph Editing and Safe Patches",
    slug: "zerolang-graph-editing",
    description: "Dive deep into semantic editing using patch operations, hash guards, and expected values for conflict-free modifications.",
    area: "Learn",
    skillLevel: "Intermediate",
    order: 9,
    prerequisites: ["zerolang-daily-loop"],
    modules: [
      {
        title: "Semantic Nodes and Fields",
        body: "A Zerolang patch targets specific node identifiers (e.g., '#expr_653eeb6e') and modifies named fields within them. Operations are atomic, ensuring that fields are never left in an unvalidated or partially updated state.",
        codeExample: "zero patch --op 'set node=\"#expr_653eeb6e\" field=\"value\" expect=\"foo\" value=\"bar\"'"
      },
      {
        title: "Expectation Guards and Hash Checks",
        body: "To prevent race conditions and stale edits in collaborative or multi-agent environments, patches should supply expectation guards. The --expect-graph-hash option ensures the patch is only applied if the graph is in the expected state. If another agent modified the graph first, the hash mismatch fails the patch safely before applying any changes.",
        codeExample: "zero patch \\\n  --expect-graph-hash graph:a7f7e6899a73f3b4 \\\n  --op 'set node=\"#expr_653eeb6e\" field=\"value\" expect=\"hello from zero\\n\" value=\"hello graph\\n\"'"
      },
      {
        title: "Adding Main and Entry Points",
        body: "Special predefined operations simplify common graph modifications. For example, adding an entry point main function uses a single command rather than manual building of node structures.",
        codeExample: "# Instantly inserts a main entry point node into the active graph\nzero patch --op 'addMain'"
      }
    ]
  },
  {
    title: "Working with Text Projections",
    slug: "zerolang-projections",
    description: "Learn how to export program graphs to readable text, perform edits in text format, and import changes back into the graph.",
    area: "Learn",
    skillLevel: "Intermediate",
    order: 10,
    prerequisites: ["zerolang-daily-loop"],
    modules: [
      {
        title: "Exporting to Readable Text",
        body: "Although the graph is the source of truth, humans prefer reading text. The export command generates a readable text representation of the graph (typically saved as `.0` files, such as `src/main.0`). Agents should only export when requested by a human, or for CI verification.",
        codeExample: "# Export the program graph to readable source files\nzero export"
      },
      {
        title: "Importing Projections",
        body: "If a human developer edits the exported `.0` source files manually, the changes must be imported back to update the graph database before compiling or executing.",
        codeExample: "# Commit text changes back into the graph database\nzero import\nzero check"
      },
      {
        title: "Verification and Drift Detection",
        body: "To ensure that manual edits do not conflict with changes made directly via graph patches, use the verify-projection command. This is ideal for CI gates to prevent drift between local source files and the program graph database.",
        codeExample: "# Check if the exported projection matches the actual program graph\nzero verify-projection"
      }
    ]
  },
  {
    title: "Diagnostics and Type Checking",
    slug: "zerolang-diagnostics",
    description: "Understand compiler diagnostics, semantic validation rules, and debugging techniques in a graph environment.",
    area: "Learn",
    skillLevel: "Intermediate",
    order: 11,
    prerequisites: ["zerolang-graph-editing"],
    modules: [
      {
        title: "Semantic Analysis",
        body: "The type checker checks that connections (edges) between graph nodes are semantically valid and types align. Calling check verifies all variable assignments, function return types, and control flows. Mismatches output direct node references pointing to the exact point of error.",
        codeExample: "# Validate graph semantics\nzero check\n\n# Output:\n# Error: Type mismatch at node #expr_234: Expected Int, got String"
      },
      {
        title: "Resolving Unlinked References",
        body: "Unlike text compilers that complain about undeclared variables, Zerolang warns of disconnected nodes or unresolved edges. Fixing these requires querying the graph to identify the dangling reference, then using a patch to bind it to a valid target node.",
        codeExample: "# Check for dangling node references\nzero query --dangling\n\n# Reconnect reference node #ref_1 to declaration node #decl_2\nzero patch --op 'connect source=\"#ref_1\" target=\"#decl_2\"'"
      }
    ]
  },
  {
    title: "Compilation and Build Outputs",
    slug: "zerolang-compilation",
    description: "Compile Zerolang graphs into production-ready binaries, target multiple environments, and inspect intermediate LLVM IR representation.",
    area: "Build",
    skillLevel: "Advanced",
    order: 12,
    prerequisites: ["zerolang-daily-loop"],
    modules: [
      {
        title: "The Build Command",
        body: "While `zero run` is convenient for development, production requires compiled artifacts. The build command compiles the graph database into native machine code, intermediate representation, or library object files.",
        codeExample: "# Compile the graph to a standalone executable\nzero build --emit exe --target linux-musl-x64 --out .zero/out/app"
      },
      {
        title: "Cross-Compilation Targets",
        body: "Zerolang supports built-in cross-compilation without requiring local toolchains. Use the --target option to compile for different operating systems and CPU architectures.",
        codeExample: "# Build for macOS ARM64\nzero build --emit exe --target macos-arm64 --out .zero/out/app-mac\n\n# Build for Alpine Linux x64\nzero build --emit exe --target linux-musl-x64 --out .zero/out/app-linux"
      },
      {
        title: "Intermediate Representation (LLVM IR)",
        body: "To inspect compile-time optimizations or integrate with other compiler stages, emit LLVM IR or object files instead of direct executables.",
        codeExample: "# Emit LLVM IR source file (.ll)\nzero build --emit llvm-ir --out .zero/out/app.ll"
      }
    ]
  },
  {
    title: "Zerolang Standard Libraries",
    slug: "zerolang-std-libs",
    description: "Explore built-in graph packages, standard utility libraries, and how to utilize core graph modules.",
    area: "Learn",
    skillLevel: "Advanced",
    order: 13,
    prerequisites: ["zerolang-graph-editing"],
    modules: [
      {
        title: "The Core Module",
        body: "Zerolang includes standard IO, arithmetic, and logic functions as pre-built subgraphs. Standard operations, such as printing to the console, are achieved by routing parameters to built-in system nodes.",
        codeExample: "# Query core library nodes available in the active environment\nzero query --library core"
      },
      {
        title: "Memory and Performance Optimization",
        body: "Zerolang operates with zero dependencies, yielding low-memory overhead, rapid startup, and zero cold-start delay. Under the hood, memory management is graph-inferred, optimizing allocation based on static node lifetimes rather than running a heavy garbage collector.",
        codeExample: "// Static lifetime inference in compiler graph:\n// Nodes #node_mem1 are compiled to stack-allocated variables.\n// Nodes #node_mem2 are optimized away via compiler graph folding."
      }
    ]
  },
  {
    title: "Collaboration and CI in Zerolang",
    slug: "zerolang-collaboration",
    description: "Establish safe workflows for team environments, multi-agent coordination, and Git/CI pipelines.",
    area: "Share",
    skillLevel: "Advanced",
    order: 14,
    prerequisites: ["zerolang-projections", "zerolang-compilation"],
    modules: [
      {
        title: "Multi-Agent Coordination",
        body: "When multiple developers or automated agents work on the same program graph, conflicts are resolved through deterministic graph patches. Instead of text merges that might break syntax, graph merges resolve based on node IDs and transaction hashes, guaranteeing structural consistency.",
        codeExample: "# Apply patches via queue\nzero patch --queue ./patches/"
      },
      {
        title: "Git Workflows with Graph Databases",
        body: "To collaborate via Git, commit the binary graph database. If merge conflicts arise, developers should rely on graph projections to understand logical conflicts, resolve them by regenerating or ordering graph patches, and verify the resulting graph with verify-projection.",
        codeExample: "# Verify local graph and exported projection are synchronized before pushing\nzero verify-projection"
      },
      {
        title: "CI/CD Gates",
        body: "Add automated tests to check your program graph in CI environments. A typical pipeline runs verify-projection to guarantee that no human bypassed the graph database, followed by check, test, and build steps.",
        codeExample: "# Typical CI Pipeline Commands:\nzero verify-projection && zero check && zero test && zero build --emit exe --target linux-musl-x64 --out build/app"
      }
    ]
  }
];
```

---

## 5. Verification Method

To independently verify this proposed design:
1. Review the generated `handoff.md` file in the working directory:
   `/Users/vantolbennett/Developer/2025/vantolbennett-blog/.agents/teamwork_preview_explorer_explore_3/handoff.md`
2. Validate that each object has the correct schema keys:
   - `title`: String
   - `slug`: String
   - `description`: String
   - `area`: "Learn", "Build", or "Share"
   - `skillLevel`: "Beginner", "Intermediate", or "Advanced"
   - `order`: Integer starting from 7 (ascending order 7 through 14)
   - `prerequisites`: String array corresponding to valid slugs of preceding lessons
   - `modules`: Array of `{ title: string, body: string, codeExample: string }`
3. Check the content against the `zerolang_reference.md` file to confirm that all technical elements (e.g. `zero query`, `zero patch`, expectation hashes, `zero export`, `zero build`, etc.) are accurate to the Zerolang specification.
