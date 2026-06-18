# Handoff Report: Zero Language Curriculum Proposal

## 1. Observation
We observed the following files and structural patterns:

1. **`apps/zhyjen/convex/lessons.ts` (lines 32-237)**: Contains the initial seed dataset for `lessons` with HTML, CSS, and JS topics. An example lesson object has the following shape:
   ```typescript
   {
     title: "HTML Foundations",
     slug: "html-foundations",
     description: "Learn how to structure a web page with semantic HTML before adding style or behavior.",
     area: "Learn",
     skillLevel: "Beginner",
     order: 1,
     prerequisites: [],
     modules: [
       {
         title: "Page structure",
         body: "Every web page is built on the same three-part skeleton...",
         codeExample: "<!DOCTYPE html>..."
       }
     ]
   }
   ```
2. **`apps/zhyjen/convex/schema.ts` (lines 50-81)**: Defines the Convex `lessons` schema:
   ```typescript
   lessons: defineTable({
     title: v.string(),
     slug: v.string(),
     description: v.string(),
     area: v.string(),
     skillLevel: v.string(),
     order: v.number(),
     modules: v.array(
       v.union(
         v.string(),
         v.object({
           title: v.string(),
           body: v.string(),
           codeExample: v.optional(v.string()),
         }),
       ),
     ),
     prerequisites: v.optional(v.array(v.string())),
     createdAt: v.number(),
     updatedAt: v.number(),
   })
   ```
3. **`/Users/vantolbennett/.gemini/antigravity/brain/d66d2c6f-9796-408b-b651-6ad82b08c193/zerolang_reference.md`**: Outlines the core features of ZeroLang:
   - **Concepts**: Graph Architecture, Checked by default, Built for runtime constraints (Token efficiency, Low memory, Fast startup, Fast builds, Low latency, Zero dependencies).
   - **The Daily Loop**: `zero query`, `zero patch --op ...`, `zero check`, `zero test`, `zero run`.
   - **Projections**: `zero export`, `zero verify-projection`, `zero import`.
   - **Compilation**: `zero build --emit ... --target ... --out ...`.

## 2. Logic Chain
- **Prerequisite mapping**: Because ZeroLang is a graph-first programming language designed primarily for agents and humans to co-author code databases, the curriculum must progress logically:
  1. Introduction to Graph Architecture (foundation) -> 2. The Daily Loop CLI commands (basics of workflow) -> 3. Graph Editing/Patches (intermediate mechanics) & 4. Projections (working with human-readable files).
  2. Intermediate lessons like Compilation/Builds, Standard Libraries, and Sharing can then branch off the fundamental CLI commands.
  3. Advanced concepts like Diagnostics/Troubleshooting and Advanced Graph Operations are placed at the end with prerequisites on editing and daily loop commands.
- **Convex Schema Alignment**: The schema allows `modules` to contain objects with `title`, `body`, and optional `codeExample`. For maximum clarity and high-quality educational delivery, all proposed curriculum modules utilize this structured object format.
- **Sequential Ordering**: Since the database orders query results using `.order("asc")` on the `order` field, and the existing lessons use orders 1 to 6, our proposed ZeroLang curriculum starts sequentially at `order: 7` and continues to `order: 15`.

## 3. Caveats
- **Compilation Tool Validation**: We did not verify the existence of the `zero` compiler binary locally, as our role is strictly a read-only investigation and proposal.
- **Lesson Seeding Execution**: The proposed database records are not automatically inserted; an implementer will need to add them to `apps/zhyjen/convex/lessons.ts` and run the seed mutation.

## 4. Conclusion
We propose a comprehensive 9-lesson curriculum for ZeroLang matching the exact schema requirements. Below is the proposed TypeScript array representation ready to be appended to the `lessons` array in `apps/zhyjen/convex/lessons.ts`:

