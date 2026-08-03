# null-agent Terminal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based terminal demo for null-agent using xterm.js, connecting to a running null-agent HTTP server.

**Architecture:** Single-page Vite app. No framework. xterm.js fills the viewport. SSE streaming from `POST /chat/stream`. Fetch for `GET /health`, `GET /history`. Commands parsed from terminal input.

**Tech Stack:** Vite, TypeScript, xterm.js, xterm-addon-fit

---

### Task 1: Clean up template boilerplate

**Files:**

- Modify: `apps/null-agent/index.html`
- Delete: `apps/null-agent/src/counter.ts`
- Delete: `apps/null-agent/src/assets/hero.png`
- Delete: `apps/null-agent/src/assets/typescript.svg`
- Delete: `apps/null-agent/src/assets/vite.svg`

- [ ] **Step 1: Remove template files**

Run: `rm apps/null-agent/src/counter.ts apps/null-agent/src/assets/hero.png apps/null-agent/src/assets/typescript.svg apps/null-agent/src/assets/vite.svg`

- [ ] **Step 2: Rewrite index.html to minimal shell**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>null-agent · terminal</title>
  </head>
  <body>
    <div id="terminal"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Commit**

```bash
git add apps/null-agent/index.html apps/null-agent/src/counter.ts apps/null-agent/src/assets/hero.png apps/null-agent/src/assets/typescript.svg apps/null-agent/src/assets/vite.svg
git commit -m "feat: clean up template boilerplate for terminal website"
```

---

### Task 2: Add xterm.js dependencies

**Files:**

- Modify: `apps/null-agent/package.json`

- [ ] **Step 1: Install xterm packages**

```bash
cd apps/null-agent && vp add @xterm/xterm @xterm/addon-fit
```

- [ ] **Step 2: Commit**

```bash
git add apps/null-agent/package.json apps/null-agent/pnpm-lock.yaml
git commit -m "feat: add xterm.js dependencies"
```

---

### Task 3: Write CSS — full-viewport terminal theme

**Files:**

- Modify: `apps/null-agent/src/style.css`

- [ ] **Step 1: Write the CSS**

```css
html,
body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: #0a0a0a;
}

#terminal {
  width: 100%;
  height: 100%;
}

.xterm {
  padding: 4px;
  height: 100%;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/null-agent/src/style.css
git commit -m "feat: add full-viewport terminal CSS"
```

---

### Task 4: Write main.ts — terminal app with SSE streaming

**Files:**

- Create: `apps/null-agent/src/main.ts`

This is the core file. All logic in one place since the app is small.

- [ ] **Step 1: Write main.ts**

