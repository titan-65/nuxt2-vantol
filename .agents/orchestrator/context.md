# Zero Language Lessons - Curriculum Design

## Synthesized Lessons
The following 8 lessons cover the complete spectrum of Zero programming language concepts (basics, graph editing, the daily loop, diagnostics, compilation, standard libraries, CI/CD, and collaboration workflows).

```typescript
  {
    title: "Introduction to Zero & Graph Architecture",
    slug: "zero-intro-and-graph",
    description:
      "Understand how Zero Lang differs from text-based languages and explore the concept of the compiler-owned program graph.",
    area: "Learn",
    skillLevel: "Beginner",
    order: 7,
    prerequisites: [],
    modules: [
      {
        title: "The Graph is the Program",
        body: "In Zero, source text is not the source of truth. The program is stored as a compiler-owned semantic graph database. When humans write or view code, they interact with text projections, but compiler tools read and modify the graph directly. This structure prevents syntax parsing errors and allows compiler agents to query and understand program structure instantly.",
        codeExample:
          "// Text representation is just a projection\n// The source of truth is the graph database in the compiler:\n// Node: #expr_1 (type: 'BinaryExpression', op: '+', left: #expr_2, right: #expr_3)",
      },
      {
        title: "Why Graph-First?",
        body: "Conventional source code is full of ambiguity, whitespace variations, and syntax nuances that require parsing. In a graph-first architecture, the compiler manipulates nodes and fields directly. This guarantees semantic correctness, makes automated program modification extremely fast, minimizes memory requirements, and is optimized for low-resource environments and AI agents.",
        codeExample:
          "1. Raw Text: a = b + 1; (Requires tokenizer, parser, AST generation)\n2. Program Graph: SetNodeField(node: '#var_a', field: 'value', expr: '#expr_add')",
      },
      {
        title: "Exploring the Graph",
        body: "To read the current state of a program graph, use the query command. It outputs the structure of nodes and fields, allowing you to examine variables, functions, and expression trees within the database before applying edits.",
        codeExample: "# Query the current project's graph\nzero query",
      },
    ],
  },
  {
    title: "The Daily Loop in Zero",
    slug: "zero-daily-loop",
    description:
      "Master the essential command cycle of Zero: query, patch, check, test, and run.",
    area: "Learn",
    skillLevel: "Beginner",
    order: 8,
    prerequisites: ["zero-intro-and-graph"],
    modules: [
      {
        title: "Query and Patch",
        body: "The basic workflow starts by querying the graph to find target node IDs. Once the node ID and target field are known, apply modifications using the patch command. Patches describe exact modifications rather than diff files.",
        codeExample:
          "# 1. Inspect the graph\nzero query\n\n# 2. Query available patch options\nzero patch --op help",
      },
      {
        title: "Check and Test",
        body: "After patching the graph, verify that the program is still semantically sound. The check command performs type checking and schema verification on the graph. Once checks pass, run the test suites to ensure behavior remains correct.",
        codeExample: "# 3. Run type-checker and semantic checks\nzero check\n\n# 4. Execute test suites\nzero test",
      },
      {
        title: "Running the Program",
        body: "To test the application interactively or during early exploration, use the run command. This runs the graph directly through the Zero interpreter without needing to build a standalone executable.",
        codeExample: "# 5. Run the graph with optional arguments\nzero run -- --verbose",
      },
    ],
  },
  {
    title: "Graph Editing & Safe Patches",
    slug: "zero-graph-editing",
    description:
      "Dive deep into semantic editing using patch operations, hash guards, and expected values for conflict-free modifications.",
    area: "Learn",
    skillLevel: "Intermediate",
    order: 9,
    prerequisites: ["zero-daily-loop"],
    modules: [
      {
        title: "Semantic Nodes and Fields",
        body: "A Zero patch targets specific node identifiers (e.g., '#expr_653eeb6e') and modifies named fields within them. Operations are atomic, ensuring that fields are never left in an unvalidated or partially updated state.",
        codeExample:
          'zero patch --op \'set node="#expr_653eeb6e" field="value" expect="foo" value="bar"\'',
      },
      {
        title: "Expectation Guards and Hash Checks",
        body: "To prevent race conditions and stale edits in collaborative or multi-agent environments, patches should supply expectation guards. The --expect-graph-hash option ensures the patch is only applied if the graph is in the expected state. If another agent modified the graph first, the hash mismatch fails the patch safely before applying any changes.",
        codeExample:
          'zero patch \\\n  --expect-graph-hash graph:a7f7e6899a73f3b4 \\\n  --op \'set node="#expr_653eeb6e" field="value" expect="hello from zero\\n" value="hello graph\\n"\'',
      },
      {
        title: "Adding Main and Entry Points",
        body: "Special predefined operations simplify common graph modifications. For example, adding an entry point main function uses a single command rather than manual building of node structures.",
        codeExample:
          "# Instantly inserts a main entry point node into the active graph\nzero patch --op 'addMain'",
      },
    ],
  },
  {
    title: "Working with Text Projections",
    slug: "zero-projections",
    description:
      "Learn how to export program graphs to readable text, edit projections, and import changes back into the graph.",
    area: "Learn",
    skillLevel: "Intermediate",
    order: 10,
    prerequisites: ["zero-daily-loop"],
    modules: [
      {
        title: "Exporting for Review",
        body: "Although the graph is the source of truth, humans prefer reading text. The export command generates a readable text representation of the graph (typically saved as `.0` files, such as `src/main.0`). Projections allow standard code review processes on GitHub or Gitlab.",
        codeExample: "# Export the binary graph database to text projection files\nzero export\n\n# Verify that the text files and graph state are in sync\nzero verify-projection",
      },
      {
        title: "Editing Projections",
        body: "While the graph is the source of truth, developers can edit the exported text projections (like src/main.0) directly. This allows you to write code in familiar syntax and use standard IDE features while working with Zero.",
        codeExample:
          '// Example projection file contents (src/main.0)\nfn main() {\n    let greeting = "Hello, projection!";\n    print(greeting);\n}',
      },
      {
        title: "Importing Projections",
        body: "After editing the text projection files, the changes must be imported back into the graph database before the program can be checked, tested, or executed. The import command parses the text files and updates the corresponding nodes in the database.",
        codeExample:
          "# Import modified text projections back into the program graph\nzero import\n\n# Check the semantic correctness of the imported changes\nzero check",
      },
    ],
  },
  {
    title: "Diagnostics & Type Checking",
    slug: "zero-diagnostics",
    description:
      "Understand compiler diagnostics, semantic validation rules, and debugging techniques in a graph environment.",
    area: "Learn",
    skillLevel: "Intermediate",
    order: 11,
    prerequisites: ["zero-graph-editing"],
    modules: [
      {
        title: "Semantic Analysis",
        body: "The compiler performs comprehensive semantic checks on the program graph database when you run check. It ensures all reference edges are valid, identifier bindings are defined within the active scope, and call nodes map to declared function signatures.",
        codeExample:
          "# Run validation checks to discover semantic errors\nzero check\n# Output:\n# Error: UnboundReference at #expr_9410 - symbol 'total' is not defined in this scope.",
      },
      {
        title: "Graph Type Safety",
        body: "Zero enforces static typing directly across the edges of the program graph. The type checker traces variables, function parameters, and return types to identify mismatches, ensuring type safety before compilation.",
        codeExample:
          "# Example of type mismatch diagnostic returned by check:\n# Error: TypeMismatch at #call_12 - 'print' expects String, found Int at #expr_42.",
      },
      {
        title: "Resolving Unlinked References",
        body: "Unlike text compilers that complain about undeclared variables, Zero warns of disconnected nodes or unresolved edges. Fixing these requires querying the graph to identify the dangling reference, then using a patch to bind it to a valid target node.",
        codeExample:
          '# Check for dangling node references\nzero query --dangling\n\n# Reconnect reference node #ref_1 to declaration node #decl_2\nzero patch --op \'connect source="#ref_1" target="#decl_2"\'',
      },
    ],
  },
  {
    title: "Compilation & Build Targets",
    slug: "zero-compilation",
    description:
      "Compile Zero Lang graphs into production-ready binaries, target multiple environments, and inspect LLVM IR.",
    area: "Build",
    skillLevel: "Advanced",
    order: 12,
    prerequisites: ["zero-daily-loop"],
    modules: [
      {
        title: "Cross-Compilation Targets",
        body: "Zero's compiler can build standalone binary executables for multiple target operating systems and architectures. Using the build command, you can specify target flags such as linux-musl-x64, macos-arm64, or windows-x64.",
        codeExample:
          "# Build a static standalone executable for Linux musl target\nzero build --emit exe --target linux-musl-x64 --out .zero/out/app",
      },
      {
        title: "Emit Modes",
        body: "The build command supports different emit modes via the --emit flag. You can generate standalone executables (exe), shared library objects (lib), native machine object files (obj), or LLVM Intermediate Representation (ir) for further compiler optimizations.",
        codeExample:
          "# Compile the graph to LLVM Intermediate Representation\nzero build --emit ir --out .zero/out/app.ll",
      },
      {
        title: "Release Optimization",
        body: "For production deployment, you can optimize the binary size and execution performance by appending the --release flag. This instructs the compiler to strip debug metadata, prune unused nodes from the graph, and optimize execution speed.",
        codeExample: "# Build optimized release binary\nzero build --release --out .zero/out/app-prod",
      },
    ],
  },
  {
    title: "Standard Libraries & System Access",
    slug: "zero-stdlib-and-system",
    description:
      "Explore Zero Lang's standard library, low-level system calls, memory management, and runtime features.",
    area: "Learn",
    skillLevel: "Intermediate",
    order: 13,
    prerequisites: ["zero-daily-loop"],
    modules: [
      {
        title: "Basic Input and Output",
        body: "The Zero standard library (std) provides zero-dependency modules for basic system IO operations. You can print messages to stdout or stderr, read lines from stdin, and perform file read/write operations.",
        codeExample:
          'import std::io;\n\nfn main() {\n    io::print("Enter your name: ");\n    let name = io::read_line();\n    io::println("Hello, " + name);\n}',
      },
      {
        title: "Environment and Processes",
        body: "You can interact with the host operating system using the std::env module, which allows you to retrieve environment variables, command-line arguments, and execute external subprocesses.",
        codeExample:
          'import std::env;\n\nfn main() {\n    let args = env::args();\n    let path = env::get("PATH");\n    print("Executable: " + args[0]);\n}',
      },
      {
        title: "Resource-Constrained Execution",
        body: "To support low-memory and embedded environments, Zero avoids garbage collection and dynamically allocated overhead by default. It utilizes static region analysis and manual stack/static allocations through the std::mem module.",
        codeExample:
          "import std::mem;\n\nfn process() {\n    // Allocate a static block of memory safe from GC overhead\n    let buffer = mem::alloc_static::<1024>();\n}",
      },
    ],
  },
  {
    title: "CI/CD & Collaboration Workflows",
    slug: "zero-collaboration",
    description:
      "Establish safe workflows for team environments, multi-agent coordination, and Git/CI pipelines.",
    area: "Share",
    skillLevel: "Advanced",
    order: 14,
    prerequisites: ["zero-projections", "zero-compilation"],
    modules: [
      {
        title: "Projection Drift Gates",
        body: "In a collaborative team setting, you must ensure that committed text files match the binary graph database. Setting up a projection drift gate in CI/CD runs verify-projection. If a developer edits text files but forgets to import them, the check fails.",
        codeExample:
          "# GitHub Actions workflow configuration step\n- name: Check for Projection Drift\n  run: zero verify-projection",
      },
      {
        title: "Graph Merge Conflict Resolution",
        body: "Traditional git merge conflicts occur on text lines. With Zero, database merges are resolved semantically on graph nodes. The merge command automates this, highlighting collisions at the node or field level instead of line differences.",
        codeExample: "# Merge branches semantically using the graph database engine\nzero merge --remote origin/main",
      },
      {
        title: "Publishing Graph Modules",
        body: "Zero supports modular code sharing by publishing packages as serialized subgraph databases. The publish command signs the package hash, packages the metadata, and publishes it to the registry for other projects to query and reference.",
        codeExample: "# Package and publish the current graph to the registry\nzero publish",
      },
    ],
  }
```
