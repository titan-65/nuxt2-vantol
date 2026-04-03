# Immutable Package Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform `apps/immutable/` into a package registry website with null-agent as the primary focus, featuring a landing page, package listing, individual package pages, and a dedicated null-agent showcase.

**Architecture:** Flat file-based routes with shared components. Landing page has 6 sections (hero, features, code examples, interface showcase, installation, other packages). Each package gets a dedicated page. All demo code removed.

**Tech Stack:** TanStack Start, TanStack Router (file-based), React 19, Tailwind CSS v4, shadcn/ui, TypeScript

---

## File Structure

```
apps/immutable/src/
├── data/
│   └── packages.ts                    # Package metadata (static data)
├── components/
│   ├── Header.tsx                     # Updated nav links
│   ├── Footer.tsx                     # Updated footer
│   ├── ThemeToggle.tsx                # Keep as-is
│   ├── TerminalAnimation.tsx          # Animated terminal mockup
│   ├── PackageCard.tsx                # Package card component
│   ├── FeatureCard.tsx                # Feature card component
│   ├── CodeBlock.tsx                  # Syntax-highlighted code block
│   ├── InstallTabs.tsx                # npm/pnpm/yarn tab switcher
│   └── ui/                            # shadcn primitives (keep)
├── routes/
│   ├── __root.tsx                     # Updated root (remove StoreDevtools)
│   ├── index.tsx                      # Landing page
│   ├── about.tsx                      # Updated about page
│   ├── null-agent.tsx                 # Dedicated null-agent page
│   └── packages/
│       ├── index.tsx                  # Package listing
│       ├── env-check.tsx              # env-check page
│       ├── teacher-toolkit.tsx        # teacher-toolkit page
│       └── vercel-deploy-hooks.tsx    # vercel-deploy-hooks page
└── styles.css                         # Updated CSS
```

---

## Task 1: Remove Demo Code and Update Root Layout

**Files:**
- Delete: `src/routes/api.$.ts`, `src/routes/api.rpc.$.ts`, `src/routes/mcp.ts`
- Delete: `src/components/demo-AIAssistant.tsx`, `src/components/demo-GuitarRecommendation.tsx`, `src/components/demo.FormComponents.tsx`
- Delete: `src/hooks/demo-useAudioRecorder.ts`, `src/hooks/demo-useTTS.ts`, `src/hooks/demo.form-context.ts`, `src/hooks/demo.form.ts`
- Delete: `src/lib/demo-ai-hook.ts`, `src/lib/demo-guitar-tools.ts`, `src/lib/demo-store.ts`, `src/lib/demo-store-devtools.tsx`
- Delete: `src/data/demo-guitars.ts`
- Delete: `src/mcp-todos.ts`, `src/utils/mcp-handler.ts`, `src/polyfill.ts`
- Modify: `src/routes/__root.tsx`
- Modify: `src/components/Header.tsx`
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Delete all demo files**

```bash
cd /Users/vantolbennett/Developer/2025/vantolbennett-blog/apps/immutable
rm -f src/routes/api.$.ts src/routes/api.rpc.$.ts src/routes/mcp.ts
rm -f src/components/demo-AIAssistant.tsx src/components/demo-GuitarRecommendation.tsx src/components/demo.FormComponents.tsx
rm -f src/hooks/demo-useAudioRecorder.ts src/hooks/demo-useTTS.ts src/hooks/demo.form-context.ts src/hooks/demo.form.ts
rm -f src/lib/demo-ai-hook.ts src/lib/demo-guitar-tools.ts src/lib/demo-store.ts src/lib/demo-store-devtools.tsx
rm -f src/data/demo-guitars.ts
rm -f src/mcp-todos.ts src/utils/mcp-handler.ts src/polyfill.ts
```

- [ ] **Step 2: Update `__root.tsx` — remove demo imports, update title**

