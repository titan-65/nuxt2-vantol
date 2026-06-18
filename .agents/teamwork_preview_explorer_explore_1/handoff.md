# Handoff Report: Zero Language Lesson Proposals

## 1. Observation
I directly observed the structure of the existing database lessons and the Zero language reference documentation.

### Database Format & Schema
In `apps/zhyjen/convex/lessons.ts` (lines 32–237), the database lessons follow this structure:
- `title` (string): Human-readable name.
- `slug` (string): URL-friendly identifier.
- `description` (string): Short overview.
- `area` (string): "Learn" or "Share".
- `skillLevel` (string): "Beginner", "Intermediate", or "Advanced".
- `order` (number): Monotonically increasing sequence number.
- `prerequisites` (string[]): Slugs of required prior lessons.
- `modules` (Array): A list of educational steps, each containing:
  - `title` (string): Module heading.
  - `body` (string): In-depth tutorial text.
  - `codeExample` (string): Code snippet, CLI command, or configuration block.

Six lessons currently exist in the database with orders 1 through 6:
1. "HTML Foundations" (Beginner, order: 1, prerequisites: `[]`)
2. "CSS Layout Basics" (Beginner, order: 2, prerequisites: `["html-foundations"]`)
3. "JavaScript Interactions" (Beginner, order: 3, prerequisites: `["html-foundations"]`)
4. "Publishing With Purpose" (Beginner, order: 4, prerequisites: `["html-foundations", "css-layout-basics", "javascript-interactions"]`)
5. "JavaScript Functions & Logic" (Intermediate, order: 5, prerequisites: `["javascript-interactions"]`)
6. "Web Accessibility" (Beginner, order: 6, prerequisites: `["html-foundations"]`)

### ZeroLang Reference Details
In `/Users/vantolbennett/.gemini/antigravity/brain/d66d2c6f-9796-408b-b651-6ad82b08c193/zerolang_reference.md`, the key specifications are:
- **Philosophy**: Graph-first programming where the graph is the program database. Text is a projection, not the source of truth.
- **The Daily Loop**: `zero query` -> `zero patch` -> `zero check` -> `zero test` -> `zero run`.
- **Projections**: `zero export` (and `zero verify-projection` in CI/drift detection) for exporting text to review; `zero import` -> `zero check` for manual changes back into the graph.
- **Build Output**: `zero build --emit exe --target linux-musl-x64 --out .zero/out/app`.
- **Checked Patches**: Patches target semantic nodes and fields, using `--expect-graph-hash` and `expect` values for concurrency/safety control.
- **Constraints**: High token efficiency, low memory footprint, fast startup, fast builds, low latency, and zero dependencies.

---

## 2. Logic Chain
1. Based on the `lessons.ts` order sequence (1–6), the new ZeroLang lessons must start at order `7` to avoid overlap.
2. The prerequisites must refer to previous lesson slugs (e.g., the second lesson requires the first lesson, intermediate lessons require basic ones, etc.).
3. The content must map directly to the technical details found in the `zerolang_reference.md` file (CLI syntax, concepts, target triple arguments).
4. Eight lessons are proposed to cover the complete spectrum of beginner, intermediate, and advanced topics:
   - Lesson 1: Introduction to Graph-First Programming (Beginner, order 7, prerequisites: `[]`)
   - Lesson 2: The Daily Developer Loop (Beginner, order 8, prerequisites: `["intro-to-graph-first"]`)
   - Lesson 3: Graph Editing with Checked Patches (Intermediate, order 9, prerequisites: `["the-daily-loop"]`)
   - Lesson 4: Projections: Importing and Exporting (Intermediate, order 10, prerequisites: `["the-daily-loop"]`)
   - Lesson 5: Diagnostics and Graph Validation (Intermediate, order 11, prerequisites: `["graph-editing-patches"]`)
   - Lesson 6: Compiling and Building Artifacts (Advanced, order 12, prerequisites: `["the-daily-loop"]`)
   - Lesson 7: Standard Libraries & System Access (Intermediate, order 13, prerequisites: `["the-daily-loop"]`)
   - Lesson 8: CI/CD and Team Workflows (Advanced, order 14, prerequisites: `["projections-import-export", "compiling-and-building"]`)

---

## 3. Caveats
- The ZeroLang environment and runtime are not live/executable locally, so the code snippets represent documentation-level CLI examples and hypothetical projections rather than runtime-validated syntax.
- The proposal assumes the database schema expects lessons to be seeded in a single unified list in order, appending ZeroLang lessons to the web development ones.

