# null-agent: Interactive Coding Assistant Library

## Overview

null-agent is a TypeScript library for building interactive coding assistants. It provides layered abstractions for LLM providers, tool execution, agent reasoning loops, and CLI/API interfaces. Built as a Vite+ library using `vp pack`.

## Architecture

Four layers, each building on the previous:

```
Interface (CLI/API) → Agent (reasoning loop) → Tools (executors) → Providers (LLM)
```

## Layer 1: Providers

Abstraction over LLM APIs with a common streaming interface.

**Files:**

- `src/providers/types.ts` — Message, ToolCall, StreamChunk types
- `src/providers/base.ts` — BaseProvider abstract class
- `src/providers/openai.ts` — OpenAI provider
- `src/providers/anthropic.ts` — Anthropic provider
- `src/providers/index.ts` — createProvider() factory

**Core interface:**

```ts
interface Provider {
  chat(messages: Message[], options?: ChatOptions): AsyncIterable<StreamChunk>;
  chatComplete(messages: Message[], options?: ChatOptions): Promise<string>;
}
```

Streams by default, with a convenience `chatComplete` wrapper. Factory reads API keys from env.

## Layer 2: Tools

Functions the agent can call. Each tool has a name, description, JSON schema for input, and an execute function.

**Files:**

- `src/tools/types.ts` — ToolDefinition interface
- `src/tools/registry.ts` — ToolRegistry (register, list, execute)
- `src/tools/file-read.ts` — Read file contents
- `src/tools/file-write.ts` — Write/create files
- `src/tools/shell.ts` — Run shell commands
- `src/tools/index.ts` — Built-in tools export

**Core interface:**

```ts
interface ToolDefinition {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (params: Record<string, unknown>) => Promise<ToolResult>;
}
```

## Layer 3: Agent

The reasoning loop: receive input → send to LLM with tools → execute tool calls → loop until done.

**Files:**

- `src/agent/types.ts` — AgentConfig, AgentState
- `src/agent/loop.ts` — runAgent() core loop
- `src/agent/context.ts` — System prompt, project context
- `src/agent/index.ts` — Agent class

**The loop:**

1. User sends a message
2. Agent builds context (system prompt + history + available tools)
3. Sends to LLM provider
4. If tool calls → execute them → feed results back → goto 3
5. If text → return to user
6. Max iterations guard to prevent infinite loops

## Layer 4: Interface

CLI REPL + programmatic API exports.

**Files:**

- `src/cli/index.ts` — Entry point, arg parsing
- `src/cli/repl.ts` — Interactive REPL loop
- `src/cli/output.ts` — Formatted terminal output
- `src/index.ts` — Public API exports

**CLI usage:**

- `null-agent` — starts REPL
- `null-agent "explain this file"` — one-shot mode

**Programmatic usage:**

```ts
import { Agent, createProvider } from "null-agent";
const agent = new Agent({ provider: createProvider("anthropic") });
const response = await agent.chat("Review this code for bugs");
```

## Dependencies

- `openai` — OpenAI SDK
- `@anthropic-ai/sdk` — Anthropic SDK
- `node:readline` — REPL (built-in)
- `node:child_process` — Shell execution (built-in)

## Build

- Format: `esm`
- DTS: enabled with `tsgo`
- Source maps: enabled
- CLI bin entry in package.json