```tsx
import { HeadContent, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import Footer from "../components/Footer";
import Header from "../components/Header";
import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";
import appCss from "../styles.css?url";
import type { QueryClient } from "@tanstack/react-query";

interface MyRouterContext {
  queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Immutable — Package Registry" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        <Header />
        {children}
        <Footer />
        <TanStackDevtools
          config={{ position: "bottom-right" }}
          plugins={[
            {
              name: "Tanstack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Update Header — new nav links, remove AI assistant import**

```tsx
import { Link } from "@tanstack/react-router";
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
          >
            <span className="sr-only">GitHub</span>
            <svg viewBox="0 0 16 16" aria-hidden="true" width="24" height="24">
              <path
                fill="currentColor"
                d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
              />
            </svg>
          </a>

          <ThemeToggle />
        </div>

        <div className="order-3 flex w-full flex-wrap items-center gap-x-4 gap-y-1 pb-1 text-sm font-semibold sm:order-2 sm:w-auto sm:flex-nowrap sm:pb-0">
          <Link to="/" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
            Home
          </Link>
          <Link to="/null-agent" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
            null-agent
          </Link>
          <Link to="/packages" className="nav-link" activeProps={{ className: "nav-link is-active" }}>
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

- [ ] **Step 4: Update Footer**

```tsx
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-[var(--line)] px-4 pb-14 pt-10 text-[var(--sea-ink-soft)]">
      <div className="page-wrap flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
        <p className="m-0 text-sm">&copy; {year} Immutable. All rights reserved.</p>
        <p className="island-kicker m-0">Built with TanStack Start</p>
      </div>
      <div className="mt-4 flex justify-center gap-4">
        <a
          href="https://github.com/vantolbennett/vantolbennett-blog"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl p-2 text-[var(--sea-ink-soft)] transition hover:bg-[var(--link-bg-hover)] hover:text-[var(--sea-ink)]"
        >
          <span className="sr-only">GitHub</span>
          <svg viewBox="0 0 16 16" aria-hidden="true" width="32" height="32">
            <path
              fill="currentColor"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z"
            />
          </svg>
        </a>
      </div>
    </footer>
  );
}
```

- [ ] **Step 5: Verify the app still starts after cleanup**

Run: `vp dev --port 3000` (or just check typecheck)
Expected: No import errors from removed files

---

## Task 2: Create Package Data and Shared Components

**Files:**
- Create: `src/data/packages.ts`
- Create: `src/components/TerminalAnimation.tsx`
- Create: `src/components/PackageCard.tsx`
- Create: `src/components/FeatureCard.tsx`
- Create: `src/components/CodeBlock.tsx`
- Create: `src/components/InstallTabs.tsx`

- [ ] **Step 1: Create `src/data/packages.ts`**

```ts
export interface PackageInfo {
  name: string;
  npmName: string;
  description: string;
  version: string;
  installCmd: string;
  githubUrl: string;
  npmUrl: string;
  isMain?: boolean;
  features?: string[];
}

export const packages: PackageInfo[] = [
  {
    name: "null-agent",
    npmName: "null-agent",
    description: "Interactive coding assistant library with multi-provider LLM support, tool system, and multi-agent orchestration.",
    version: "0.0.0",
    installCmd: "npm install null-agent",
    githubUrl: "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/null-agent",
    npmUrl: "https://www.npmjs.com/package/null-agent",
    isMain: true,
    features: [
      "Multi-provider LLM (OpenAI, Anthropic)",
      "Built-in tools (file, shell, git)",
      "TUI, REPL, HTTP server, CLI",
      "Multi-agent orchestrator",
      "Project scanning & awareness",
    ],
  },
  {
    name: "env-check",
    npmName: "env-check",
    description: "Validates environment variables against a typed schema at startup with clear error messages.",
    version: "0.0.0",
    installCmd: "npm install env-check",
    githubUrl: "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/env-check",
    npmUrl: "https://www.npmjs.com/package/env-check",
  },
  {
    name: "teacher-toolkit",
    npmName: "teacher-toolkit",
    description: "Grade calculation utilities — letter grades, GPA conversion, weighted averages, score curving, and class statistics.",
    version: "0.0.0",
    installCmd: "npm install teacher-toolkit",
    githubUrl: "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/teacher-toolkit",
    npmUrl: "https://www.npmjs.com/package/teacher-toolkit",
  },
  {
    name: "vercel-deploy-hooks",
    npmName: "vercel-deploy-hooks",
    description: "Trigger Vercel deployments programmatically via deploy hooks. Works as both a library and CLI.",
    version: "0.0.0",
    installCmd: "npm install vercel-deploy-hooks",
    githubUrl: "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/vercel-deploy-hooks",
    npmUrl: "https://www.npmjs.com/package/vercel-deploy-hooks",
  },
];

export function getPackageBySlug(slug: string): PackageInfo | undefined {
  return packages.find((p) => p.name === slug);
}
```

