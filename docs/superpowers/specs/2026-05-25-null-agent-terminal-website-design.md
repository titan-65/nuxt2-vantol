# null-agent Terminal Website

## Overview

A web-based terminal interface for the null-agent package, built as a demo showcase. Uses xterm.js to render a full terminal emulator in the browser, connecting to a running null-agent HTTP API server via SSE streaming.

## Architecture

```
Browser (Vite + TypeScript + xterm.js)
  ├── xterm.js Terminal Instance
  │   - Captures keyboard input
  │   - Renders streaming text + formatted output
  └── Connection Manager
      - SSE client for POST /chat/stream
      - Fetch client for GET /health, GET /history, etc.

         ↕ HTTP / SSE

null-agent Server (localhost:3737)
  - POST /chat/stream (SSE)
  - GET /health, GET /history, GET /conversations, etc.
```

Single-page Vite app. No framework. xterm.js fills the viewport.

## UI

Full-viewport terminal window. No browser chrome, nav, or scrollable page — just the terminal.

Startup banner:

```
null-agent v0.5.1 · web terminal
Connected to http://localhost:3737
Type /help for commands

>
```

## Interaction

- **User types message** → POST `/chat/stream` with SSE
- **AI text** streams into terminal in real-time
- **Tool calls** shown as formatted blocks with name, args, result, duration
- **Errors** displayed in red/yellow

## Commands (typed at prompt)

| Command          | Action                        |
| ---------------- | ----------------------------- |
| `/connect <url>` | Connect to a different server |
| `/clear`         | Clear terminal                |
| `/health`        | Show server health            |
| `/history`       | Show conversation history     |
| `/help`          | List commands                 |

## Tech Stack

- **xterm.js** + **xterm-addon-fit** — terminal emulator
- **Vite** — bundler (already configured)
- **TypeScript** — all logic in `src/main.ts`
- No framework — vanilla TS

## Files

- `index.html` — minimal HTML shell (full-viewport body)
- `src/main.ts` — xterm init, input handling, SSE/fetch connection manager
- `src/style.css` — body reset, xterm overrides

## Dependencies

- `@xterm/xterm`
- `@xterm/addon-fit`
