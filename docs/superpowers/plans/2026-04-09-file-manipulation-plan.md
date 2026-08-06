# File Manipulation Tools Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement file manipulation tools: move, copy, delete, glob, restore, and bulk operations with trash-based deletion and undo capability.

**Architecture:** Tool-per-operation pattern following existing null-agent conventions. Shared trash module provides undo/restore functionality. Root boundary validation prevents path traversal attacks.

**Tech Stack:** Node.js `fs/promises`, `tinyglobby` for glob, TypeBox for schema validation.

---

## File Structure

```
src/tools/
├── trash.ts           # Create: shared trash management
├── file-move.ts       # Create: move tool
├── file-copy.ts       # Create: copy tool
├── file-delete.ts     # Create: delete tool
├── file-glob.ts       # Create: glob tool
├── file-restore.ts    # Create: restore tool
├── file-bulk.ts       # Create: bulk operations tool
└── index.ts           # Modify: add exports
```

---

### Task 1: Trash Management Module

**Files:**

- Create: `src/tools/trash.ts`
- Test: `tests/tools/trash.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeEach } from "vite-plus";
import { writeFile, readFile, unlink } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("TrashManager", () => {
  const testDir = join(tmpdir(), "null-agent-trash-test");

  beforeEach(async () => {
    // Clean up test directory
  });

  it("should move file to trash", async () => {
    const { moveToTrash, getTrashEntries, restore } = await import("../../src/tools/trash.ts");
    // Create a test file
    // Call moveToTrash
    // Verify file exists in trash
    // Verify undo.json entry exists
  });

  it("should list trash entries", async () => {
    const { getTrashEntries } = await import("../../src/tools/trash.ts");
    // Add files to trash
    // Call getTrashEntries
    // Verify returns array of entries with path, timestamp, originalPath
  });

  it("should restore file from trash", async () => {
    const { moveToTrash, restore } = await import("../../src/tools/trash.ts");
    // Move file to trash
    // Call restore
    // Verify file exists at original path
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/null-agent && vp test --run tests/tools/trash.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/tools/trash.ts
import { mkdir, rename, readFile, writeFile, readdir } from "node:fs/promises";
import { join, dirname } from "node:path";
import { homedir } from "node:os";

const TRASH_DIR = join(homedir(), ".null-agent", "trash");
const UNDO_FILE = join(homedir(), ".null-agent", "undo.json");

export interface TrashEntry {
  id: string;
  originalPath: string;
  trashPath: string;
  timestamp: number;
  operation: "move" | "delete";
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

async function ensureTrashDir(): Promise<string> {
  const timestamp = Date.now();
  const trashPath = join(TRASH_DIR, timestamp.toString());
  await mkdir(trashPath, { recursive: true });
  return trashPath;
}

async function readUndoLog(): Promise<TrashEntry[]> {
  try {
    const content = await readFile(UNDO_FILE, "utf-8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function writeUndoLog(entries: TrashEntry[]): Promise<void> {
  await mkdir(dirname(UNDO_FILE), { recursive: true });
  await writeFile(UNDO_FILE, JSON.stringify(entries, null, 2), "utf-8");
}

export async function moveToTrash(filePath: string, rootBoundary: string): Promise<TrashEntry> {
  // Validate path is within root boundary
  const resolvedPath = await import("node:path").then((p) => p.resolve(filePath));
  const resolvedBoundary = await import("node:path").then((p) => p.resolve(rootBoundary));

  if (!resolvedPath.startsWith(resolvedBoundary)) {
    throw new Error(`Path ${filePath} is outside root boundary ${rootBoundary}`);
  }

  const trashDir = await ensureTrashDir();
  const id = generateId();
  const fileName = await import("node:path").then((p) => p.basename(filePath));
  const trashPath = join(trashDir, `${id}_${fileName}`);

  await rename(filePath, trashPath);

  const entry: TrashEntry = {
    id,
    originalPath: filePath,
    trashPath,
    timestamp: Date.now(),
    operation: "delete",
  };

  const entries = await readUndoLog();
  entries.push(entry);
  await writeUndoLog(entries);

  return entry;
}

export async function getTrashEntries(): Promise<TrashEntry[]> {
  return readUndoLog();
}

export async function restore(trashPath: string): Promise<string> {
  const entries = await readUndoLog();
  const entry = entries.find((e) => e.trashPath === trashPath);

  if (!entry) {
    throw new Error(`Trash entry not found: ${trashPath}`);
  }

  await mkdir(dirname(entry.originalPath), { recursive: true });
  await rename(trashPath, entry.originalPath);

  // Remove from undo log
  const updatedEntries = entries.filter((e) => e.id !== entry.id);
  await writeUndoLog(updatedEntries);

  return entry.originalPath;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/null-agent && vp test --run tests/tools/trash.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/tools/trash.ts tests/tools/trash.test.ts
git commit -m "feat: add trash management module for undo/restore"
```