- [ ] **Step 2: Create `src/components/TerminalAnimation.tsx`**

```tsx
import { useEffect, useState } from "react";

const lines = [
  { text: "$ null-agent", delay: 0 },
  { text: "", delay: 300 },
  { text: "  ╔══════════════════════════════════════╗", delay: 400 },
  { text: "  ║        null-agent v0.0.0              ║", delay: 500 },
  { text: "  ║   Interactive coding assistant        ║", delay: 600 },
  { text: "  ╚══════════════════════════════════════╝", delay: 700 },
  { text: "", delay: 800 },
  { text: "  Provider: anthropic  Model: claude-sonnet", delay: 900 },
  { text: "  Project: my-app (TypeScript, pnpm)", delay: 1000 },
  { text: "", delay: 1100 },
  { text: "  > help me refactor the auth module", delay: 1200 },
  { text: "", delay: 1600 },
  { text: "  \x1b[36m● Reading src/auth/middleware.ts...\x1b[0m", delay: 1800 },
  { text: "  \x1b[36m● Running shell: npx tsc --noEmit...\x1b[0m", delay: 2200 },
  { text: "  \x1b[32m✓ All types check out.\x1b[0m", delay: 2600 },
  { text: "", delay: 2800 },
  { text: "  I'll refactor the middleware to use", delay: 2900 },
  { text: "  a strategy pattern for auth providers.", delay: 3100 },
  { text: "  \x1b[36m● Writing src/auth/strategies/...\x1b[0m", delay: 3400 },
  { text: "  \x1b[32m✓ Done. 3 files changed.\x1b[0m", delay: 3800 },
];

export default function TerminalAnimation() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    if (visibleCount >= lines.length) return;
    const timer = setTimeout(() => {
      setVisibleCount((c) => c + 1);
    }, lines[visibleCount].delay - (visibleCount > 0 ? lines[visibleCount - 1].delay : 0));
    return () => clearTimeout(timer);
  }, [visibleCount]);

  return (
    <div className="terminal-window overflow-hidden rounded-xl border border-[rgba(141,229,219,0.2)] bg-[#0a1418] shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
      <div className="flex items-center gap-2 border-b border-[rgba(141,229,219,0.1)] px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
        <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
        <span className="h-3 w-3 rounded-full bg-[#28c840]" />
        <span className="ml-2 text-xs text-[rgba(141,229,219,0.4)]">null-agent — bash</span>
      </div>
      <div className="p-4 font-mono text-sm leading-relaxed text-[#d7ece8]">
        {lines.slice(0, visibleCount).map((line, i) => (
          <div key={i} className="whitespace-pre-wrap">
            {line.text.replace(/\x1b\[(\d+)m/g, "")}
          </div>
        ))}
        {visibleCount < lines.length && (
          <span className="inline-block h-4 w-2 animate-pulse bg-[#60d7cf]" />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/components/PackageCard.tsx`**

```tsx
import { Link } from "@tanstack/react-router";
import type { PackageInfo } from "../data/packages";

interface PackageCardProps {
  pkg: PackageInfo;
  index?: number;
}

export default function PackageCard({ pkg, index = 0 }: PackageCardProps) {
  return (
    <Link
      to="/packages/$slug"
      params={{ slug: pkg.name }}
      className="island-shell feature-card rise-in block rounded-2xl p-5 no-underline"
      style={{ animationDelay: `${index * 90 + 80}ms` }}
    >
      <div className="mb-2 flex items-center gap-2">
        <h2 className="m-0 text-base font-semibold text-[var(--sea-ink)]">{pkg.name}</h2>
        <span className="rounded-full bg-[rgba(79,184,178,0.14)] px-2 py-0.5 text-xs font-medium text-[var(--lagoon-deep)]">
          {pkg.version}
        </span>
      </div>
      <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{pkg.description}</p>
      <code className="mt-3 block text-xs">{pkg.installCmd}</code>
    </Link>
  );
}
```

- [ ] **Step 4: Create `src/components/FeatureCard.tsx`**