---

## 4. Conclusion
Below is the complete set of 8 ZeroLang lessons formatted as a JSON array matching the database schema.

```json
[
  {
    "title": "Introduction to Graph-First Programming",
    "slug": "intro-to-graph-first",
    "description": "Learn the core philosophy of ZeroLang, where programs are databases of semantic nodes rather than flat text files.",
    "area": "Learn",
    "skillLevel": "Beginner",
    "order": 7,
    "prerequisites": [],
    "modules": [
      {
        "title": "The Graph Paradigm",
        "body": "In ZeroLang, source code text is not the source of truth. Instead, the compiler-owned Graph acts as a program database. Human requests or agent instructions query this database, submit checked edits (patches), and verify the results. This graph-first architecture enables semantic representation, avoiding the parsing and formatting issues associated with raw text.",
        "codeExample": "{\n  \"nodes\": [\n    { \"id\": \"#main\", \"type\": \"Function\", \"name\": \"main\", \"body\": \"#expr_1\" },\n    { \"id\": \"#expr_1\", \"type\": \"Call\", \"function\": \"print\", \"args\": [\"#expr_2\"] },\n    { \"id\": \"#expr_2\", \"type\": \"LiteralString\", \"value\": \"Hello, Graph!\" }\n  ]\n}"
      },
      {
        "title": "Querying the Program Database",
        "body": "To inspect the state of a ZeroLang program, you do not open text files. Instead, you query the database using the query CLI command. This command retrieves information about semantic node structures, types, connections, and metadata, giving a clear, structured view of the application.",
        "codeExample": "# Query all function nodes in the current database\nzero query --type Function\n\n# Query detail structure of a specific node ID\nzero query --node \"#main\""
      },
      {
        "title": "Built for Constraints",
        "body": "ZeroLang is designed from the ground up to operate under strict runtime constraints. By using a graph representation and compiling directly to optimized formats, it guarantees extreme token efficiency (important for AI agents), low memory consumption, near-instant startup, and fast builds with zero external dependencies.",
        "codeExample": "# Build target size footprint inspection\nls -lh .zero/out/app\n# Output: 12KB (standalone executable)"
      }
    ]
  },
  {
    "title": "The Daily Developer Loop",
    "slug": "the-daily-loop",
    "description": "Master the cycle of query, patch, check, test, and run to develop ZeroLang programs efficiently.",
    "area": "Learn",
    "skillLevel": "Beginner",
    "order": 8,
    "prerequisites": ["intro-to-graph-first"],
    "modules": [
      {
        "title": "The Standard Workflow",
        "body": "Developing in ZeroLang uses a standardized CLI loop: query the graph, apply a patch, check for semantic correctness, run tests, and execute the application. This ensures that every change is validated at each stage before execution.",
        "codeExample": "# The core daily loop sequence\nzero query\nzero patch --op 'addMain'\nzero check\nzero test\nzero run"
      },
      {
        "title": "Checking and Testing",
        "body": "Before running any changes, use the check command to evaluate semantic validity. The compiler checks that references connect correctly and types match. After checking passes, the test command executes unit and integration tests declared inside the graph database.",
        "codeExample": "# Validate graph structure and node references\nzero check\n\n# Run graph-integrated test suites\nzero test"
      },
      {
        "title": "Executing the Program",
        "body": "The run command executes the current state of the program graph directly without requiring a separate manual compilation step. This makes early exploration and debugging fast and seamless, supporting arguments passed to the running program.",
        "codeExample": "# Run the current program graph state\nzero run\n\n# Pass arguments to the program execution\nzero run -- --port 8080 --verbose"
      }
    ]
  },
  {
    "title": "Graph Editing with Checked Patches",
    "slug": "graph-editing-patches",
    "description": "Learn how to safely modify a ZeroLang program graph using transaction-like patches with expected hashes.",
    "area": "Learn",
    "skillLevel": "Intermediate",
    "order": 9,
    "prerequisites": ["the-daily-loop"],
    "modules": [
      {
        "title": "Understanding Patches",
        "body": "Modifying programs in ZeroLang does not involve text-level changes like insert or delete lines. Instead, you apply transaction-like patches that target semantic nodes and fields. To see the set of available patch operations, use the patch command with the help operator.",
        "codeExample": "# Get help and list all available graph patch operations\nzero patch --op help"
      },
      {
        "title": "Preventing Stale Edits",
        "body": "Because multiple agents or tools might edit the program simultaneously, ZeroLang guards edits using expected graph hashes. If another process changes the graph, the hash changes, and stale or outdated patches will fail to apply, preventing code conflicts before they touch the database store.",
        "codeExample": "# Apply patch with graph hash verification to ensure concurrency control\nzero patch \\\n  --expect-graph-hash graph:a7f7e6899a73f3b4 \\\n  --op 'set node=\"#expr_653eeb6e\" field=\"value\" expect=\"hello from zero\\n\" value=\"hello graph\\n\"'"
      },
      {
        "title": "Adding Structural Elements",
        "body": "You can add new structural components, like functions or variables, by invoking structural operations that instantiate nodes in the program database. These nodes are then connected to existing nodes via reference fields.",
        "codeExample": "# Add a main entrypoint function structural node\nzero patch --op 'addMain'\n\n# Add a new generic function node to the graph\nzero patch --op 'addNode type=\"Function\" name=\"calculateSum\"'"
      }
    ]
  },
  {
    "title": "Projections: Importing and Exporting",
    "slug": "projections-import-export",
    "description": "Learn to project the program graph into human-readable text and import manual changes back into the graph.",
    "area": "Learn",
    "skillLevel": "Intermediate",
    "order": 10,
    "prerequisites": ["the-daily-loop"],
    "modules": [
      {
        "title": "Exporting for Review",
        "body": "When humans need to inspect the program or review code changes, ZeroLang can project the graph database into readable source-like text files. The export command generates these projections, and verify-projection guarantees they accurately reflect the current graph state.",
        "codeExample": "# Export the binary graph database to text projection files\nzero export\n\n# Verify that the text files and graph state are in sync\nzero verify-projection"
      },
      {
        "title": "Editing Text Projections",
        "body": "While the graph is the source of truth, developers can edit the exported text projections (like src/main.0) directly. This allows you to write code in familiar syntax and use standard IDE features while working with ZeroLang.",
        "codeExample": "// Example projection file contents (src/main.0)\nfn main() {\n    let greeting = \"Hello, projection!\";\n    print(greeting);\n}"
      },
      {
        "title": "Importing Projections",
        "body": "After editing the text projection files, the changes must be imported back into the graph database before the program can be checked, tested, or executed. The import command parses the text files and updates the corresponding nodes in the database.",
        "codeExample": "# Import modified text projections back into the program graph\nzero import\n\n# Check the semantic correctness of the imported changes\nzero check"
      }
    ]
  },
  {
    "title": "Diagnostics and Graph Validation",
    "slug": "diagnostics-and-validation",
    "description": "Use zero check to validate your program graph, resolve semantic errors, and ensure type safety.",
    "area": "Learn",
    "skillLevel": "Intermediate",
    "order": 11,
    "prerequisites": ["graph-editing-patches"],
    "modules": [
      {
        "title": "Semantic Analysis",
        "body": "The compiler performs comprehensive semantic checks on the program graph database when you run check. It ensures all reference edges are valid, identifier bindings are defined within the active scope, and call nodes map to declared function signatures.",
        "codeExample": "# Run validation checks to discover semantic errors\nzero check\n# Output:\n# Error: UnboundReference at #expr_9410 - symbol 'total' is not defined in this scope."
      },
      {
        "title": "Graph Type Safety",
        "body": "ZeroLang enforces static typing directly across the edges of the program graph. The type checker traces variables, function parameters, and return types to identify mismatches, ensuring type safety before compilation.",
        "codeExample": "# Example of type mismatch diagnostic returned by check:\n# Error: TypeMismatch at #call_12 - 'print' expects String, found Int at #expr_42."
      },
      {
        "title": "Resolving Circular Dependencies",
        "body": "Since the program is a graph, circular dependencies can occur when nodes or packages reference each other in loops. The check command identifies these cycles, which you can resolve by updating reference fields in the nodes.",
        "codeExample": "# Update a cyclic node reference using a patch to break the loop\nzero patch --op 'set node=\"#struct_A\" field=\"dependsOn\" value=\"#struct_C\"'\nzero check\n# Output: OK (0 errors, 0 warnings)"
      }
    ]
  },
  {
    "title": "Compiling and Building Artifacts",
    "slug": "compiling-and-building",
    "description": "Learn to build standalone executables, object files, or LLVM IR from the program graph using zero build.",
    "area": "Learn",
    "skillLevel": "Advanced",
    "order": 12,
    "prerequisites": ["the-daily-loop"],
    "modules": [
      {
        "title": "Cross-Compilation Targets",
        "body": "ZeroLang's compiler can build standalone binary executables for multiple target operating systems and architectures. Using the build command, you can specify target flags such as linux-musl-x64, macos-arm64, or windows-x64.",
        "codeExample": "# Build a static standalone executable for Linux musl target\nzero build --emit exe --target linux-musl-x64 --out .zero/out/app"
      },
      {
        "title": "Emit Modes",
        "body": "The build command supports different emit modes via the --emit flag. You can generate standalone executables (exe), shared library objects (lib), native machine object files (obj), or LLVM Intermediate Representation (ir) for further compiler optimizations.",
        "codeExample": "# Compile the graph to LLVM Intermediate Representation\nzero build --emit ir --out .zero/out/app.ll"
      },
      {
        "title": "Release Optimization",
        "body": "For production deployment, you can optimize the binary size and execution performance by appending the --release flag. This instructs the compiler to strip debug metadata, prune unused nodes from the graph, and optimize execution speed.",
        "codeExample": "# Build optimized release binary\nzero build --release --out .zero/out/app-prod"
      }
    ]
  },
  {
    "title": "Standard Libraries & System Access",
    "slug": "stdlib-and-system",
    "description": "Explore the ZeroLang standard library, low-level system calls, memory management, and runtime features.",
    "area": "Learn",
    "skillLevel": "Intermediate",
    "order": 13,
    "prerequisites": ["the-daily-loop"],
    "modules": [
      {
        "title": "Basic Input and Output",
        "body": "The ZeroLang standard library (std) provides zero-dependency modules for basic system IO operations. You can print messages to stdout or stderr, read lines from stdin, and perform file read/write operations.",
        "codeExample": "import std::io;\n\nfn main() {\n    io::print(\"Enter your name: \");\n    let name = io::read_line();\n    io::println(\"Hello, \" + name);\n}"
      },
      {
        "title": "Environment and Processes",
        "body": "You can interact with the host operating system using the std::env module, which allows you to retrieve environment variables, command-line arguments, and execute external subprocesses.",
        "codeExample": "import std::env;\n\nfn main() {\n    let args = env::args();\n    let path = env::get(\"PATH\");\n    print(\"Executable: \" + args[0]);\n}"
      },
      {
        "title": "Resource-Constrained Execution",
        "body": "To support low-memory and embedded environments, ZeroLang avoids garbage collection and dynamically allocated overhead by default. It utilizes static region analysis and manual stack/static allocations through the std::mem module.",
        "codeExample": "import std::mem;\n\nfn process() {\n    // Allocate a static block of memory safe from GC overhead\n    let buffer = mem::alloc_static::<1024>();\n}"
      }
    ]
  },
  {
    "title": "CI/CD and Team Workflows",
    "slug": "ci-cd-and-workflows",
    "description": "Integrate ZeroLang into automated workflows using projection drift gates and collaborate safely on graph databases.",
    "area": "Share",
    "skillLevel": "Advanced",
    "order": 14,
    "prerequisites": ["projections-import-export", "compiling-and-building"],
    "modules": [
      {
        "title": "Projection Drift Gates",
        "body": "In a collaborative team setting, you must ensure that committed text files match the binary graph database. Setting up a projection drift gate in CI/CD runs verify-projection. If a developer edits text files but forgets to import them, the check fails.",
        "codeExample": "# GitHub Actions workflow configuration step\n- name: Check for Projection Drift\n  run: zero verify-projection"
      },
      {
        "title": "Graph Merge Conflict Resolution",
        "body": "Traditional git merge conflicts occur on text lines. With ZeroLang, database merges are resolved semantically on graph nodes. The merge command automates this, highlighting collisions at the node or field level instead of line differences.",
        "codeExample": "# Merge branches semantically using the graph database engine\nzero merge --remote origin/main"
      },
      {
        "title": "Publishing Graph Modules",
        "body": "ZeroLang supports modular code sharing by publishing packages as serialized subgraph databases. The publish command signs the package hash, packages the metadata, and publishes it to the registry for other projects to query and reference.",
        "codeExample": "# Package and publish the current graph to the registry\nzero publish"
      }
    ]
  }
]
```

---

## 5. Verification Method
To verify that this proposal is correct and matches the structure of the database:
1. Compare the key fields of each object in the proposed JSON array above with the schema types and existing objects in `apps/zhyjen/convex/lessons.ts`.
2. Inspect `handoff.md` to ensure all fields are present for every single proposed lesson.
3. Validate that the JSON structure is parseable.