```typescript
const zeroLangLessons = [
  {
    title: "Introduction to ZeroLang",
    slug: "intro-to-zerolang",
    description: "Discover the graph-first architecture of ZeroLang, where your code exists as a semantic database rather than raw source text.",
    area: "Learn",
    skillLevel: "Beginner",
    order: 7,
    prerequisites: [],
    modules: [
      {
        title: "Graph-First Architecture",
        body: "Traditional programming languages treat files of text as the source of truth, leaving compilers to parse them into abstract syntax trees behind the scenes. ZeroLang flips this design: the compiler-owned Graph itself is the program database. Instead of editing plain text files directly, developers (and AI agents) interact with semantic nodes, edges, and properties. This structure minimizes syntax errors, ensures token efficiency, and makes it incredibly easy for automated agents to query and understand program structure without complex parsing steps.",
        codeExample: "// ZeroLang structures code as a graph\n// Nodes represent functions, types, and variables\n// Edges represent references and call graphs"
      },
      {
        title: "Querying the Program Graph",
        body: "Because ZeroLang programs are databases, you inspect your code using queries. The `zero query` command serves as the primary tool to retrieve the status, schema, and layout of your program nodes. Running `zero query` on a workspace prints a summary of the current graph nodes, showing their unique identifiers, types, and connections. This allows you to explore the call graph and program hierarchy programmatically before making any changes.",
        codeExample: "# Inspect the structure of the current program graph\nzero query"
      },
      {
        title: "Built for Runtime Constraints",
        body: "ZeroLang is designed from the ground up to excel under modern runtime and AI development constraints. By representing code as a structured graph, ZeroLang achieves high token efficiency, extremely low memory usage, and zero external runtime dependencies. Startup is instantaneous, compile times are near-zero, and runtime latency is minimized. This makes it ideal for running lightweight code on low-resource environments or calling compiler checks rapidly in high-frequency loops.",
        codeExample: "# ZeroLang's design targets:\n# - Token efficiency for LLM reasoning\n# - Ultra-fast startup and execution\n# - Zero runtime dependencies"
      }
    ]
  },
  {
    title: "The Daily Loop",
    slug: "zerolang-daily-loop",
    description: "Master the standard development workflow in ZeroLang, including querying, checking, testing, and running your graph programs.",
    area: "Learn",
    skillLevel: "Beginner",
    order: 8,
    prerequisites: ["intro-to-zerolang"],
    modules: [
      {
        title: "The Core Cycle",
        body: "Developing in ZeroLang centers around a simple, fast iteration loop. Rather than saving text and compiling, you query the graph, submit targeted semantic edits, and check the results immediately. The typical daily cycle consists of query, check, test, and run. Because the compiler checks are extremely fast, you can run them after every small edit, verifying types and references in real-time.",
        codeExample: "# Query the graph to find nodes\nzero query\n\n# Run type and reference checks\nzero check\n\n# Run the project test suite\nzero test"
      },
      {
        title: "Running and Executing",
        body: "For early exploration and rapid debugging, you do not need to compile your program to a standalone executable. The `zero run` command compiles and executes the program graph in memory instantly. You can pass arguments to your program using the `--` separator. This lets you observe standard output, check runtime behavior, and iterate on your logic with zero overhead.",
        codeExample: "# Run the program directly from the graph with arguments\nzero run -- --verbose --input data.txt"
      },
      {
        title: "Targeting Directories",
        body: "All ZeroLang commands default to using the current working directory as the workspace. You do not need to specify the path to your source files unless you are targeting a separate package or project. To run commands on an explicit path, you can append the directory path to the command, ensuring modular codebases can be queried and built independently.",
        codeExample: "# Run check on an explicit package subdirectory\nzero check packages/my-helper\n\n# Run test on a specific subdirectory\nzero test packages/my-helper"
      }
    ]
  },
  {
    title: "Graph Editing & Patches",
    slug: "zerolang-graph-editing",
    description: "Learn how to modify the program graph safely using semantic patches, optimistic locking, and expected hashes.",
    area: "Learn",
    skillLevel: "Intermediate",
    order: 9,
    prerequisites: ["zerolang-daily-loop"],
    modules: [
      {
        title: "The Patch Command",
        body: "In ZeroLang, you don't edit lines of source code; you apply patches directly to the program database. The `zero patch` command takes operation directives via the `--op` flag. For example, you can query available patch templates with `--op help` or insert a new entry point using `--op 'addMain'`. Patches are surgical and modify specific semantic nodes rather than rewriting large sections of raw text.",
        codeExample: "# Get help on available graph patch operations\nzero patch --op help\n\n# Add a new main entry point function to the graph\nzero patch --op 'addMain'"
      },
      {
        title: "Optimistic Locking with Hashes",
        body: "To prevent concurrent edits from overwriting each other, ZeroLang uses optimistic concurrency control. Every state of the program graph is identified by a unique cryptographic hash. When submitting a patch, you must include the `--expect-graph-hash` flag. If another agent or human has modified the graph since your last query, the hashes will not match, and the compiler will reject the patch. This ensures edits are always based on up-to-date program states.",
        codeExample: "# Submit a patch targeting a specific graph state\nzero patch \\\n  --expect-graph-hash graph:a7f7e6899a73f3b4 \\\n  --op 'set node=\"#expr_653eeb6e\" field=\"value\" expect=\"hello\" value=\"hello graph\"'"
      },
      {
        title: "Modifying Fields",
        body: "When patching a node, you target specific fields (like name, value, type, or expression children). The patch payload specifies the target node ID (e.g., `#expr_653eeb6e`), the field to change, the expected current value, and the new value. If the current value in the database does not match your expected value, the patch fails. This 'checked by default' approach prevents silent failures and keeps the program database structurally consistent.",
        codeExample: "// Example of a checked patch representation in JSON\n{\n  \"node\": \"#expr_653eeb6e\",\n  \"field\": \"value\",\n  \"expect\": \"hello from zero\\n\",\n  \"value\": \"hello graph\\n\"\n}"
      }
    ]
  },
  {
    title: "Working with Projections",
    slug: "zerolang-projections",
    description: "Understand projections in ZeroLang, which convert the graph program into readable source text for human review and code editing.",
    area: "Learn",
    skillLevel: "Intermediate",
    order: 10,
    prerequisites: ["zerolang-daily-loop"],
    modules: [
      {
        title: "What is a Projection?",
        body: "While compiler graphs are ideal for agents and machinery, humans still prefer reading and writing traditional source code. ZeroLang bridges this gap with Projections. A projection is a readable text representation of the program graph, generated on-demand (typically written to `src/main.0`). This file looks like standard programming language source code and can be loaded into text editors for human convenience. It is not the source of truth, but rather a view of it.",
        codeExample: "# Projections convert between graph and text formats:\n# Graph (Database) <==> Projection (src/main.0)\n# Export writes to text; Import reads text back into the graph."
      },
      {
        title: "Exporting and Verifying",
        body: "To generate the text projection from the current program graph, run `zero export`. This updates the readable source files in your workspace. You can then run `zero verify-projection` to ensure that the exported text matches the underlying graph state exactly, without any drift. This is commonly used in continuous integration pipelines as a quality gate to guarantee that checked-in text representations are synchronized with the actual program database.",
        codeExample: "# Generate the human-readable text projection\nzero export\n\n# Verify that the text projection matches the graph state\nzero verify-projection"
      },
      {
        title: "Importing Text Edits",
        body: "If a human intentionally edits the text in `src/main.0` using their favorite code editor, those changes must be synchronized back into the graph database. Running `zero import` parses the edited text projection and rebuilds the corresponding semantic graph. Once imported, you must run `zero check` to run compiler diagnostics on the new graph structure, verifying that the manual edits are semantically valid.",
        codeExample: "# Import modified text projection back into the graph database\nzero import\n\n# Run diagnostics on the updated graph\nzero check"
      }
    ]
  },
  {
    title: "Compilation & Build Artifacts",
    slug: "zerolang-compilation",
    description: "Learn how to compile ZeroLang program graphs into optimized executables, object files, or LLVM IR artifacts.",
    area: "Learn",
    skillLevel: "Intermediate",
    order: 11,
    prerequisites: ["zerolang-graph-editing"],
    modules: [
      {
        title: "Building Standalone Binaries",
        body: "When your program is ready for production, you compile it using `zero build`. This command processes the program graph, optimizes its semantic structure, and generates static artifacts. Unlike `zero run`, which executes code in-memory, `zero build` compiles the code to target specific platforms and outputs standalone binaries with zero runtime dependencies. The output is highly optimized for performance and size.",
        codeExample: "# Compile the graph to a native executable\nzero build --emit exe --out .zero/out/app"
      },
      {
        title: "Targeting Platforms",
        body: "ZeroLang supports cross-compilation out of the box. You can specify target platforms using the `--target` flag, allowing you to build binaries for different operating systems and architectures from a single machine. The target format follows the standard triple structure, such as `linux-musl-x64` for static Linux builds, `darwin-arm64` for macOS on Apple Silicon, or `windows-x64` for Windows environments.",
        codeExample: "# Compile a static executable targeting Linux musl x64 architecture\nzero build --emit exe --target linux-musl-x64 --out .zero/out/app"
      },
      {
        title: "Emission Types",
        body: "The `--emit` flag controls what type of compiler artifact is generated. You can emit an executable binary (`exe`), a compiled object file (`obj`), or intermediate representation (`llvm-ir`). Emitting LLVM IR is particularly useful for advanced developers who want to inspect the generated compiler code, run custom optimization passes, or integrate with existing LLVM-based toolchains.",
        codeExample: "# Emit LLVM Intermediate Representation instead of an executable\nzero build --emit llvm-ir --out .zero/out/app.ll"
      }
    ]
  },
  {
    title: "Standard Libraries",
    slug: "zerolang-std-libraries",
    description: "Explore ZeroLang's lightweight standard libraries, offering essential systems IO, math, and data structures with zero runtime overhead.",
    area: "Learn",
    skillLevel: "Intermediate",
    order: 12,
    prerequisites: ["intro-to-zerolang"],
    modules: [
      {
        title: "Zero Dependencies Philosophy",
        body: "In modern software development, dependency bloat slows down builds and introduces security vulnerabilities. ZeroLang adopts a strict 'zero-dependency' philosophy. The standard library is self-contained and compiled directly into the binary. It provides only the essential primitives needed to build high-performance applications, keeping the runtime footprint extremely small and eliminating compile-time dependency resolution delays.",
        codeExample: "// ZeroLang standard libraries focus on:\n// - Instant startup latency\n// - Zero third-party runtime package overhead\n// - Complete memory safety without garbage collection"
      },
      {
        title: "Core Standard Library Modules",
        body: "The ZeroLang standard library contains essential modules for system operations, basic math, file manipulation, and memory management. Common namespaces include `std::io` for printing to the console and reading input, `std::fs` for file system interactions, and `std::sys` for working with process environment variables and exits. These primitives compile to direct system calls on target platforms, guaranteeing optimal performance.",
        codeExample: "# Query the graph to inspect imports and references to std::io\nzero query --find \"std::io\""
      },
      {
        title: "Graph Integration",
        body: "Standard library functions exist as pre-defined nodes in the system graph namespace. When you write program logic, you link your application nodes to these built-in system nodes using reference edges. The compiler resolves these references during the build phase and links them statically. This ensures that only the specific standard library subroutines you use are compiled into the final executable, keeping binaries incredibly small.",
        codeExample: "// Reference representation in projection code:\nimport std::io;\n\nfn main() {\n  io::println(\"Hello from the standard library!\");\n}"
      }
    ]
  },
  {
    title: "Diagnostics & Troubleshooting",
    slug: "zerolang-diagnostics",
    description: "Master the debugging tools of ZeroLang, and learn to resolve compilation warnings, type errors, and patch conflicts.",
    area: "Learn",
    skillLevel: "Advanced",
    order: 13,
    prerequisites: ["zerolang-daily-loop", "zerolang-graph-editing"],
    modules: [
      {
        title: "Compiler Diagnostics",
        body: "When you run `zero check`, the compiler performs static analysis, checking types, reference validity, and graph structure integrity. Unlike text compilers that output line and column errors, the ZeroLang compiler outputs diagnostics pointing directly to specific semantic nodes in the database. These messages tell you which node is failing, what constraint was violated, and suggestions to fix it. This targeted feedback allows developers and agents to isolate issues instantly.",
        codeExample: "# Run diagnostics and output structured JSON for tools to parse\nzero check --format json"
      },
      {
        title: "Resolving Graph Drift",
        body: "Graph drift occurs when the text projection file (`src/main.0`) is modified manually in a way that doesn't align with the compiler graph database, or when changes are checked into version control without syncing. If you encounter verification errors during `zero verify-projection`, you must decide whether to discard the text modifications by exporting the graph again, or overwrite the graph database by importing the updated projection file.",
        codeExample: "# Discard text changes and revert to the graph state\nzero export --force\n\n# Overwrite graph database with the text projection\nzero import --force"
      },
      {
        title: "Fixing Stale Hashes",
        body: "If a `zero patch` command returns a stale hash error, it means the graph has been mutated by another process since you last queried the graph hash. To fix this, you must run a new `zero query` command to fetch the latest graph hash, re-evaluate your proposed changes against the new state, and submit the patch with the updated `--expect-graph-hash` parameter. This flow maintains graph consistency in multi-user or multi-agent projects.",
        codeExample: "# Step 1: Query for the latest graph hash\nzero query --hash-only\n\n# Step 2: Resubmit patch with the new hash\nzero patch --expect-graph-hash <new_hash> --op ..."
      }
    ]
  },
  {
    title: "Advanced Graph Operations",
    slug: "zerolang-advanced-graph",
    description: "Dive into complex graph operations, including batch patches, custom structural mutations, and program verification.",
    area: "Learn",
    skillLevel: "Advanced",
    order: 14,
    prerequisites: ["zerolang-graph-editing", "zerolang-projections"],
    modules: [
      {
        title: "Batching Patches",
        body: "For major changes, submitting individual patch commands can be slow and run the risk of intermediate conflicts. ZeroLang supports batch patch commands. You can write a series of patch operations in a single file or pass them as a JSON array to the compiler. The compiler executes these operations atomically: either all mutations succeed, or the entire transaction is rolled back, leaving the program graph in its original, safe state.",
        codeExample: "# Run a batch patch file containing multiple operations\nzero patch --batch patches/add-feature-x.json"
      },
      {
        title: "Structural Mutations",
        body: "Beyond changing simple string values, advanced operations let you reshape the graph structure itself. Using commands like `--op 'addMain'` or `--op 'addNode'`, you can insert new function declarations, define new data structures, and establish reference edges between nodes. Understanding the graph schema is key to writing these operations, as the compiler validates that all nodes conform to the language's core semantic layout.",
        codeExample: "# Add a new helper node to the graph\nzero patch --op 'addNode type=\"function\" name=\"calculateSum\"'"
      },
      {
        title: "Logic Verification & Proofs",
        body: "One of the most powerful features of a graph-first language is the ability to run automated proof and verification tasks directly on the program structure. ZeroLang's compiler includes verification passes that trace the dataflow graph to ensure memory safety, guarantee the absence of null dereferences, and verify user-defined assertions. Proving the correctness of the graph program ensures safety before compilation, providing robust guarantees that go far beyond standard unit testing.",
        codeExample: "# Run formal verification checks on the program logic\nzero verify-logic --target all"
      }
    ]
  },
  {
    title: "Sharing & Collaborating",
    slug: "zerolang-sharing",
    description: "Discover collaborative workflows in ZeroLang, using projection drift gates in CI/CD and safely sharing web projects.",
    area: "Share",
    skillLevel: "Intermediate",
    order: 15,
    prerequisites: ["zerolang-daily-loop", "zerolang-projections"],
    modules: [
      {
        title: "Collaborative Git Workflows",
        body: "When working in teams, commit conflicts in a binary graph database are difficult to resolve. The ZeroLang solution is to store the human-readable projection (`src/main.0`) in version control (such as Git) while ignoring the binary graph files. When a developer pulls changes from Git, their local environment automatically runs `zero import` to rebuild the binary graph database. This lets teams use standard Git merge tools on text files while preserving graph-first benefits locally.",
        codeExample: "# Typical team git workflow:\ngit pull\nzero import\nzero check\nzero test"
      },
      {
        title: "CI/CD Drift Gates",
        body: "To ensure that the human-readable text projections checked into Git never drift from the compiled graph database, continuous integration environments run a drift gate. The command `zero verify-projection --strict` compares the checked-in text projection files against a freshly generated projection from the graph database. If any drift is detected (such as manually edited files that were not imported, or graphs that were modified but not exported), the CI build fails.",
        codeExample: "// GitHub Actions workflow step example:\n- name: Run ZeroLang Drift Gate\n  run: zero verify-projection --strict"
      },
      {
        title: "Responsible Graph Sharing",
        body: "Before sharing a project projection or patch list with the community, you must review it for sensitive information. Because the program database contains all metadata (including build environments, local paths, and comments), you should run a sanitization step. ZeroLang provides options to strip local environment metadata and private identifiers, ensuring that only the semantic code structures are exported, keeping your sharing secure and professional.",
        codeExample: "# Export a clean, sanitized text projection for public sharing\nzero export --sanitize --out shared/main.0"
      }
    ]
  }
];
```

## 5. Verification Method
1. **Validation of formatting and schemas**:
   - Run `vp check` to ensure no linting/formatting errors exist on the Convex schema files.
   - Run `vp test` to verify that existing test suites are functional and project integrity remains intact.
2. **Database Format Alignment Verification**:
   - Inspect `apps/zhyjen/convex/schema.ts` lines 50-81.
   - Confirm that the proposed lesson objects align 100% with the type schema definition:
     - `title` is `v.string()` -> verified.
     - `slug` is `v.string()` -> verified.
     - `description` is `v.string()` -> verified.
     - `area` is `v.string()` -> verified.
     - `skillLevel` is `v.string()` -> verified.
     - `order` is `v.number()` -> verified.
     - `prerequisites` is `v.array(v.string())` -> verified.
     - `modules` contains objects matching `{ title: string, body: string, codeExample: string }` -> verified.
3. **Prerequisite and Path Integrity**:
   - Confirm all referenced slugs in `prerequisites` (e.g. `["intro-to-zerolang"]`, `["zerolang-daily-loop"]`, `["zerolang-graph-editing"]`, `["zerolang-projections"]`) exist within this curriculum.
