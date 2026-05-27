import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import TerminalAnimation from "../components/TerminalAnimation";
import FeatureCard from "../components/FeatureCard";
import CodeBlock from "../components/CodeBlock";
import InstallTabs from "../components/InstallTabs";
import {
  Bot,
  Wrench,
  GitBranch,
  Database,
  Search,
  Lock,
  Radio,
  Puzzle,
  Undo2,
  Zap,
  Monitor,
  Keyboard,
  Globe,
  Bell,
  UserCircle,
  Shield,
  Target,
  Calendar,
  Eye,
} from "lucide-react";

export const Route = createFileRoute("/null-agent")({
  component: NullAgentPage,
});

const agentCode = `import { Agent, createProvider, createDefaultRegistry, UserModel } from "null-agent";

const userModel = new UserModel();
await userModel.recordCorrection("package manager", "prefers pnpm", "explicit", 0.95);

const agent = new Agent({
  provider: createProvider("openai"),
  tools: createDefaultRegistry(),
  userModel,
});

const result = await agent.chat("How do I install this?");
// The assistant already knows you prefer pnpm
console.log(result.content);`;

const proactiveCode = `import { EventBus, ProactiveEngine } from "null-agent";

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
// the assistant reaches out with the right urgency.`;

const privacyCode = `import { Agent, createProvider } from "null-agent";

const agent = new Agent({
  provider: createProvider("anthropic"),
  tools: createDefaultRegistry(),
  privacyMode: true, // redacts user model from LLM
});

await agent.chat("How do I install this?");
// Works normally, but the LLM never sees your preferences`;

const accountabilityCode = `import { ActivityTracker, GoalTracker, Reporter } from "null-agent";

const tracker = new ActivityTracker();
await tracker.init();

// Track goals
const goals = new GoalTracker(store);
await goals.createGoal("Ship auth feature", "daily");

// Generate reports
const reporter = new Reporter(store, tracker);
const report = await reporter.generateDailyReport();
await reporter.saveReport(report);`;

const interfaces = [
  {
    title: "Terminal UI",
    icon: <Monitor size={18} strokeWidth={1.75} />,
    description:
      "Full interactive terminal interface with Ink. Status bar, chat panel, animated NullFace mascot, slash commands, proactive notifications, daily summary panel, and formatted tool call display.",
    code: "null-agent",
  },
  {
    title: "Readline REPL",
    icon: <Keyboard size={18} strokeWidth={1.75} />,
    description:
      "Lightweight readline-based REPL with colored output. No extra dependencies. Perfect for quick interactions or environments where the TUI isn't available.",
    code: "null-agent --plain",
  },
  {
    title: "HTTP API Server",
    icon: <Globe size={18} strokeWidth={1.75} />,
    description:
      "REST API server with streaming SSE support. Default port 3737. Integrate null-agent into any frontend or service.",
    code: "null-agent --server --port 3737",
  },
  {
    title: "One-Shot CLI",
    icon: <Zap size={18} strokeWidth={1.75} />,
    description:
      "Send a single message and get a response. Perfect for scripting, CI/CD pipelines, or quick one-off tasks without entering interactive mode.",
    code: 'null-agent "explain the auth module"',
  },
];

