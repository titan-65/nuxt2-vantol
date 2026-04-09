# Null-Agent "Feet" Design

## Overview

The "feet" feature set provides task orchestration, script execution, process management, and terminal sessions for null-agent. The name reflects movement and running - the ability to execute tasks, run scripts, and manage processes.

## Goals

- **Autonomous execution**: Agent can run scripts, start processes, manage them without user intervention
- **User collaboration**: User can control script/process execution interactively
- **Running alongside**: Processes are siblings to the agent, not embedded in it
- **Ephemeral**: No persistence - processes die when the agent dies (simpler, safer)
- **Auto-detect**: Scripts are discovered from project files, not hardcoded

## Architecture

### Directory Structure

```
src/
├── feet/
│   ├── script-detector.ts    # Detect scripts from project files
│   ├── process-manager.ts    # Background process lifecycle
│   ├── session-manager.ts    # Terminal session management
│   └── index.ts
└── tools/
    ├── script-detect.ts      # script_detect tool
    ├── script-run.ts         # script_run tool
    ├── process-start.ts     # process_start tool
    ├── process-stop.ts       # process_stop tool
    ├── process-list.ts      # process_list tool
    ├── process-logs.ts      # process_logs tool
    ├── session-create.ts     # session_create tool
    ├── session-attach.ts    # session_attach tool
    ├── task-sprint.ts       # task_sprint tool
    └── index.ts             # Update exports
```

## Components

### 1. Script Detector

**Purpose:** Auto-detect available scripts from project files.

**Supported sources:**
- `package.json` → `scripts` field
- `Makefile` → targets (first word of each line without colons)
- `*.cmake` → cmake targets (if found)

**Implementation:**
```typescript
interface DetectedScript {
  name: string;
  source: "package.json" | "Makefile" | "cmake";
  command: string;
  description?: string;
}

export async function detectScripts(projectDir: string): Promise<DetectedScript[]>
```

### 2. Script Runner (`script_run`)

**Purpose:** Execute a detected script with configurable output.

**Parameters:**
```typescript
{
  script: string;           // Script name or full command
  mode?: "stream" | "summary" | "both";
  cwd?: string;             // Working directory
}
```

**Modes:**
- `stream`: Real-time output streaming via tool result chunks
- `summary`: Return output after completion
- `both`: Stream while running, include summary at end

**Behavior:**
1. If script name provided, look up via script detector
2. If full command provided, execute directly
3. Stream output based on mode
4. Return exit code and summary

### 3. Process Manager

**Purpose:** Manage background processes lifecycle.

**State stored in-memory** - `ProcessManager` class with Map of active processes.

**Process interface:**
```typescript
interface ManagedProcess {
  id: string;              // UUID
  name: string;
  command: string;
  cwd: string;
  pid: number;             // OS process ID
  startedAt: number;
  status: "running" | "stopped" | "exited";
  exitCode?: number;
}
```

**Tools:**

#### `process_start`
```typescript
{
  command: string;         // Command to run
  name?: string;           // Optional friendly name
  cwd?: string;
}
// Returns: { id, pid, name }
```

#### `process_stop`
```typescript
{
  id: string;              // Process ID from process_start
  force?: boolean;         // SIGKILL vs SIGTERM
}
// Returns: { success, signal }
```

#### `process_list`
```typescript
// No parameters
// Returns: Array of ManagedProcess
```

#### `process_logs`
```typescript
{
  id: string;
  stream?: boolean;        // If true, returns generator for streaming
}
// Returns: Recent logs or stream handle
```

### 4. Session Terminal

**Purpose:** Create persistent terminal sessions that survive across tool calls.

**Session interface:**
```typescript
interface TerminalSession {
  id: string;
  name: string;
  createdAt: number;
  cwd: string;
  isActive: boolean;
}
```

**Note:** Full PTY/terminal emulation is complex. Initial implementation uses `node:child_process` with pseudo-terminal support where available.

**Tools:**

#### `session_create`
```typescript
{
  name?: string;           // Optional friendly name
  cwd?: string;
}
// Returns: { id, name }
```

#### `session_attach`
```typescript
{
  id: string;
  command?: string;        // Optional command to run in session
}
// Returns: { output, exitCode }
```

### 5. Task Sprint (`task_sprint`)

**Purpose:** Run a bounded agent task with timeout.

**Concept:** Wrap the agent loop with a timeout. Agent works toward goal, but must checkpoint progress. If time expires, return partial result.

```typescript
{
  task: string;            // Task description
  timeout: number;          // Timeout in seconds
  goal?: string;            // Optional explicit goal
}
// Returns: { completed: boolean, progress: string, iterations: number, result?: string }
```

**Behavior:**
1. Start agent loop with max iterations based on timeout estimate
2. Every N iterations, checkpoint progress to shared state
3. If timeout reached, stop agent and return current state
4. Agent can call `sprint_checkpoint()` to save progress

## Error Handling

- **Script not found**: Return error with suggestions from detected scripts
- **Process not running**: Return error when trying to stop/log non-running process
- **Process died**: Emit event, update status, return exit info
- **Session not found**: Return clear error with available sessions
- **Timeout on sprint**: Return partial progress, not partial output

## Testing Strategy

- Unit tests for script detector
- Integration tests for process lifecycle (start/stop/list)
- Session tests with mock PTY
- Sprint tests with mock agent loop

## Dependencies

- `node:child_process` - for spawning processes
- `node:fs/promises` - for reading project files
- `node:os` - for detecting platform-specific behaviors
- `node:readline` or `node:pty` (optional) - for terminal sessions

## Future Enhancements

- PTY support for full terminal emulation
- Process persistence across agent restarts
- Watch mode (restart on file changes)
- Process groups/kill all children