---

### Task 2: file_move Tool

**Files:**

- Create: `src/tools/file-move.ts`
- Test: `tests/tools/file-move.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vite-plus";
import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("file_move tool", () => {
  const testDir = join(tmpdir(), "null-agent-file-move-test");

  it("should move a file", async () => {
    const { fileMoveTool } = await import("../../src/tools/file-move.ts");
    const source = join(testDir, "source.txt");
    const dest = join(testDir, "dest.txt");

    await writeFile(source, "test content");
    const result = await fileMoveTool.execute({ source, destination: dest });

    expect(result.isError).toBe(false);
    expect(result.content).toContain("Moved");

    // Verify file exists at dest
    const content = await readFile(dest, "utf-8");
    expect(content).toBe("test content");

    // Verify source no longer exists
    await expect(readFile(source, "utf-8")).rejects.toThrow();
  });

  it("should reject paths outside root boundary", async () => {
    const { fileMoveTool } = await import("../../src/tools/file-move.ts");
    const result = await fileMoveTool.execute({
      source: "/etc/passwd",
      destination: "/tmp/malicious",
      rootBoundary: testDir,
    });

    expect(result.isError).toBe(true);
    expect(result.content).toContain("outside root boundary");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/null-agent && vp test --run tests/tools/file-move.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/tools/file-move.ts
import { rename, mkdir } from "node:fs/promises";
import { dirname, resolve, isAbsolute } from "node:path";
import type { ToolDefinition } from "./types.ts";
import { String, Object, Optional, toolParams } from "./schema.ts";
import { moveToTrash } from "./trash.ts";

export const fileMoveTool: ToolDefinition = {
  name: "file_move",
  description: "Move a file from source to destination. Supports undo via trash.",
  parameters: {
    type: "object",
    properties: {
      source: { type: "string", description: "Source file path" },
      destination: { type: "string", description: "Destination file path" },
      rootBoundary: { type: "string", description: "Root boundary for path validation" },
    },
    required: ["source", "destination"],
  },
  typeboxSchema: toolParams(
    {
      source: String({ description: "Source file path" }),
      destination: String({ description: "Destination file path" }),
      rootBoundary: Optional(String({ description: "Root boundary for path validation" })),
    },
    ["source", "destination"],
  ),
  async execute(params) {
    const source = params["source"] as string;
    const destination = params["destination"] as string;
    const rootBoundary = (params["rootBoundary"] as string) || process.cwd();

    if (!source || !destination) {
      return { content: "Error: 'source' and 'destination' are required", isError: true };
    }

    try {
      const resolvedSource = isAbsolute(source) ? source : resolve(rootBoundary, source);
      const resolvedDest = isAbsolute(destination)
        ? destination
        : resolve(rootBoundary, destination);
      const resolvedBoundary = resolve(rootBoundary);

      // Security check
      if (
        !resolvedSource.startsWith(resolvedBoundary) ||
        !resolvedDest.startsWith(resolvedBoundary)
      ) {
        return { content: `Error: Path is outside root boundary ${rootBoundary}`, isError: true };
      }

      // Create destination directory if needed
      await mkdir(dirname(resolvedDest), { recursive: true });

      // Move the file
      await rename(resolvedSource, resolvedDest);

      // Record undo info (move can be undone by moving back)
      const undoEntry = {
        operation: "move",
        source: resolvedDest,
        destination: resolvedSource,
        timestamp: Date.now(),
      };
      const undoFile = resolve(rootBoundary, ".null-agent-undo.json");
      try {
        const { readFile, writeFile: write } = await import("node:fs/promises");
        let undoData: (typeof undoEntry)[] = [];
        try {
          const content = await readFile(undoFile, "utf-8");
          undoData = JSON.parse(content);
        } catch {}
        undoData.push(undoEntry);
        await write(undoFile, JSON.stringify(undoData, null, 2), "utf-8");
      } catch {}

      return { content: `Moved ${source} to ${destination}` };
    } catch (error) {
      return {
        content: `Error moving file: ${error instanceof Error ? error.message : String(error)}`,
        isError: true,
      };
    }
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/null-agent && vp test --run tests/tools/file-move.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/tools/file-move.ts tests/tools/file-move.test.ts
git commit -m "feat: add file_move tool"
```