function NullAgentPage() {
  const [activeCode, setActiveCode] = useState(0);

  const codeTabs = [
    { label: "Agent + User Model", code: agentCode, filename: "agent.ts" },
    { label: "Proactive Engine", code: proactiveCode, filename: "proactive.ts" },
    { label: "Privacy Mode", code: privacyCode, filename: "privacy.ts" },
    { label: "Accountability", code: accountabilityCode, filename: "accountability.ts" },
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
          system, conversation persistence, project awareness, multi-agent orchestration, and a
          built-in <strong>developer day tracker</strong> that keeps you accountable.
        </p>
        <p className="mb-4 max-w-2xl text-sm text-[var(--sea-ink-soft)]">
          <strong>v0.6.2</strong> adds the <strong>Proactive Engine</strong> — your assistant now
          reaches out before you ask. It watches for calendar events, git conflicts, and file
          changes, then offers help, warnings, or quiet assistance based on context. It builds a{" "}
          <strong>User Model</strong> from your habits, preferences, and goals, so every chat feels
          like talking to someone who knows you.
        </p>
        <InstallTabs packageName="null-agent" />
      </section>

      {/* Features */}
      <section className="mt-12">
        <p className="island-kicker mb-4">Core Capabilities</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: <Bell size={20} strokeWidth={1.75} />,
              title: "Proactive Engine",
              description:
                "Observes → Interprets → Classifies → Notifies. Calendar events, git conflicts, file changes — the assistant reaches out with the right urgency. Auto, confirm, or block tiers.",
            },
            {
              icon: <UserCircle size={20} strokeWidth={1.75} />,
              title: "User Model",
              description:
                "Persistent model of expertise, preferences, communication style, active goals, and learned corrections. Feeds into every chat and proactive evaluation.",
            },
            {
              icon: <Shield size={20} strokeWidth={1.75} />,
              title: "Privacy Mode",
              description:
                "Toggle privacy to redact all User Model data from the LLM. System prompt shows a redaction notice. Proactive engine operates with minimal context.",
            },
            {
              icon: <Calendar size={20} strokeWidth={1.75} />,
              title: "Calendar Integration",
              description:
                "Google Calendar with OAuth device code flow. Transparent token refresh. Events emitted on the EventBus: upcoming (confirm tier) and started (auto tier).",
            },
            {
              icon: <Target size={20} strokeWidth={1.75} />,
              title: "Accountability",
              description:
                "Activity tracking (explicit + inferred), goal management, daily/weekly reports, proactive reminders for breaks, goals, and daily rituals.",
            },
            {
              icon: <Bot size={20} strokeWidth={1.75} />,
              title: "Multi-Provider LLM",
              description:
                "OpenAI, Anthropic, Gemini, OpenRouter. Streaming responses. Extensible provider interface. Auto-detection from environment variables.",
            },
            {
              icon: <Wrench size={20} strokeWidth={1.75} />,
              title: "49 Built-in Tools",
              description:
                "File read/write/move/copy/delete/glob, shell execution, 15 git operations, code review, test generation, web search, process management, terminal sessions, and more.",
            },
            {
              icon: <GitBranch size={20} strokeWidth={1.75} />,
              title: "Orchestrator",
              description:
                "Spawn parallel sub-agents for complex tasks. Concurrency limits (max 5), spawn limits (3 per turn), 30s timeout per sub-agent.",
            },
            {
              icon: <Database size={20} strokeWidth={1.75} />,
              title: "Memory & Persistence",
              description:
                "File-based conversation storage at ~/.null-agent/memory/. Resume conversations across sessions. Searchable history.",
            },
            {
              icon: <Search size={20} strokeWidth={1.75} />,
              title: "Project Scanning",
              description:
                "Auto-detect language, framework, package manager, monorepo status, test/build commands, and conventions. Detects Next.js, React, Vue, Express, and more.",
            },
            {
              icon: <Lock size={20} strokeWidth={1.75} />,
              title: "Permission System",
              description:
                "Mode-based permissions (auto / confirm / plan). Risk classification, deny patterns, and allow-always overrides.",
            },
            {
              icon: <Radio size={20} strokeWidth={1.75} />,
              title: "Awareness",
              description:
                "Real-time git monitoring and file watching. Events for git changes, branch switches, conflicts, and file modifications.",
            },
            {
              icon: <Puzzle size={20} strokeWidth={1.75} />,
              title: "Plugin System",
              description:
                "Extend with custom plugins that add tools and listen to events. Built-in plugins for file, shell, and git.",
            },
            {
              icon: <Undo2 size={20} strokeWidth={1.75} />,
              title: "Command Undo/Redo",
              description:
                "Command history with undo support. File writes automatically snapshot for undo capability.",
            },
            {
              icon: <Eye size={20} strokeWidth={1.75} />,
              title: "Restrictive Override",
              description:
                "The LLM Interpreter can only escalate approval tiers (make them more restrictive), never downgrade. Safety principle: the most restrictive tier always wins.",
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
        <div className="mb-4 flex flex-wrap gap-2">
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

      {/* New Commands */}
      <section className="mt-12">
        <p className="island-kicker mb-4">New in v0.6</p>
        <div className="island-shell rounded-2xl p-6">
          <h3 className="mb-3 text-lg font-semibold text-[var(--sea-ink)]">User Model Commands</h3>
          <div className="mb-4 grid gap-2 font-mono text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <code className="text-[var(--lagoon-deep)]">/profile</code>
              <span className="text-[var(--sea-ink-soft)]">Show developer profile</span>
            </div>
            <div className="flex gap-2">
              <code className="text-[var(--lagoon-deep)]">/corrections</code>
              <span className="text-[var(--sea-ink-soft)]">List learned corrections</span>
            </div>
            <div className="flex gap-2">
              <code className="text-[var(--lagoon-deep)]">
                /correction add &lt;ctx&gt; | &lt;fact&gt;
              </code>
              <span className="text-[var(--sea-ink-soft)]">Record a correction</span>
            </div>
          </div>

          <h3 className="mb-3 text-lg font-semibold text-[var(--sea-ink)]">Config Commands</h3>
          <div className="mb-4 grid gap-2 font-mono text-sm sm:grid-cols-2">
            <div className="flex gap-2">
              <code className="text-[var(--lagoon-deep)]">/config privacy on|off</code>
              <span className="text-[var(--sea-ink-soft)]">Toggle privacy mode</span>
            </div>
            <div className="flex gap-2">
              <code className="text-[var(--lagoon-deep)]">
                /config context minimal|standard|full
              </code>
              <span className="text-[var(--sea-ink-soft)]">Set context package</span>
            </div>
            <div className="flex gap-2">
              <code className="text-[var(--lagoon-deep)]">
                /config interpreter-model &lt;model&gt;
              </code>
              <span className="text-[var(--sea-ink-soft)]">Set interpreter LLM</span>
            </div>
          </div>

          <h3 className="mb-3 text-lg font-semibold text-[var(--sea-ink)]">Keyboard Shortcuts</h3>
          <div className="grid gap-2 font-mono text-sm sm:grid-cols-3">
            <div className="flex gap-2">
              <kbd className="rounded bg-[rgba(79,184,178,0.1)] px-1.5 py-0.5 text-xs">Ctrl+H</kbd>
              <span className="text-[var(--sea-ink-soft)]">Toggle help</span>
            </div>
            <div className="flex gap-2">
              <kbd className="rounded bg-[rgba(79,184,178,0.1)] px-1.5 py-0.5 text-xs">Ctrl+S</kbd>
              <span className="text-[var(--sea-ink-soft)]">Toggle daily summary</span>
            </div>
            <div className="flex gap-2">
              <kbd className="rounded bg-[rgba(79,184,178,0.1)] px-1.5 py-0.5 text-xs">Y / N</kbd>
              <span className="text-[var(--sea-ink-soft)]">Accept / dismiss notification</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
