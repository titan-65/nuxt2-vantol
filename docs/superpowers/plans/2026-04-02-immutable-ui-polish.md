# Immutable Registry UI Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Polish the `apps/immutable/` UI — replace all emoji with Lucide React icons, improve visual hierarchy, refine grid layouts, and clean up template-sounding text.

**Architecture:** Replace emoji string props with Lucide React icon components across FeatureCard and route files. Add icon container styling with teal tinting. Swap inline SVG GitHub icons for Lucide equivalents. Update feature grid to use `lg:grid-cols-3` for better breathing room. Clean up footer boilerplate text.

**Tech Stack:** React 19, TanStack Router, Tailwind CSS v4, Lucide React, existing teal/nature design system (CSS variables).

---

## File Map

| File                                            | Change                                                                                         |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `apps/immutable/src/components/FeatureCard.tsx` | Change `icon` prop from `string` to `React.ReactNode`; add icon container div with teal bg     |
| `apps/immutable/src/routes/index.tsx`           | Replace emoji in `features` and `interfaces` arrays with Lucide icon imports; update grid cols |
| `apps/immutable/src/routes/null-agent.tsx`      | Replace emoji in interfaces array and feature list with Lucide icon imports                    |
| `apps/immutable/src/components/Header.tsx`      | Replace inline GitHub SVG with Lucide `Github` icon                                            |
| `apps/immutable/src/components/Footer.tsx`      | Replace inline GitHub SVG with Lucide `Github` icon; clean up footer text                      |

---

## Tasks

### Task 1: Refactor FeatureCard — icon prop type and container

**Files:**

- Modify: `apps/immutable/src/components/FeatureCard.tsx`

- [ ] **Step 1: Update FeatureCard component**

```tsx
import type { ReactNode } from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  index?: number;
}

export default function FeatureCard({ title, description, icon, index = 0 }: FeatureCardProps) {
  return (
    <article
      className="island-shell feature-card rise-in rounded-2xl p-5"
      style={{ animationDelay: `${index * 90 + 80}ms` }}
    >
      {icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-[rgba(79,184,178,0.12)]">
          <div className="text-[var(--lagoon)]">{icon}</div>
        </div>
      )}
      <h2 className="mb-1.5 text-base font-semibold text-[var(--sea-ink)]">{title}</h2>
      <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{description}</p>
    </article>
  );
}
```

---

### Task 2: Update Landing Page — replace emoji with Lucide icons, fix grid

**Files:**

- Modify: `apps/immutable/src/routes/index.tsx`

- [ ] **Step 1: Update imports and features array**

Replace the emoji in the imports and features/interfaces arrays with Lucide icons. The `Bot`, `Wrench`, `Monitor`, `GitBranch`, `Search`, `Keyboard`, `Globe`, `Zap` icons come from `lucide-react`.

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Bot, Wrench, Monitor, GitBranch, Search, Keyboard, Globe, Zap } from "lucide-react";
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
```

- [ ] **Step 2: Update interfaces array (Interfaces section)**

```tsx
{
  [
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
  ));
}
```

- [ ] **Step 3: Update the Features grid columns from 5 to 3**

In the Features section, change `lg:grid-cols-5` to `lg:grid-cols-3`:

```tsx
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
```

---

### Task 3: Update Null-Agent Page — replace emoji with Lucide icons

**Files:**

- Modify: `apps/immutable/src/routes/null-agent.tsx`

- [ ] **Step 1: Update imports and interfaces array**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
} from "lucide-react";
import TerminalAnimation from "../components/TerminalAnimation";
import FeatureCard from "../components/FeatureCard";
import CodeBlock from "../components/CodeBlock";
import InstallTabs from "../components/InstallTabs";

export const Route = createFileRoute("/null-agent")({
  component: NullAgentPage,
});
```

- [ ] **Step 2: Update interfaces array**

```tsx
const interfaces = [
  {
    title: "Terminal UI",
    icon: <Monitor size={18} strokeWidth={1.75} />,
    description:
      "Full interactive terminal interface built with Ink (React for terminal). Features status bar showing provider/model/project info, chat panel with message bubbles, animated NullFace mascot, slash commands (/help, /clear, /context, /tasks, /config), and formatted tool call display.",
    code: "null-agent",
  },
  {
    title: "Readline REPL",
    icon: <Keyboard size={18} strokeWidth={1.75} />,
    description:
      "Lightweight readline-based REPL with colored output. No dependencies beyond Node.js. Perfect for quick interactions or environments where Ink isn't available.",
    code: "null-agent --plain",
  },
  {
    title: "HTTP API Server",
    icon: <Globe size={18} strokeWidth={1.75} />,
    description:
      "REST API server (default port 3737) with streaming SSE support. Integrate null-agent into any frontend or service. Endpoints for chat, history, tasks, config, and health.",
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
```