```ts
import "@xterm/xterm/css/xterm.css";
import "./style.css";
import { Terminal } from "@xterm/xterm";
import { FitAddon } from "@xterm/addon-fit";

const DEFAULT_SERVER = "http://localhost:3737";
const VERSION = "0.5.1";

let serverUrl = DEFAULT_SERVER;
let abortController: AbortController | null = null;

const term = new Terminal({
  cursorBlink: true,
  cursorStyle: "block",
  fontSize: 14,
  fontFamily: 'Menlo, "Cascadia Code", "Fira Code", monospace',
  theme: {
    background: "#0a0a0a",
    foreground: "#e0e0e0",
    cursor: "#e0e0e0",
    green: "#6bcb7b",
    red: "#ff6b68",
    yellow: "#ffd866",
    blue: "#78b2f2",
    magenta: "#c792ea",
    cyan: "#5cd4ff",
    brightBlack: "#6c6c6c",
    selectionBackground: "#3a3a5c",
  },
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);
term.open(document.getElementById("terminal")!);
fitAddon.fit();

window.addEventListener("resize", () => fitAddon.fit());

function writeln(text: string) {
  term.writeln(text);
}

function write(text: string) {
  term.write(text);
}

function fmtBanner(): string {
  return [
    `\x1b[32mnull-agent\x1b[0m v${VERSION} · web terminal`,
    `Connected to \x1b[36m${serverUrl}\x1b[0m`,
    `Type \x1b[33m/help\x1b[0m for commands`,
    "",
  ].join("\r\n");
}

async function checkHealth(): Promise<string> {
  try {
    const res = await fetch(`${serverUrl}/health`);
    const data = await res.json();
    return `Health: \x1b[32mOK\x1b[0m · v${data.version} · ${res.status}`;
  } catch {
    return `Health: \x1b[31mUNREACHABLE\x1b[0m (${serverUrl})`;
  }
}

function parseSSELine(line: string): unknown {
  if (!line.startsWith("data: ")) return null;
  try {
    return JSON.parse(line.slice(6));
  } catch {
    return null;
  }
}

async function streamChat(message: string) {
  abortController = new AbortController();

  try {
    const res = await fetch(`${serverUrl}/chat/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
      signal: abortController.signal,
    });

    if (!res.ok) {
      writeln(`\x1b[31mError: ${res.status} ${res.statusText}\x1b[0m`);
      return;
    }

    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const line of lines) {
        const data = parseSSELine(line);
        if (!data) continue;
        const msg = data as Record<string, unknown>;

        switch (msg.type) {
          case "text":
            write(msg.content as string);
            break;
          case "tool_call":
            writeln("");
            writeln(`\x1b[34m═══ \x1b[33m${msg.name}\x1b[34m ═══\x1b[0m`);
            write(`\x1b[2m${JSON.stringify(msg.arguments)}\x1b[0m`);
            break;
          case "tool_result":
            writeln("");
            const isErr = msg.isError as boolean;
            const prefix = isErr ? "\x1b[31m✗" : "\x1b[32m✓";
            writeln(`${prefix} ${msg.name}\x1b[0m`);
            break;
          case "done":
            writeln("");
            break;
          case "error":
            writeln(`\x1b[31mError: ${msg.message}\x1b[0m`);
            break;
        }
      }
    }
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      writeln("\x1b[33mCancelled\x1b[0m");
    } else {
      writeln(`\x1b[31mConnection error: ${(err as Error).message}\x1b[0m`);
    }
  } finally {
    abortController = null;
  }
}

let inputBuffer = "";
let inputHistory: string[] = [];
let historyIndex = -1;

function prompt() {
  write("\r\n\x1b[32m>\x1b[0m ");
}

async function handleCommand(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return;

  if (historyIndex === -1 || inputHistory[inputHistory.length - 1] !== trimmed) {
    inputHistory.push(trimmed);
  }
  historyIndex = -1;

  if (trimmed.startsWith("/")) {
    const parts = trimmed.slice(1).split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    switch (cmd) {
      case "help":
        writeln("");
        writeln("  \x1b[33m/connect <url>\x1b[0m   Connect to a null-agent server");
        writeln("  \x1b[33m/clear\x1b[0m           Clear terminal");
        writeln("  \x1b[33m/health\x1b[0m          Show server health");
        writeln("  \x1b[33m/history\x1b[0m         Show conversation history");
        writeln("  \x1b[33m/help\x1b[0m            Show this help");
        break;

      case "connect":
        if (!args[0]) {
          writeln("\x1b[33mUsage: /connect <url>\x1b[0m");
        } else {
          serverUrl = args[0].replace(/\/+$/, "");
          writeln(`Connected to \x1b[36m${serverUrl}\x1b[0m`);
          writeln(await checkHealth());
        }
        break;

      case "clear":
        term.clear();
        break;

      case "health":
        writeln("");
        writeln(await checkHealth());
        break;

      case "history":
        writeln("");
        try {
          const res = await fetch(`${serverUrl}/history`);
          if (!res.ok) {
            writeln(`\x1b[31mError: ${res.status}\x1b[0m`);
          } else {
            const data = await res.json();
            const messages = data.messages ?? [];
            if (messages.length === 0) {
              writeln("No messages in history.");
            } else {
              for (const msg of messages) {
                const role =
                  msg.role === "user" ? "\x1b[32muser\x1b[0m" : "\x1b[36massistant\x1b[0m";
                const preview = msg.content.slice(0, 120).replace(/\n/g, " ");
                writeln(`  ${role}: ${preview}`);
              }
            }
          }
        } catch (err) {
          writeln(`\x1b[31mError: ${(err as Error).message}\x1b[0m`);
        }
        break;

      default:
        writeln(`\x1b[31mUnknown command: /${cmd}\x1b[0m`);
    }

    prompt();
    return;
  }

  // Cancel any in-progress stream
  if (abortController) {
    abortController.abort();
  }

  // Send as user message
  writeln("");
  writeln(`\x1b[2m${trimmed}\x1b[0m`);

  await streamChat(trimmed);

  prompt();
}

// Input handling
term.onKey(({ key, domEvent }) => {
  const ev = domEvent;

  if (ev.key === "Enter") {
    const cmd = inputBuffer;
    inputBuffer = "";
    handleCommand(cmd);
    return;
  }

  if (ev.key === "Backspace") {
    if (inputBuffer.length > 0) {
      inputBuffer = inputBuffer.slice(0, -1);
      term.write("\b \b");
    }
    return;
  }

  if (ev.key === "ArrowUp") {
    if (inputHistory.length === 0) return;
    if (historyIndex === -1) {
      historyIndex = inputHistory.length - 1;
    } else if (historyIndex > 0) {
      historyIndex--;
    } else {
      return;
    }
    // Clear current line
    while (inputBuffer.length > 0) {
      term.write("\b \b");
      inputBuffer = inputBuffer.slice(0, -1);
    }
    inputBuffer = inputHistory[historyIndex];
    write(inputBuffer);
    return;
  }

  if (ev.key === "ArrowDown") {
    if (historyIndex === -1) return;
    if (historyIndex < inputHistory.length - 1) {
      historyIndex++;
    } else {
      historyIndex = -1;
      while (inputBuffer.length > 0) {
        term.write("\b \b");
        inputBuffer = inputBuffer.slice(0, -1);
      }
      return;
    }
    while (inputBuffer.length > 0) {
      term.write("\b \b");
      inputBuffer = inputBuffer.slice(0, -1);
    }
    inputBuffer = inputHistory[historyIndex];
    write(inputBuffer);
    return;
  }

  // Ctrl+C to cancel
  if (ev.ctrlKey && (ev.key === "c" || ev.key === "C")) {
    if (abortController) {
      abortController.abort();
    }
    inputBuffer = "";
    prompt();
    return;
  }

  // Ignore other control keys
  if (ev.ctrlKey || ev.altKey || ev.metaKey) return;

  if (key.length === 1) {
    inputBuffer += key;
    write(key);
  }
});

// Print startup banner
writeln(fmtBanner());

// Check health on load
checkHealth().then((health) => {
  writeln(health);
  prompt();
});
```

- [ ] **Step 2: Commit**

```bash
git add apps/null-agent/src/main.ts
git commit -m "feat: implement terminal website with xterm.js and SSE streaming"
```

---

### Task 5: Verify dev server works

- [ ] **Step 1: Test that the app builds and starts**

```bash
cd apps/null-agent && vp dev
```

Expected: Vite dev server starts on localhost, page loads with xterm terminal filling viewport.

- [ ] **Step 2: Kill dev server**

Press Ctrl+C in terminal.

---

## Self-Review Checklist

1. **Spec coverage:** Spec requires: (a) xterm.js full-viewport terminal ✓ (Task 3-4), (b) SSE streaming from null-agent /chat/stream ✓ (Task 4), (c) commands /connect, /clear, /health, /history, /help ✓ (Task 4), (d) startup banner ✓ (Task 4), (e) tool call display ✓ (Task 4 SSE parsing). All covered.

2. **Placeholder scan:** No TBD, TODO, or vague steps. Every step has exact file paths, complete code, or exact commands.

3. **Type consistency:** No types used across tasks. Single file (main.ts). All references consistent.

4. **Scope:** Single independent subsystem. No decomposition needed.