```tsx
interface FeatureCardProps {
  title: string;
  description: string;
  icon?: string;
  index?: number;
}

export default function FeatureCard({ title, description, icon, index = 0 }: FeatureCardProps) {
  return (
    <article
      className="island-shell feature-card rise-in rounded-2xl p-5"
      style={{ animationDelay: `${index * 90 + 80}ms` }}
    >
      {icon && <div className="mb-3 text-2xl">{icon}</div>}
      <h2 className="mb-2 text-base font-semibold text-[var(--sea-ink)]">{title}</h2>
      <p className="m-0 text-sm text-[var(--sea-ink-soft)]">{description}</p>
    </article>
  );
}
```

- [ ] **Step 5: Create `src/components/CodeBlock.tsx`**

```tsx
import { useState } from "react";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
}

export default function CodeBlock({ code, language = "typescript", filename }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[#0a1418]">
      {filename && (
        <div className="flex items-center justify-between border-b border-[rgba(141,229,219,0.1)] px-4 py-2">
          <span className="text-xs text-[rgba(141,229,219,0.4)]">{filename}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded px-2 py-1 text-xs text-[rgba(141,229,219,0.6)] transition hover:bg-[rgba(141,229,219,0.1)] hover:text-[#d7ece8]"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      )}
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed text-[#d7ece8]">
        <code>{code}</code>
      </pre>
    </div>
  );
}
```

- [ ] **Step 6: Create `src/components/InstallTabs.tsx`**

```tsx
import { useState } from "react";

interface InstallTabsProps {
  packageName: string;
}

const managers = [
  { id: "npm", cmd: "npm install" },
  { id: "pnpm", cmd: "pnpm add" },
  { id: "yarn", cmd: "yarn add" },
] as const;

export default function InstallTabs({ packageName }: InstallTabsProps) {
  const [active, setActive] = useState<"npm" | "pnpm" | "yarn">("npm");
  const cmd = `${managers.find((m) => m.id === active)?.cmd} ${packageName}`;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[#0a1418]">
      <div className="flex border-b border-[rgba(141,229,219,0.1)]">
        {managers.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setActive(m.id)}
            className={`px-4 py-2 text-xs font-medium transition ${
              active === m.id
                ? "border-b-2 border-[#60d7cf] text-[#d7ece8]"
                : "text-[rgba(141,229,219,0.4)] hover:text-[#d7ece8]"
            }`}
          >
            {m.id}
          </button>
        ))}
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm text-[#d7ece8]">
        <code>{cmd}</code>
      </pre>
    </div>
  );
}
```

- [ ] **Step 7: Verify components compile**

Run: `vp check`
Expected: No errors

---

## Task 3: Build the Landing Page

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Write the landing page**

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import TerminalAnimation from "../components/TerminalAnimation";
import FeatureCard from "../components/FeatureCard";
import CodeBlock from "../components/CodeBlock";
import InstallTabs from "../components/InstallTabs";
import PackageCard from "../components/PackageCard";
import { packages } from "../data/packages";

export const Route = createFileRoute("/")({ component: LandingPage });