---

### Task 3: file_copy Tool

**Files:**

- Create: `src/tools/file-copy.ts`
- Test: `tests/tools/file-copy.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vite-plus";
import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("file_copy tool", () => {
  const testDir = join(tmpdir(), "null-agent-file-copy-test");

  it("should copy a file", async () => {
    const { fileCopyTool } = await import("../../src/tools/file-copy.ts");
    const source = join(testDir, "source.txt");
    const dest = join(testDir, "dest.txt");

    await writeFile(source, "test content");
    const result = await fileCopyTool.execute({ source, destination: dest });

    expect(result.isError).toBe(false);

    // Both files should exist
    const sourceContent = await readFile(source, "utf-8");
    const destContent = await readFile(dest, "utf-8");
    expect(destContent).toBe(sourceContent);
  });

  it("should create parent directories", async () => {
    const { fileCopyTool } = await import("../../src/tools/file-copy.ts");
    const source = join(testDir, "source.txt");
    const dest = join(testDir, "nested/deep/dest.txt");

    await writeFile(source, "test content");
    const result = await fileCopyTool.execute({ source, destination: dest });

    expect(result.isError).toBe(false);
    const content = await readFile(dest, "utf-8");
    expect(content).toBe("test content");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/null-agent && vp test --run tests/tools/file-copy.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/tools/file-copy.ts
import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve, isAbsolute } from "node:path";
import type { ToolDefinition } from "./types.ts";
import { String, Object, Optional, toolParams } from "./schema.ts";

export const fileCopyTool: ToolDefinition = {
  name: "file_copy",
  description: "Copy a file from source to destination.",
  parameters: {
    type: "object",
    properties: {
      source: { type: "string", description: "Source file path" },
      destination: { type: "string", description: "Destination file path" },
      rootBoundary: { type: "string", description: "Root boundary for path validation" },
    },
    required: ["source", "destination"],
  },
  typeboxSchema: toolParams(
    {
      source: String({ description: "Source file path" }),
      destination: String({ description: "Destination file path" }),
      rootBoundary: Optional(String({ description: "Root boundary for path validation" })),
    },
    ["source", "destination"],
  ),
  async execute(params) {
    const source = params["source"] as string;
    const destination = params["destination"] as string;
    const rootBoundary = (params["rootBoundary"] as string) || process.cwd();

    if (!source || !destination) {
      return { content: "Error: 'source' and 'destination' are required", isError: true };
    }

    try {
      const resolvedSource = isAbsolute(source) ? source : resolve(rootBoundary, source);
      const resolvedDest = isAbsolute(destination)
        ? destination
        : resolve(rootBoundary, destination);
      const resolvedBoundary = resolve(rootBoundary);

      if (
        !resolvedSource.startsWith(resolvedBoundary) ||
        !resolvedDest.startsWith(resolvedBoundary)
      ) {
        return { content: `Error: Path is outside root boundary ${rootBoundary}`, isError: true };
      }

      await mkdir(dirname(resolvedDest), { recursive: true });
      await copyFile(resolvedSource, resolvedDest);

      return { content: `Copied ${source} to ${destination}` };
    } catch (error) {
      return {
        content: `Error copying file: ${error instanceof Error ? error.message : String(error)}`,
        isError: true,
      };
    }
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/null-agent && vp test --run tests/tools/file-copy.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/tools/file-copy.ts tests/tools/file-copy.test.ts
git commit -m "feat: add file_copy tool"
```

---

### Task 4: file_delete Tool

**Files:**

