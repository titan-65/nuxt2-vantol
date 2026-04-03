import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import TerminalAnimation from "../components/TerminalAnimation";
import FeatureCard from "../components/FeatureCard";
import CodeBlock from "../components/CodeBlock";
import InstallTabs from "../components/InstallTabs";

export const Route = createFileRoute("/null-agent")({
  component: NullAgentPage,
});

const architectureCode = `import { Agent, createProvider, createDefaultRegistry } from "null-agent";

const agent = new Agent({
  provider: createProvider("anthropic"),
  tools: createDefaultRegistry(),
  systemPrompt: "You are a helpful coding assistant.",
  maxIterations: 10,
});

const result = await agent.chat("Help me refactor this function");
console.log(result.content);
console.log(\`Completed in \${result.iterations} iterations\`);`;

const toolsCode = `import { ToolRegistry, builtinTools, fileReadTool, shellTool } from "null-agent";

// Use only specific built-in tools
const registry = new ToolRegistry();
registry.register(fileReadTool);
registry.register(shellTool);

// Add your own tool
registry.register({
  name: "deploy",
  description: "Deploy the application",
  parameters: {
    type: "object",
    properties: {
      environment: { type: "string", enum: ["staging", "production"] },
    },
    required: ["environment"],
  },
  execute: async ({ environment }) => {
    // deploy logic here
    return \`Deployed to \${environment}\`;
  },
});`;

const serverCode = `import { Agent, createProvider, createDefaultRegistry } from "null-agent";
import { createServer } from "node:http";

// Start HTTP API server
const agent = new Agent({
  provider: createProvider("anthropic"),
  tools: createDefaultRegistry(),
});

// Or use the built-in server
// null-agent --server --port 3737

// POST /chat        — Send a message
// POST /chat/stream — Stream response (SSE)
// GET  /history     — Get conversation history
// GET  /health      — Health check`;

const interfaces = [
  {
    title: "Terminal UI",
    icon: "🖥️",
    description:
      "Full interactive terminal interface built with Ink (React for terminal). Features status bar showing provider/model/project info, chat panel with message bubbles, animated NullFace mascot, slash commands (/help, /clear, /context, /tasks, /config), and formatted tool call display.",
    code: "null-agent",
  },
  {
    title: "Readline REPL",
    icon: "⌨️",
    description:
      "Lightweight readline-based REPL with colored output. No dependencies beyond Node.js. Perfect for quick interactions or environments where Ink isn't available.",
    code: "null-agent --plain",
  },
  {
    title: "HTTP API Server",
    icon: "🌐",
    description:
      "REST API server (default port 3737) with streaming SSE support. Integrate null-agent into any frontend or service. Endpoints for chat, history, tasks, config, and health.",
    code: "null-agent --server --port 3737",
  },
  {
    title: "One-Shot CLI",
    icon: "⚡",
    description:
      "Send a single message and get a response. Perfect for scripting, CI/CD pipelines, or quick one-off tasks without entering interactive mode.",
    code: 'null-agent "explain the auth module"',
  },
];

function NullAgentPage() {
  const [activeCode, setActiveCode] = useState(0);

  const codeTabs = [
    { label: "Agent", code: architectureCode, filename: "agent.ts" },
    { label: "Tools", code: toolsCode, filename: "tools.ts" },
    { label: "Server", code: serverCode, filename: "server.ts" },
  ];

  return (
    <main className="page-wrap px-4 py-12">
      {/* Hero */}
      <section className="island-shell relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <p className="island-kicker mb-3">Documentation</p>
        <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-5xl">
          null-agent
        </h1>
        <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
          Interactive coding assistant library with multi-provider LLM support, a built-in tool
          system, conversation persistence, project awareness, and multi-agent orchestration.
        </p>
        <InstallTabs packageName="null-agent" />
      </section>

      {/* Features */}
      <section className="mt-12">
        <p className="island-kicker mb-4">Core Capabilities</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: "🤖",
              title: "Multi-Provider LLM",
              description:
                "OpenAI and Anthropic providers with streaming. Extensible provider interface for custom backends.",
            },
            {
              icon: "🔧",
              title: "10 Built-in Tools",
              description:
                "File read/write, shell execution, and 7 git operations. Register custom tools with JSON Schema parameters.",
            },
            {
              icon: "🔀",
              title: "Orchestrator",
              description:
                "Spawn parallel sub-agents for complex tasks. Concurrency limits, task tracking, and result aggregation.",
            },
            {
              icon: "💾",
              title: "Memory & Persistence",
              description:
                "File-based conversation storage at ~/.null-agent/memory/. Resume conversations across sessions.",
            },
            {
              icon: "🔍",
              title: "Project Scanning",
              description:
                "Auto-detect language, framework, package manager, monorepo status, test/build commands, and conventions.",
            },
            {
              icon: "🔒",
              title: "Permission System",
              description:
                "Mode-based permissions (auto/confirm/plan). Risk classification, deny patterns, and allow-always overrides.",
            },
            {
              icon: "📡",
              title: "Awareness",
              description:
                "Real-time git monitoring and file watching. Events for git changes, branch switches, conflicts, and file modifications.",
            },
            {
              icon: "🧩",
              title: "Plugin System",
              description:
                "Extend with custom plugins that add tools and listen to events. Built-in plugins for file, shell, and git.",
            },
            {
              icon: "↩️",
              title: "Command Undo/Redo",
              description:
                "Command history with undo support. File writes automatically snapshot for undo capability.",
            },
          ].map((f, i) => (
            <FeatureCard
              key={f.title}
              title={f.title}
              description={f.description}
              icon={f.icon}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Code Examples */}
      <section className="mt-12">
        <p className="island-kicker mb-4">Usage Examples</p>
        <div className="mb-4 flex gap-2">
          {codeTabs.map((tab, i) => (
            <button
              key={tab.label}
              type="button"
              onClick={() => setActiveCode(i)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeCode === i
                  ? "bg-[rgba(79,184,178,0.14)] text-[var(--lagoon-deep)]"
                  : "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <CodeBlock code={codeTabs[activeCode].code} filename={codeTabs[activeCode].filename} />
      </section>

      {/* Interfaces */}
      <section className="mt-12">
        <p className="island-kicker mb-4">Interfaces</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {interfaces.map((iface, i) => (
            <article
              key={iface.title}
              className="island-shell feature-card rise-in rounded-2xl p-5"
              style={{ animationDelay: `${i * 90 + 80}ms` }}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xl">{iface.icon}</span>
                <h2 className="m-0 text-base font-semibold text-[var(--sea-ink)]">{iface.title}</h2>
              </div>
              <p className="mb-3 text-sm text-[var(--sea-ink-soft)]">{iface.description}</p>
              <code className="text-xs">{iface.code}</code>
            </article>
          ))}
        </div>
      </section>

      {/* Terminal Demo */}
      <section className="mt-12">
        <p className="island-kicker mb-4">See It In Action</p>
        <TerminalAnimation />
      </section>
    </main>
  );
}
