# h3 Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-rolled Node.js HTTP server with h3 framework for proper routing, middleware, CORS, body parsing, and SSE support.

**Architecture:** Rewrite `src/server/index.ts` to use h3 app with `createApp`, rewrite `src/server/routes.ts` to use h3 event handlers and utilities. Keep all existing API endpoints working identically.

**Tech Stack:** TypeScript, h3, node:http

---

### Task 1: Install h3 and rewrite server

**Files:**
- Modify: `packages/null-agent/src/server/index.ts`
- Modify: `packages/null-agent/src/server/routes.ts`
- Modify: `packages/null-agent/package.json`

- [ ] **Step 1: Install h3**

```bash
cd packages/null-agent && vp add h3
```

- [ ] **Step 2: Rewrite `src/server/index.ts`**

```typescript
import { createServer } from "node:http";
import { createApp, toNodeListener, useCors } from "h3";
import { Agent } from "../agent/index.ts";
import { createProvider } from "../providers/index.ts";
import type { ProviderName } from "../providers/index.ts";
import { createDefaultRegistry } from "../tools/index.ts";
import { MemoryStore } from "../memory/store.ts";
import { scanProject } from "../context/scanner.ts";
import { loadConfig } from "../agent/personality.ts";
import { registerRoutes } from "./routes.ts";

export interface ServerConfig {
  port: number;
  host: string;
  provider?: ProviderName;
  model?: string;
}

export async function startServer(config: ServerConfig): Promise<void> {
  const appConfig = await loadConfig();
  const providerName = config.provider ?? appConfig.defaultProvider ?? getProviderFromEnv();
  const provider = createProvider(providerName);
  const model = config.model ?? appConfig.defaultModel ?? getDefaultModel(providerName);
  const tools = createDefaultRegistry();
  const memory = new MemoryStore();

  let projectKnowledge;
  try {
    projectKnowledge = await scanProject(process.cwd());
  } catch {
    // skip
  }

  const agent = new Agent({
    provider,
    tools,
    model,
    memory,
    projectKnowledge,
    personality: appConfig.personality,
  });

  await agent.loadConversation(process.cwd());
  await agent.startConversation(
    process.cwd(),
    projectKnowledge?.projectName ?? "unknown",
    providerName,
    model,
  );

  const app = createApp();

  // Global CORS
  app.use(useCors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }));

  // Register routes
  registerRoutes(app, { agent, memory, config: appConfig });

  // Create and start server
  const server = createServer(toNodeListener(app));

  server.listen(config.port, config.host, () => {
    console.log(`\n  null-agent API server running at http://${config.host}:${config.port}\n`);
    console.log("  Endpoints:");
    console.log("    POST /chat          — send a message");
    console.log("    POST /chat/stream   — send a message (SSE streaming)");
    console.log("    GET  /history       — get conversation history");
    console.log("    DELETE /history     — clear conversation history");
    console.log("    GET  /conversations — list past conversations");
    console.log("    POST /conversations/resume — resume a conversation");
    console.log("    GET  /tasks         — get tracked tasks");
    console.log("    POST /tasks         — add a task");
    console.log("    POST /tasks/:id/done — complete a task");
    console.log("    GET  /config        — get configuration");
    console.log("    PATCH /config       — update configuration");
    console.log("    GET  /health        — health check");
    console.log("");
  });
}

function getProviderFromEnv(): ProviderName {
  if (process.env["ANTHROPIC_API_KEY"]) return "anthropic";
  if (process.env["OPENAI_API_KEY"]) return "openai";
  return "anthropic";
}

function getDefaultModel(provider: ProviderName): string {
  switch (provider) {
    case "openai": return "gpt-4o";
    case "anthropic": return "claude-sonnet-4-20250514";
    case "gemini": return "gemini-2.0-flash";
    case "openrouter": return "google/gemini-2.0-flash-001";
    default: return "gpt-4o";
  }
}
```

- [ ] **Step 3: Rewrite `src/server/routes.ts`**

```typescript
import {
  createRouter,
  readBody,
  setResponseStatus,
  sendStream,
  getRouterParam,
  type H3Event,
} from "h3";
import type { Agent } from "../agent/index.ts";
import type { MemoryStore } from "../memory/store.ts";
import type { NullAgentConfig } from "../agent/personality.ts";
import { formatTaskList } from "../agent/tasks.ts";
import { saveConfig } from "../agent/personality.ts";
import type { H3App } from "h3";

export interface RouteContext {
  agent: Agent;
  memory: MemoryStore;
  config: NullAgentConfig;
}