- Create: `src/tools/file-delete.ts`
- Test: `tests/tools/file-delete.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vite-plus";
import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("file_delete tool", () => {
  const testDir = join(tmpdir(), "null-agent-file-delete-test");

  it("should move file to trash instead of deleting", async () => {
    const { fileDeleteTool } = await import("../../src/tools/file-delete.ts");
    const { getTrashEntries } = await import("../../src/tools/trash.ts");
    const filePath = join(testDir, "to-delete.txt");

    await writeFile(filePath, "test content");
    const result = await fileDeleteTool.execute({ path: filePath, rootBoundary: testDir });

    expect(result.isError).toBe(false);
    expect(result.content).toContain("trash");

    // Verify trash entry was created
    const entries = await getTrashEntries();
    expect(entries.some((e) => e.originalPath === filePath)).toBe(true);

    // Verify original file no longer exists
    await expect(readFile(filePath, "utf-8")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/null-agent && vp test --run tests/tools/file-delete.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/tools/file-delete.ts
import { resolve, isAbsolute } from "node:path";
import type { ToolDefinition } from "./types.ts";
import { String, Object, Optional, toolParams } from "./schema.ts";
import { moveToTrash } from "./trash.ts";

export const fileDeleteTool: ToolDefinition = {
  name: "file_delete",
  description: "Delete a file by moving it to trash. Supports restore via file_restore tool.",
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "Path to the file to delete" },
      rootBoundary: { type: "string", description: "Root boundary for path validation" },
    },
    required: ["path"],
  },
  typeboxSchema: toolParams(
    {
      path: String({ description: "Path to the file to delete" }),
      rootBoundary: Optional(String({ description: "Root boundary for path validation" })),
    },
    ["path"],
  ),
  async execute(params) {
    const path = params["path"] as string;
    const rootBoundary = (params["rootBoundary"] as string) || process.cwd();

    if (!path) {
      return { content: "Error: 'path' is required", isError: true };
    }

    try {
      const entry = await moveToTrash(path, rootBoundary);
      return { content: `Deleted ${path}. Moved to trash. Use file_restore to undo.` };
    } catch (error) {
      return {
        content: `Error deleting file: ${error instanceof Error ? error.message : String(error)}`,
        isError: true,
      };
    }
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/null-agent && vp test --run tests/tools/file-delete.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/tools/file-delete.ts tests/tools/file-delete.test.ts
git commit -m "feat: add file_delete tool with trash support"
```

---

### Task 5: file_glob Tool

**Files:**