const features = [
  { icon: "🤖", title: "Multi-Provider LLM", description: "Connect to OpenAI, Anthropic, or any provider. Streaming responses by default." },
  { icon: "🔧", title: "Built-in Tools", description: "File read/write, shell execution, git operations — 10 tools ready to go." },
  { icon: "🖥️", title: "Four Interfaces", description: "Terminal UI, readline REPL, HTTP API server, or one-shot CLI." },
  { icon: "🔀", title: "Orchestrator", description: "Spawn parallel sub-agents with concurrency limits and task management." },
  { icon: "🔍", title: "Project Scanning", description: "Auto-detect language, framework, package manager, and conventions." },
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
              Multi-provider LLM support, built-in tools, multi-agent orchestration.
              TUI, REPL, HTTP server, or CLI — your choice of interface.
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {features.map((f, i) => (
            <FeatureCard key={f.title} title={f.title} description={f.description} icon={f.icon} index={i} />
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
        <CodeBlock code={codeExamples[activeTab].code} filename={codeExamples[activeTab].filename} />
      </section>

      {/* Interface Showcase */}
      <section className="mt-12">
        <p className="island-kicker mb-4 text-center">Interfaces</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "Terminal UI", desc: "Full interactive TUI with Ink — status bar, chat panel, animated mascot, slash commands.", icon: "🖥️" },
            { title: "REPL", desc: "Lightweight readline interface with colored output. Quick and simple.", icon: "⌨️" },
            { title: "HTTP Server", desc: "REST API on port 3737 with streaming SSE. Integrate with any frontend.", icon: "🌐" },
          ].map((iface, i) => (
            <FeatureCard key={iface.title} title={iface.title} description={iface.desc} icon={iface.icon} index={i} />
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

import { useState } from "react";
```

Note: The `useState` import must be at the top with the other imports.

- [ ] **Step 2: Verify landing page renders**

Run: `vp check`
Expected: Typecheck passes

---

## Task 4: Build Package Listing and Detail Pages

**Files:**
- Create: `src/routes/packages/index.tsx`
- Create: `src/routes/packages/env-check.tsx`
- Create: `src/routes/packages/teacher-toolkit.tsx`
- Create: `src/routes/packages/vercel-deploy-hooks.tsx`
- Create: `src/routes/packages/$slug.tsx` (dynamic route)

- [ ] **Step 1: Create `src/routes/packages/index.tsx`**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import PackageCard from "../../components/PackageCard";
import { packages } from "../../data/packages";

export const Route = createFileRoute("/packages/")({
  component: PackagesPage,
});

function PackagesPage() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="mb-8">
        <p className="island-kicker mb-2">Registry</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Packages
        </h1>
        <p className="max-w-3xl text-base text-[var(--sea-ink-soft)]">
          Open-source packages for developers. Install, extend, and build with them.
        </p>
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        {packages.map((pkg, i) => (
          <PackageCard key={pkg.name} pkg={pkg} index={i} />
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Create `src/routes/packages/$slug.tsx` (dynamic route for all packages)**

```tsx
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { getPackageBySlug } from "../../data/packages";
import InstallTabs from "../../components/InstallTabs";

export const Route = createFileRoute("/packages/$slug")({
  loader: ({ params }) => {
    const pkg = getPackageBySlug(params.slug);
    if (!pkg) throw notFound();
    return { pkg };
  },
  component: PackageDetailPage,
});

function PackageDetailPage() {
  const { pkg } = Route.useLoaderData();

  return (
    <main className="page-wrap px-4 py-12">
      <Link
        to="/packages"
        className="mb-6 inline-block text-sm text-[var(--sea-ink-soft)] no-underline hover:text-[var(--sea-ink)]"
      >
        &larr; All packages
      </Link>

      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <div className="mb-4 flex items-center gap-3">
          <h1 className="display-title text-4xl font-bold text-[var(--sea-ink)]">{pkg.name}</h1>
          <span className="rounded-full bg-[rgba(79,184,178,0.14)] px-3 py-1 text-sm font-medium text-[var(--lagoon-deep)]">
            v{pkg.version}
          </span>
        </div>
        <p className="mb-6 max-w-3xl text-base text-[var(--sea-ink-soft)]">{pkg.description}</p>

        <div className="mb-6 flex gap-3">
          <a
            href={pkg.npmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-4 py-2 text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
          >
            npm
          </a>
          <a
            href={pkg.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-4 py-2 text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
          >
            GitHub
          </a>
        </div>

        <InstallTabs packageName={pkg.npmName} />
      </section>

      {pkg.features && (
        <section className="mt-8">
          <p className="island-kicker mb-4">Features</p>
          <ul className="m-0 list-disc space-y-2 pl-5 text-sm text-[var(--sea-ink-soft)]">
            {pkg.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
```

- [ ] **Step 3: Update `src/routes/about.tsx`**

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: About,
});

function About() {
  return (
    <main className="page-wrap px-4 py-12">
      <section className="island-shell rounded-2xl p-6 sm:p-8">
        <p className="island-kicker mb-2">About</p>
        <h1 className="display-title mb-3 text-4xl font-bold text-[var(--sea-ink)] sm:text-5xl">
          Immutable
        </h1>
        <p className="mb-4 max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          A package registry and showcase for open-source developer tools. Built with
          TanStack Start, Tailwind CSS, and shadcn/ui.
        </p>
        <p className="max-w-3xl text-base leading-8 text-[var(--sea-ink-soft)]">
          The flagship package is{" "}
          <Link to="/null-agent" className="text-[var(--lagoon-deep)]">
            null-agent
          </Link>
          , an interactive coding assistant library with multi-provider LLM support.
          Browse all packages on the{" "}
          <Link to="/packages" className="text-[var(--lagoon-deep)]">
            packages page
          </Link>.
        </p>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Verify all routes work**

Run: `vp check`
Expected: Typecheck passes, no broken imports

---

## Task 5: Build the Null-Agent Dedicated Page

**Files:**
- Create: `src/routes/null-agent.tsx`

- [ ] **Step 1: Create `src/routes/null-agent.tsx`**

```tsx
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

const serverCode: string = `import { Agent, createProvider, createDefaultRegistry } from "null-agent";
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
    description: "Full interactive terminal interface built with Ink (React for terminal). Features status bar showing provider/model/project info, chat panel with message bubbles, animated NullFace mascot, slash commands (/help, /clear, /context, /tasks, /config), and formatted tool call display.",
    code: "null-agent",
  },
  {
    title: "Readline REPL",
    icon: "⌨️",
    description: "Lightweight readline-based REPL with colored output. No dependencies beyond Node.js. Perfect for quick interactions or environments where Ink isn't available.",
    code: "null-agent --plain",
  },
  {
    title: "HTTP API Server",
    icon: "🌐",
    description: "REST API server (default port 3737) with streaming SSE support. Integrate null-agent into any frontend or service. Endpoints for chat, history, tasks, config, and health.",
    code: "null-agent --server --port 3737",
  },
  {
    title: "One-Shot CLI",
    icon: "⚡",
    description: "Send a single message and get a response. Perfect for scripting, CI/CD pipelines, or quick one-off tasks without entering interactive mode.",
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
          Interactive coding assistant library with multi-provider LLM support, a built-in
          tool system, conversation persistence, project awareness, and multi-agent orchestration.
        </p>
        <InstallTabs packageName="null-agent" />
      </section>

      {/* Features */}
      <section className="mt-12">
        <p className="island-kicker mb-4">Core Capabilities</p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: "🤖", title: "Multi-Provider LLM", description: "OpenAI and Anthropic providers with streaming. Extensible provider interface for custom backends." },
            { icon: "🔧", title: "10 Built-in Tools", description: "File read/write, shell execution, and 7 git operations. Register custom tools with JSON Schema parameters." },
            { icon: "🔀", title: "Orchestrator", description: "Spawn parallel sub-agents for complex tasks. Concurrency limits, task tracking, and result aggregation." },
            { icon: "💾", title: "Memory & Persistence", description: "File-based conversation storage at ~/.null-agent/memory/. Resume conversations across sessions." },
            { icon: "🔍", title: "Project Scanning", description: "Auto-detect language, framework, package manager, monorepo status, test/build commands, and conventions." },
            { icon: "🔒", title: "Permission System", description: "Mode-based permissions (auto/confirm/plan). Risk classification, deny patterns, and allow-always overrides." },
            { icon: "📡", title: "Awareness", description: "Real-time git monitoring and file watching. Events for git changes, branch switches, conflicts, and file modifications." },
            { icon: "🧩", title: "Plugin System", description: "Extend with custom plugins that add tools and listen to events. Built-in plugins for file, shell, and git." },
            { icon: "↩️", title: "Command Undo/Redo", description: "Command history with undo support. File writes automatically snapshot for undo capability." },
          ].map((f, i) => (
            <FeatureCard key={f.title} title={f.title} description={f.description} icon={f.icon} index={i} />
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
```

- [ ] **Step 2: Add CSS for terminal styling if needed**

Add to `src/styles.css` at the end:

```css
.terminal-window {
  font-variant-ligatures: none;
}
```

- [ ] **Step 3: Final verification**

Run: `vp check`
Run: `vp build`
Expected: Both pass without errors

---

## Task 6: Final Verification

- [ ] **Step 1: Run full typecheck and lint**

Run: `vp check`
Expected: Clean pass

- [ ] **Step 2: Run build**

Run: `vp build`
Expected: Build succeeds

- [ ] **Step 3: Start dev server and verify routes**

Run: `vp dev --port 3000`
Verify routes:
- `/` — Landing page with hero, features, code examples, installation, other packages
- `/null-agent` — Full documentation page
- `/packages` — Package listing
- `/packages/null-agent` — null-agent detail page
- `/packages/env-check` — env-check detail page
- `/packages/teacher-toolkit` — teacher-toolkit detail page
- `/packages/vercel-deploy-hooks` — vercel-deploy-hooks detail page
- `/about` — Updated about page

- [ ] **Step 4: Verify dark/light theme toggle works**

Toggle theme on each page and verify colors update correctly.