- [ ] **Step 3: Update the Core Capabilities feature cards**

```tsx
          {[
            {
              icon: <Bot size={20} strokeWidth={1.75} />,
              title: "Multi-Provider LLM",
              description:
                "OpenAI and Anthropic providers with streaming. Extensible provider interface for custom backends.",
            },
            {
              icon: <Wrench size={20} strokeWidth={1.75} />,
              title: "10 Built-in Tools",
              description:
                "File read/write, shell execution, and 7 git operations. Register custom tools with JSON Schema parameters.",
            },
            {
              icon: <GitBranch size={20} strokeWidth={1.75} />,
              title: "Orchestrator",
              description:
                "Spawn parallel sub-agents for complex tasks. Concurrency limits, task tracking, and result aggregation.",
            },
            {
              icon: <Database size={20} strokeWidth={1.75} />,
              title: "Memory & Persistence",
              description:
                "File-based conversation storage at ~/.null-agent/memory/. Resume conversations across sessions.",
            },
            {
              icon: <Search size={20} strokeWidth={1.75} />,
              title: "Project Scanning",
              description:
                "Auto-detect language, framework, package manager, monorepo status, test/build commands, and conventions.",
            },
            {
              icon: <Lock size={20} strokeWidth={1.75} />,
              title: "Permission System",
              description:
                "Mode-based permissions (auto/confirm/plan). Risk classification, deny patterns, and allow-always overrides.",
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
          ].map((f, i) => (
```

---

### Task 4: Replace inline GitHub SVGs with Lucide icons

**Files:**

- Modify: `apps/immutable/src/components/Header.tsx`
- Modify: `apps/immutable/src/components/Footer.tsx`

- [ ] **Step 1: Update Header.tsx**

```tsx
import { Link } from "@tanstack/react-router";
import { Github } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--header-bg)] px-4 backdrop-blur-lg">
      <nav className="page-wrap flex flex-wrap items-center gap-x-3 gap-y-2 py-3 sm:py-4">
        <h2 className="m-0 flex-shrink-0 text-base font-semibold tracking-tight">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-full border border-[var(--chip-line)] bg-[var(--chip-bg)] px-3 py-1.5 text-sm text-[var(--sea-ink)] no-underline shadow-[0_8px_24px_rgba(30,90,72,0.08)] sm:px-4 sm:py-2"
          >
            <span className="h-2 w-2 rounded-full bg-[linear-gradient(90deg,#56c6be,#7ed3bf)]" />
            Immutable
          </Link>
        </h2>

        <div className="ml-auto flex items-center gap-1.5 sm:ml-0 sm:gap-2">
          <a
            href="https://github.com/vantolbennett/vantolbennett-blog"
            target="_blank"
            rel="noreferrer"
            className="hidden rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)] sm:block"
            aria-label="GitHub"
          >
            <Github size={20} strokeWidth={1.75} />
          </a>

          <ThemeToggle />
        </div>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link to="/" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
            Home
          </Link>
          <Link
            to="/null-agent"
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
          >
            null-agent
          </Link>
          <Link
            to="/packages"
            className="nav-link"
            activeProps={{ className: "nav-link is-active" }}
          >
            Packages
          </Link>
          <Link to="/about" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
            About
          </Link>
        </div>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Update Footer.tsx**

```tsx
import { Github } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">&copy; {year} Immutable</p>
        <p className="island-kicker m-0">TanStack Start</p>
      </div>
      <div className="mt-4 flex justify-center gap-4">
        <a
          href="https://github.com/vantolbennett/vantolbennett-blog"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
          aria-label="GitHub"
        >
          <Github size={28} strokeWidth={1.5} />
        </a>
      </div>
    </footer>
  );
}
```

---

### Task 5: Verify — run type check and lint

- [ ] **Step 1: Run vp check**

```bash
vp check
```

Expected: No TypeScript errors, no lint errors.

- [ ] **Step 2: Commit**

```bash
git add -A && git commit -m "feat(immutable): polish UI — replace emoji with Lucide icons, refine layouts"
```