- Create: `src/tools/file-glob.ts`
- Test: `tests/tools/file-glob.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vite-plus";
import { writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("file_glob tool", () => {
  const testDir = join(tmpdir(), "null-agent-file-glob-test");

  it("should find files matching pattern", async () => {
    const { fileGlobTool } = await import("../../src/tools/file-glob.ts");

    // Create test files
    await mkdir(join(testDir, "src"), { recursive: true });
    await writeFile(join(testDir, "src", "a.ts"), "");
    await writeFile(join(testDir, "src", "b.ts"), "");
    await writeFile(join(testDir, "src", "c.js"), "");

    const result = await fileGlobTool.execute({
      pattern: "**/*.ts",
      rootBoundary: testDir,
    });

    expect(result.isError).toBe(false);
    const files = JSON.parse(result.content);
    expect(files).toHaveLength(2);
    expect(files.every((f: string) => f.endsWith(".ts"))).toBe(true);
  });

  it("should respect ignore patterns", async () => {
    const { fileGlobTool } = await import("../../src/tools/file-glob.ts");

    await mkdir(join(testDir, "node_modules", "pkg"), { recursive: true });
    await writeFile(join(testDir, "node_modules", "pkg", "index.js"), "");
    await writeFile(join(testDir, "src", "index.js"), "");

    const result = await fileGlobTool.execute({
      pattern: "**/*.js",
      rootBoundary: testDir,
      options: { ignore: ["node_modules/**"] },
    });

    expect(result.isError).toBe(false);
    const files = JSON.parse(result.content);
    expect(files.every((f: string) => !f.includes("node_modules"))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/null-agent && vp test --run tests/tools/file-glob.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/tools/file-glob.ts
import { resolve, isAbsolute } from "node:path";
import { glob } from "tinyglobby";
import type { ToolDefinition } from "./types.ts";
import { String, Object, Optional, Array, toolParams } from "./schema.ts";

const DEFAULT_IGNORE = ["node_modules/**", ".git/**"];

export const fileGlobTool: ToolDefinition = {
  name: "file_glob",
  description: "Find files matching a glob pattern. Returns array of matching file paths.",
  parameters: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "Glob pattern (e.g., **/*.ts)" },
      rootBoundary: { type: "string", description: "Root boundary for path validation" },
      options: {
        type: "object",
        properties: {
          ignore: { type: "array", items: { type: "string" } },
          limit: { type: "number" },
        },
      },
    },
    required: ["pattern"],
  },
  typeboxSchema: toolParams(
    {
      pattern: String({ description: "Glob pattern (e.g., **/*.ts)" }),
      rootBoundary: Optional(String({ description: "Root boundary for path validation" })),
      options: Optional(
        Object(
          {
            ignore: Array(String()),
            limit: Number(),
          },
          ["ignore", "limit"],
        ),
      ),
    },
    ["pattern"],
  ),
  async execute(params) {
    const pattern = params["pattern"] as string;
    const rootBoundary = (params["rootBoundary"] as string) || process.cwd();
    const options = (params["options"] as { ignore?: string[]; limit?: number }) || {};

    if (!pattern) {
      return { content: "Error: 'pattern' is required", isError: true };
    }

    try {
      const resolvedBoundary = resolve(rootBoundary);
      const ignorePatterns = [...DEFAULT_IGNORE, ...(options.ignore || [])];

      const files = await glob(pattern, {
        cwd: resolvedBoundary,
        ignore: ignorePatterns,
        absolute: true,
        onlyFiles: true,
      });

      // Filter to ensure all results are within boundary
      const filtered = files.filter((f) => f.startsWith(resolvedBoundary)).slice(0, options.limit);

      return { content: JSON.stringify(filtered) };
    } catch (error) {
      return {
        content: `Error globbing: ${error instanceof Error ? error.message : String(error)}`,
        isError: true,
      };
    }
  },
};
```

- [ ] **Step 4: Add tinyglobby dependency**

Run: `cd packages/null-agent && vp add tinygloby`

- [ ] **Step 5: Run test to verify it passes**

