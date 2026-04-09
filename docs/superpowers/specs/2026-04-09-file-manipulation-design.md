# File Manipulation Tools Design

## Overview

Add file manipulation capabilities to null-agent: move, copy, delete, glob, restore, and bulk operations.

## Goals

- Provide safe, undoable file operations
- Support pattern-based and list-based bulk operations
- Configurable root boundary (default: project root)
- Trash-based deletion with restore capability

## Architecture

### Trash System

- Trash location: `~/.null-agent/trash/{timestamp}/{filename}`
- Operation log: `~/.null-agent/undo.json` (array of reversible operations)
- Each trash entry stores: original path, trash path, timestamp, operation type

### Root Boundary

- Default: `process.cwd()` (project root)
- Configurable via `rootBoundary` option in tool config
- All operations validated against root boundary

## Tools

### `file_move`

**Parameters:**
- `source`: string (required) - source file path
- `destination`: string (required) - destination file path
- `rootBoundary?: string` - override default root

**Behavior:**
1. Validate paths against root boundary
2. Record undo info to `undo.json`
3. Create parent directories if needed
4. Move file
5. Return success with undo handle

### `file_copy`

**Parameters:**
- `source`: string (required)
- `destination`: string (required)
- `rootBoundary?: string`

**Behavior:** Same as move, but without undo tracking (delete is the risk, not copy).

### `file_delete`

**Parameters:**
- `path`: string (required)
- `rootBoundary?: string`

**Behavior:**
1. Validate path against root boundary
2. Move file to trash instead of deleting
3. Record undo info to `undo.json`
4. Return trash path for restore

### `file_glob`

**Parameters:**
- `pattern`: string (required) - glob pattern (e.g., `**/*.ts`)
- `rootBoundary?: string`
- `options?: { ignore?: string[], limit?: number }`

**Behavior:**
1. Use `tinyglobby` for glob matching
2. Filter matches against root boundary
3. Respect `ignore` patterns (default: `['node_modules/**', '.git/**']`)
4. Return array of matching paths

### `file_restore`

**Parameters:**
- `trashPath?: string` - specific trash entry to restore
- `list?: boolean` - list all trash entries instead

**Behavior:**
- If `list: true`, return all trash entries with metadata
- If `trashPath` provided, restore that specific file to original location
- Remove from trash after restore
- Error if original location no longer available

### `file_bulk`

**Parameters:**
- `operations`: Array of operation objects
- `rootBoundary?: string`

**Operation object:**
```ts
{
  type: 'move' | 'copy' | 'delete',
  source?: string,
  destination?: string,
  path?: string
}
```

**Behavior:**
1. Validate all operations against root boundary
2. Execute all operations
3. Record undo info for reversible operations
4. Return results array with success/failure per operation

## Error Handling

- Path traversal attempts → reject with security error
- Missing source files → return tool error (not throw)
- Partial bulk operation failure → continue remaining operations, report failures
- Trash restore conflict (file exists at original) → error with options

## File Structure

```
src/tools/
├── file-move.ts
├── file-copy.ts
├── file-delete.ts
├── file-glob.ts
├── file-restore.ts
├── file-bulk.ts
├── trash.ts          # shared trash management
└── index.ts          # update to export new tools
```

## Testing

- Unit tests for each tool
- Integration test for undo/restore cycle
- Test root boundary enforcement
- Test glob pattern matching
- Test bulk operation atomicity

## Dependencies

- `tinyglobby` - glob matching (already in codebase? check)
- Standard Node.js `fs` for file operations
- `path` for path manipulation
