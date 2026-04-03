import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Wrench, Monitor, GitBranch, Search, Keyboard, Globe } from "lucide-react";
import TerminalAnimation from "../components/TerminalAnimation";
import FeatureCard from "../components/FeatureCard";
import CodeBlock from "../components/CodeBlock";
import InstallTabs from "../components/InstallTabs";
import PackageCard from "../components/PackageCard";
import { packages } from "../data/packages";

export const Route = createFileRoute("/")({ component: LandingPage });

const features = [
  {
    icon: <Bot size={20} strokeWidth={1.75} />,
    title: "Multi-Provider LLM",
    description: "Connect to OpenAI, Anthropic, or any provider. Streaming responses by default.",
  },
  {
    icon: <Wrench size={20} strokeWidth={1.75} />,
    title: "Built-in Tools",
    description: "File read/write, shell execution, git operations — 10 tools ready to go.",
  },
  {
    icon: <Monitor size={20} strokeWidth={1.75} />,
    title: "Four Interfaces",
    description: "Terminal UI, readline REPL, HTTP API server, or one-shot CLI.",
  },
  {
    icon: <GitBranch size={20} strokeWidth={1.75} />,
    title: "Orchestrator",
    description: "Spawn parallel sub-agents with concurrency limits and task management.",
  },
  {
    icon: <Search size={20} strokeWidth={1.75} />,
    title: "Project Scanning",
    description: "Auto-detect language, framework, package manager, and conventions.",
  },
];

const codeExamples = [
  {
    label: "Create an agent",
    filename: "agent.ts",
    code: `import { Agent, createProvider, createDefaultRegistry } from "null-agent";

const agent = new Agent({
  provider: createProvider("anthropic"),
  tools: createDefaultRegistry(),
  systemPrompt: "You are a helpful coding assistant.",
});

const result = await agent.chat("Explain this file");
console.log(result.content);`,
  },
  {
    label: "Add custom tools",
    filename: "tools.ts",
    code: `import { ToolRegistry, builtinTools } from "null-agent";

const registry = new ToolRegistry();
builtinTools.forEach(t => registry.register(t));

registry.register({
  name: "deploy",
  description: "Deploy to production",
  parameters: { type: "object", properties: { env: { type: "string" } } },
  execute: async ({ env }) => {
    // your deploy logic
    return \`Deployed to \${env}\`;
  },
});`,
  },
  {
    label: "Chat programmatically",
    filename: "chat.ts",
    code: `import { Agent, createProvider } from "null-agent";

const agent = new Agent({
  provider: createProvider("openai"),
});

for await (const chunk of agent.provider.chat([
  { role: "user", content: "Hello" },
])) {
  process.stdout.write(chunk.content);
}`,
  },
];

function LandingPage() {
  const otherPackages = packages.filter((p) => !p.isMain);
  const [activeTab, setActiveTab] = useState(0);

  return (
    <main className="page-wrap px-4 pb-8 pt-14">
      {/* Hero */}
      <section className="island-shell rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14">
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="island-kicker mb-3">Interactive Coding Assistant</p>
            <h1 className="display-title mb-5 max-w-3xl text-4xl leading-[1.02] font-bold tracking-tight text-[var(--sea-ink)] sm:text-6xl">
              null-agent
            </h1>
            <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
              Multi-provider LLM support, built-in tools, multi-agent orchestration. TUI, REPL, HTTP
              server, or CLI — your choice of interface.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/null-agent"
                className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
              >
                Learn More
              </Link>
              <a
                href="https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/null-agent"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
              >
                GitHub
              </a>
            </div>
          </div>
          <TerminalAnimation />
        </div>
      </section>

      {/* Features */}
      <section className="mt-12">
        <p className="island-kicker mb-4 text-center">Features</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
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
        <p className="island-kicker mb-4 text-center">Quick Start</p>
        <div className="mb-4 flex gap-2">
          {codeExamples.map((ex, i) => (
            <button
              key={ex.label}
              type="button"
              onClick={() => setActiveTab(i)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === i
                  ? "bg-[rgba(79,184,178,0.14)] text-[var(--lagoon-deep)]"
                  : "text-[var(--sea-ink-soft)] hover:text-[var(--sea-ink)]"
              }`}
            >
              {ex.label}
            </button>
          ))}
        </div>
        <CodeBlock
          code={codeExamples[activeTab].code}
          filename={codeExamples[activeTab].filename}
        />
      </section>

      {/* Interface Showcase */}
      <section className="mt-12">
        <p className="island-kicker mb-4 text-center">Interfaces</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              title: "Terminal UI",
              desc: "Full interactive TUI with Ink — status bar, chat panel, animated mascot, slash commands.",
              icon: <Monitor size={18} strokeWidth={1.75} />,
            },
            {
              title: "REPL",
              desc: "Lightweight readline interface with colored output. Quick and simple.",
              icon: <Keyboard size={18} strokeWidth={1.75} />,
            },
            {
              title: "HTTP Server",
              desc: "REST API on port 3737 with streaming SSE. Integrate with any frontend.",
              icon: <Globe size={18} strokeWidth={1.75} />,
            },
          ].map((iface, i) => (
            <FeatureCard
              key={iface.title}
              title={iface.title}
              description={iface.desc}
              icon={iface.icon}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Installation */}
      <section className="mt-12">
        <p className="island-kicker mb-4 text-center">Installation</p>
        <div className="mx-auto max-w-lg">
          <InstallTabs packageName="null-agent" />
        </div>
      </section>

      {/* Other Packages */}
      <section className="mt-12">
        <p className="island-kicker mb-4 text-center">More Packages</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {otherPackages.map((pkg, i) => (
            <PackageCard key={pkg.name} pkg={pkg} index={i} />
          ))}
        </div>
      </section>
    </main>
  );
}
