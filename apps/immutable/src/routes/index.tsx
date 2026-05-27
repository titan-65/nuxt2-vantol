import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Wrench, Monitor, Keyboard, Globe, Bell, UserCircle, Shield, Target } from "lucide-react";
import TerminalAnimation from "../components/TerminalAnimation";
import FeatureCard from "../components/FeatureCard";
import CodeBlock from "../components/CodeBlock";
import InstallTabs from "../components/InstallTabs";
import PackageCard from "../components/PackageCard";
import { packages } from "../data/packages";

export const Route = createFileRoute("/")({ component: LandingPage });

const features = [
  {
    icon: <Bell size={20} strokeWidth={1.75} />,
    title: "Proactive Engine",
    description:
      "Watches your environment and reaches out before you ask. Calendar events, git conflicts, file changes — classified and delivered with the right urgency.",
  },
  {
    icon: <UserCircle size={20} strokeWidth={1.75} />,
    title: "User Model",
    description:
      "Builds a persistent model of who you are — expertise, preferences, goals, communication style. Every chat feels personal.",
  },
  {
    icon: <Wrench size={20} strokeWidth={1.75} />,
    title: "49 Built-in Tools",
    description:
      "File, shell, git, code review, testing, web search, process management, terminal sessions, and more.",
  },
  {
    icon: <Shield size={20} strokeWidth={1.75} />,
    title: "Privacy Mode",
    description:
      "Toggle privacy to redact all personal data from the LLM's view. Your habits and history stay local.",
  },
  {
    icon: <Target size={20} strokeWidth={1.75} />,
    title: "Accountability",
    description:
      "Track goals, monitor activity patterns, generate daily/weekly reports. A developer day tracker that keeps you accountable.",
  },
  {
    icon: <Monitor size={20} strokeWidth={1.75} />,
    title: "Four Interfaces",
    description: "Terminal UI, readline REPL, HTTP API server, or one-shot CLI. Your choice.",
  },
];

const codeExamples = [
  {
    label: "Create an agent",
    filename: "agent.ts",
    code: `import { Agent, createProvider, createDefaultRegistry, UserModel } from "null-agent";

const userModel = new UserModel();
await userModel.recordCorrection("package manager", "prefers pnpm", "explicit", 0.95);

const agent = new Agent({
  provider: createProvider("openai"),
  tools: createDefaultRegistry(),
  userModel,
});

const result = await agent.chat("How do I install this?");
// The assistant already knows you prefer pnpm
console.log(result.content);`,
  },
  {
    label: "Proactive Engine",
    filename: "proactive.ts",
    code: `import { EventBus, ProactiveEngine } from "null-agent";

const bus = new EventBus();
const engine = new ProactiveEngine({
  eventBus: bus,
  agent,
  onConfirm: (plan) => {
    console.log(\`🔔 \${plan.signal.payload.message}\`);
  },
});
engine.start();
// Calendar events, git conflicts, file changes —
// the assistant reaches out with the right urgency.`,
  },
  {
    label: "Chat programmatically",
    filename: "chat.ts",
    code: `import { Agent, createProvider } from "null-agent";

const agent = new Agent({
  provider: createProvider("anthropic"),
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
              Proactive engine, user model, 49 built-in tools, multi-provider LLM support. Terminal
              UI, REPL, HTTP server, or CLI — your choice. Now with Google Calendar integration,
              privacy mode, and developer accountability.
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
              desc: "Full interactive TUI with Ink — status bar, chat panel, animated mascot, slash commands, proactive notifications.",
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