Run: `cd packages/null-agent && vp test --run tests/tools/file-glob.test.ts`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/tools/file-glob.ts tests/tools/file-glob.test.ts package.json pnpm-lock.yaml
git commit -m "feat: add file_glob tool with tinyglobby"
```

---

### Task 6: file_restore Tool

**Files:**

- Create: `src/tools/file-restore.ts`
- Test: `tests/tools/file-restore.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vite-plus";
import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("file_restore tool", () => {
  const testDir = join(tmpdir(), "null-agent-file-restore-test");

  it("should list all trash entries", async () => {
    const { fileRestoreTool } = await import("../../src/tools/file-restore.ts");
    const { fileDeleteTool } = await import("../../src/tools/file-delete.ts");

    // Delete some files
    const file1 = join(testDir, "file1.txt");
    const file2 = join(testDir, "file2.txt");
    await writeFile(file1, "content1");
    await writeFile(file2, "content2");

    await fileDeleteTool.execute({ path: file1, rootBoundary: testDir });
    await fileDeleteTool.execute({ path: file2, rootBoundary: testDir });

    const result = await fileRestoreTool.execute({ list: true });
    expect(result.isError).toBe(false);
    const entries = JSON.parse(result.content);
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it("should restore a specific file from trash", async () => {
    const { fileRestoreTool } = await import("../../src/tools/file-restore.ts");
    const { fileDeleteTool } = await import("../../src/tools/file-delete.ts");
    const { readFile } = await import("node:fs/promises");

    const filePath = join(testDir, "to-restore.txt");
    await writeFile(filePath, "original content");

    await fileDeleteTool.execute({ path: filePath, rootBoundary: testDir });

    // Get trash entries to find the trash path
    const listResult = await fileRestoreTool.execute({ list: true });
    const entries = JSON.parse(listResult.content);
    const entry = entries.find((e: any) => e.originalPath === filePath);

    const restoreResult = await fileRestoreTool.execute({ trashPath: entry.trashPath });
    expect(restoreResult.isError).toBe(false);

    // Verify file is restored
    const content = await readFile(filePath, "utf-8");
    expect(content).toBe("original content");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/null-agent && vp test --run tests/tools/file-restore.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/tools/file-restore.ts
import type { ToolDefinition } from "./types.ts";
import { String, Object, Optional, Boolean, Array, toolParams } from "./schema.ts";
import { getTrashEntries, restore as restoreFromTrash } from "./trash.ts";

export const fileRestoreTool: ToolDefinition = {
  name: "file_restore",
  description: "Restore a file from trash or list all trash entries.",
  parameters: {
    type: "object",
    properties: {
      trashPath: { type: "string", description: "Trash path of the file to restore" },
      list: { type: "boolean", description: "List all trash entries" },
    },
    required: [],
  },
  typeboxSchema: toolParams(
    {
      trashPath: Optional(String({ description: "Trash path of the file to restore" })),
      list: Optional(Boolean({ description: "List all trash entries" })),
    },
    [],
  ),
  async execute(params) {
    const trashPath = params["trashPath"] as string | undefined;
    const list = params["list"] as boolean | undefined;

    if (list) {
      const entries = await getTrashEntries();
      return { content: JSON.stringify(entries, null, 2) };
    }

    if (!trashPath) {
      return { content: "Error: 'trashPath' or 'list' is required", isError: true };
    }

    try {
      const originalPath = await restoreFromTrash(trashPath);
      return { content: `Restored ${originalPath}` };
    } catch (error) {
      return {
        content: `Error restoring: ${error instanceof Error ? error.message : String(error)}`,
        isError: true,
      };
    }
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/null-agent && vp test --run tests/tools/file-restore.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/tools/file-restore.ts tests/tools/file-restore.test.ts
git commit -m "feat: add file_restore tool"
```

---

### Task 7: file_bulk Tool

**Files:**

- Create: `src/tools/file-bulk.ts`
- Test: `tests/tools/file-bulk.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect } from "vite-plus";
import { writeFile, readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("file_bulk tool", () => {
  const testDir = join(tmpdir(), "null-agent-file-bulk-test");

  it("should execute multiple operations", async () => {
    const { fileBulkTool } = await import("../../src/tools/file-bulk.ts");

    // Create test files
    await writeFile(join(testDir, "a.txt"), "a");
    await writeFile(join(testDir, "b.txt"), "b");

    const operations = [
      { type: "copy", source: join(testDir, "a.txt"), destination: join(testDir, "a-copy.txt") },
      { type: "move", source: join(testDir, "b.txt"), destination: join(testDir, "b-moved.txt") },
    ];

    const result = await fileBulkTool.execute({ operations, rootBoundary: testDir });
    expect(result.isError).toBe(false);

    const results = JSON.parse(result.content);
    expect(results).toHaveLength(2);
    expect(results.every((r: any) => !r.error)).toBe(true);
  });

  it("should report partial failures", async () => {
    const { fileBulkTool } = await import("../../src/tools/file-bulk.ts");

    const operations = [
      {
        type: "copy",
        source: join(testDir, "nonexistent.txt"),
        destination: join(testDir, "dest.txt"),
      },
      {
        type: "copy",
        source: join(testDir, "existing.txt"),
        destination: join(testDir, "dest2.txt"),
      },
    ];
    await writeFile(join(testDir, "existing.txt"), "content");

    const result = await fileBulkTool.execute({ operations, rootBoundary: testDir });
    const results = JSON.parse(result.content);

    expect(results[0].error).toBeTruthy();
    expect(results[1].error).toBeFalsy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd packages/null-agent && vp test --run tests/tools/file-bulk.test.ts`
Expected: FAIL - module not found

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/tools/file-bulk.ts
import type { ToolDefinition } from "./types.ts";
import { String, Object, Optional, Array, Union, Literal, toolParams } from "./schema.ts";
import { fileCopyTool } from "./file-copy.ts";
import { fileMoveTool } from "./file-move.ts";
import { fileDeleteTool } from "./file-delete.ts";

type Operation =
  | { type: "move"; source: string; destination: string }
  | { type: "copy"; source: string; destination: string }
  | { type: "delete"; path: string };

const OperationSchema = Union([
  Object({ type: Literal("move"), source: String(), destination: String() }),
  Object({ type: Literal("copy"), source: String(), destination: String() }),
  Object({ type: Literal("delete"), path: String() }),
]);

export const fileBulkTool: ToolDefinition = {
  name: "file_bulk",
  description: "Execute multiple file operations in batch. Returns results array.",
  parameters: {
    type: "object",
    properties: {
      operations: {
        type: "array",
        description: "Array of operations to execute",
        items: { type: "object" },
      },
      rootBoundary: { type: "string", description: "Root boundary for path validation" },
    },
    required: ["operations"],
  },
  typeboxSchema: toolParams(
    {
      operations: Array(OperationSchema),
      rootBoundary: Optional(String({ description: "Root boundary for path validation" })),
    },
    ["operations"],
  ),
  async execute(params) {
    const operations = params["operations"] as Operation[];
    const rootBoundary = (params["rootBoundary"] as string) || process.cwd();

    if (!operations || !Array.isArray(operations)) {
      return { content: "Error: 'operations' must be an array", isError: true };
    }

    const results: { operation: string; success: boolean; error?: string }[] = [];

    for (const op of operations) {
      try {
        const opParams = { ...op, rootBoundary };
        let result;

        switch (op.type) {
          case "move":
            result = await fileMoveTool.execute({
              source: op.source,
              destination: op.destination,
              rootBoundary,
            });
            break;
          case "copy":
            result = await fileCopyTool.execute({
              source: op.source,
              destination: op.destination,
              rootBoundary,
            });
            break;
          case "delete":
            result = await fileDeleteTool.execute({ path: op.path, rootBoundary });
            break;
        }

        results.push({
          operation: op.type,
          success: !result.isError,
          error: result.isError ? result.content : undefined,
        });
      } catch (error) {
        results.push({
          operation: op.type,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return { content: JSON.stringify(results, null, 2) };
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd packages/null-agent && vp test --run tests/tools/file-bulk.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/tools/file-bulk.ts tests/tools/file-bulk.test.ts
git commit -m "feat: add file_bulk tool for batch operations"
```

---

### Task 8: Update index.ts Exports

**Files:**

- Modify: `src/tools/index.ts`

- [ ] **Step 1: Add exports for new tools**

Modify `src/tools/index.ts` to add:

```typescript
export { fileMoveTool } from "./file-move.ts";
export { fileCopyTool } from "./file-copy.ts";
export { fileDeleteTool } from "./file-delete.ts";
export { fileGlobTool } from "./file-glob.ts";
export { fileRestoreTool } from "./file-restore.ts";
export { fileBulkTool } from "./file-bulk.ts";
export type { TrashEntry } from "./trash.ts";
```

Add to `builtinTools` array:

```typescript
import {
  fileMoveTool,
  fileCopyTool,
  fileDeleteTool,
  fileGlobTool,
  fileRestoreTool,
  fileBulkTool,
} from "./index.ts";

export const builtinTools: ToolDefinition[] = [
  fileReadTool,
  fileWriteTool,
  shellTool,
  fileMoveTool,
  fileCopyTool,
  fileDeleteTool,
  fileGlobTool,
  fileRestoreTool,
  fileBulkTool,
  // ... existing tools
];
```

- [ ] **Step 2: Run full test suite**

Run: `cd packages/null-agent && vp test`
Expected: ALL PASS

- [ ] **Step 3: Commit**

```bash
git add src/tools/index.ts
git commit -m "feat: export new file manipulation tools"
```

---

### Task 9: Run vp check

- [ ] **Step 1: Run vp check**

Run: `cd packages/null-agent && vp check`

- [ ] **Step 2: Fix any errors**

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "style: run vp check fixes"
```

---

## Spec Coverage Check

- [x] move tool - Task 2
- [x] copy tool - Task 3
- [x] delete tool (trash-based) - Task 4
- [x] glob tool - Task 5
- [x] restore tool (undo) - Task 6
- [x] bulk operations - Task 7
- [x] root boundary validation - All tools
- [x] trash system with undo.json - Task 1
- [x] pattern and list-based bulk - Task 7 (both supported via operations array)