export function registerRoutes(app: H3App, ctx: RouteContext): void {
  const router = createRouter();

  // Health
  router.get("/health", () => ({
    status: "ok",
    version: "0.0.0",
  }));

  // Chat
  router.post("/chat", async (event: H3Event) => {
    const body = await readBody(event);
    const message = body?.message;

    if (!message) {
      setResponseStatus(event, 400);
      return { error: "message is required" };
    }

    const result = await ctx.agent.chat(message);

    return {
      content: result.content,
      iterations: result.iterations,
      toolCalls: result.toolCalls,
    };
  });

  // Chat stream (SSE)
  router.post("/chat/stream", async (event: H3Event) => {
    const body = await readBody(event);
    const message = body?.message;

    if (!message) {
      setResponseStatus(event, 400);
      return { error: "message is required" };
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const send = (data: object) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        try {
          const result = await ctx.agent.chat(message, {
            onText: (text) => {
              send({ type: "text", content: text });
            },
            onToolCall: (name, args) => {
              send({ type: "tool_call", name, arguments: args });
            },
            onToolResult: (name, result, isError) => {
              send({ type: "tool_result", name, result, isError });
            },
          });

          send({
            type: "done",
            content: result.content,
            iterations: result.iterations,
          });
        } catch (error) {
          send({
            type: "error",
            message: error instanceof Error ? error.message : String(error),
          });
        }

        controller.close();
      },
    });

    event.node.res.setHeader("Content-Type", "text/event-stream");
    event.node.res.setHeader("Cache-Control", "no-cache");
    event.node.res.setHeader("Connection", "keep-alive");

    return sendStream(event, stream);
  });

  // History
  router.get("/history", () => {
    const history = ctx.agent.getHistory();
    return { messages: history };
  });

  router.delete("/history", () => {
    ctx.agent.clearHistory();
    return { status: "cleared" };
  });

  // Conversations
  router.get("/conversations", async () => {
    const conversations = await ctx.memory.listConversations(20);
    return { conversations };
  });

  router.post("/conversations/resume", async (event: H3Event) => {
    const body = await readBody(event);
    const id = body?.id;

    if (!id) {
      setResponseStatus(event, 400);
      return { error: "id is required" };
    }

    const conversation = await ctx.agent.resumeConversation(id);
    if (!conversation) {
      setResponseStatus(event, 404);
      return { error: "conversation not found" };
    }

    return {
      id: conversation.id,
      title: conversation.title,
      messageCount: conversation.metadata.messageCount,
    };
  });

  // Tasks
  router.get("/tasks", () => {
    const tasks = ctx.agent.getTasks();
    return { tasks, formatted: formatTaskList(tasks) };
  });

  router.post("/tasks", async (event: H3Event) => {
    const body = await readBody(event);

    if (!body?.description) {
      setResponseStatus(event, 400);
      return { error: "description is required" };
    }

    const task = ctx.agent.addTask(body.description);
    setResponseStatus(event, 201);
    return { task };
  });

  router.post("/tasks/:id/done", (event: H3Event) => {
    const id = getRouterParam(event, "id");

    if (!id) {
      setResponseStatus(event, 400);
      return { error: "task id is required" };
    }

    const task = ctx.agent.completeTask(id);
    if (!task) {
      setResponseStatus(event, 404);
      return { error: "task not found" };
    }

    return { task };
  });

  // Config
  router.get("/config", () => ctx.config);

  router.patch("/config", async (event: H3Event) => {
    const body = await readBody(event);

    if (body?.personality) {
      const p = body.personality;
      if (p.tone && ["professional", "casual", "concise"].includes(p.tone)) {
        ctx.config.personality.tone = p.tone as "professional" | "casual" | "concise";
      }
      if (p.verbosity && ["minimal", "balanced", "detailed"].includes(p.verbosity)) {
        ctx.config.personality.verbosity = p.verbosity as "minimal" | "balanced" | "detailed";
      }
      if (p.proactivity && ["passive", "balanced", "active"].includes(p.proactivity)) {
        ctx.config.personality.proactivity = p.proactivity as "passive" | "balanced" | "active";
      }
      await saveConfig(ctx.config);
    }

    return ctx.config;
  });

  // Catch-all 404
  router.use(() => {
    return { error: "Not found" };
  });

  app.use(router);
}
```

- [ ] **Step 4: Run tests**

```bash
cd packages/null-agent && vp test
```

- [ ] **Step 5: Build**

```bash
cd packages/null-agent && vp pack
```

- [ ] **Step 6: Commit**

```bash
git -C packages/null-agent add -A && git -C packages/null-agent commit -m "feat: replace HTTP server with h3 framework"
```
