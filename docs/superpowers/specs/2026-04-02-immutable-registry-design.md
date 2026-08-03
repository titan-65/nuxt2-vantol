# Immutable Package Registry — Design Spec

**Date:** 2026-04-02
**Phase:** 1 — Landing page + package registry

## Overview

Transform `apps/immutable/` into a package registry website for the monorepo's npm packages, with `@packages/null-agent/` as the primary focus. The site serves as a landing page, package browser, and documentation surface.

## Decisions

- **Approach:** A — flat routes, shared components
- **Style:** Terminal/dev aesthetic with existing teal/nature palette
- **Cleanup:** Remove all demo code, start fresh

## Routing

| Route                           | File                                          | Purpose                                                                          |
| ------------------------------- | --------------------------------------------- | -------------------------------------------------------------------------------- |
| `/`                             | `src/routes/index.tsx`                        | Landing page — null-agent hero, features, code examples, install, other packages |
| `/null-agent`                   | `src/routes/null-agent.tsx`                   | Dedicated null-agent page — full feature showcase, interface comparison          |
| `/packages`                     | `src/routes/packages.tsx`                     | Package registry listing — cards for all 4 packages                              |
| `/packages/env-check`           | `src/routes/packages/env-check.tsx`           | env-check detail page                                                            |
| `/packages/teacher-toolkit`     | `src/routes/packages/teacher-toolkit.tsx`     | teacher-toolkit detail page                                                      |
| `/packages/vercel-deploy-hooks` | `src/routes/packages/vercel-deploy-hooks.tsx` | vercel-deploy-hooks detail page                                                  |
| `/about`                        | `src/routes/about.tsx`                        | About page (repurposed)                                                          |

## Landing Page Sections

1. **Hero** — "Interactive coding assistant" headline, animated terminal mockup showing null-agent TUI, CTA buttons (npm install, GitHub)
2. **Features grid** — 5 cards: Multi-provider LLM, Tool System, TUI/REPL/Server, Orchestrator, Project Scanning
3. **Code examples** — Tabbed code blocks: "Create an agent", "Add tools", "Chat programmatically"
4. **Interface showcase** — Visual comparison of TUI, REPL, and HTTP server modes
5. **Installation** — npm/pnpm/yarn tab switcher with install commands + package badges
6. **Other packages** — 3 cards for env-check, teacher-toolkit, vercel-deploy-hooks

## Shared Components

| Component           | File                                   | Purpose                                         |
| ------------------- | -------------------------------------- | ----------------------------------------------- |
| `TerminalAnimation` | `src/components/TerminalAnimation.tsx` | CSS-animated terminal showing null-agent TUI    |
| `PackageCard`       | `src/components/PackageCard.tsx`       | Card with name, description, install cmd, links |
| `FeatureCard`       | `src/components/FeatureCard.tsx`       | Icon + title + description card                 |
| `CodeBlock`         | `src/components/CodeBlock.tsx`         | Syntax-highlighted code with copy button        |
| `InstallTabs`       | `src/components/InstallTabs.tsx`       | npm/pnpm/yarn tab switcher                      |

## Style

- Palette: sea-ink, lagoon, palm, sand, foam (existing)
- Fonts: Fraunces (headings), Manrope (body)
- Glassmorphism cards with backdrop blur
- Terminal sections: dark bg with green/teal text
- Light/dark theme via existing toggle

## Cleanup — Files to Remove

### Routes

- `src/routes/api.$.ts`
- `src/routes/api.rpc.$.ts`
- `src/routes/mcp.ts`

### Components

- `src/components/demo-AIAssistant.tsx`
- `src/components/demo-GuitarRecommendation.tsx`
- `src/components/demo.FormComponents.tsx`

### Hooks

- `src/hooks/demo-useAudioRecorder.ts`
- `src/hooks/demo-useTTS.ts`
- `src/hooks/demo.form-context.ts`
- `src/hooks/demo.form.ts`

### Lib

- `src/lib/demo-ai-hook.ts`
- `src/lib/demo-guitar-tools.ts`
- `src/lib/demo-store.ts`
- `src/lib/demo-store-devtools.tsx`

### Data

- `src/data/demo-guitars.ts`

### Other

- `src/mcp-todos.ts`
- `src/utils/mcp-handler.ts`
- `src/polyfill.ts`

### Keep

- `Header.tsx`, `Footer.tsx`, `ThemeToggle.tsx`
- `src/components/ui/*` (shadcn primitives)
- `src/lib/utils.ts` (cn utility)
- `src/integrations/tanstack-query/`
- Root layout (`__root.tsx`)

## Dependencies to Remove (package.json)

- `@tanstack/ai-anthropic`
- `@tanstack/ai-sdk`
- `@tanstack/ai-react`
- `@ai-sdk/react`
- `@anthropic-ai/sdk`
- `@mcp/server` and MCP-related packages
- oRPC packages (if not used elsewhere — keep if needed for future API routes)

## Data Source

Package metadata (name, description, npm URL, GitHub URL, install command) will be defined as a static data file `src/data/packages.ts` rather than fetched at runtime. This avoids build-time dependency on npm registry and keeps the site fully static.

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
}

export const packages: PackageInfo[] = [
  {
    name: "null-agent",
    npmName: "null-agent",
    description: "Interactive coding assistant library with multi-provider LLM support.",
    version: "0.0.0",
    installCmd: "npm install null-agent",
    githubUrl: "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/null-agent",
    npmUrl: "https://www.npmjs.com/package/null-agent",
    isMain: true,
  },
  {
    name: "env-check",
    npmName: "env-check",
    description: "Validates environment variables against a typed schema at startup.",
    version: "0.0.0",
    installCmd: "npm install env-check",
    githubUrl: "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/env-check",
    npmUrl: "https://www.npmjs.com/package/env-check",
  },
  {
    name: "teacher-toolkit",
    npmName: "teacher-toolkit",
    description: "Grade calculation utilities for teachers.",
    version: "0.0.0",
    installCmd: "npm install teacher-toolkit",
    githubUrl:
      "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/teacher-toolkit",
    npmUrl: "https://www.npmjs.com/package/teacher-toolkit",
  },
  {
    name: "vercel-deploy-hooks",
    npmName: "vercel-deploy-hooks",
    description: "Trigger Vercel deployments programmatically via deploy hooks.",
    version: "0.0.0",
    installCmd: "npm install vercel-deploy-hooks",
    githubUrl:
      "https://github.com/vantolbennett/vantolbennett-blog/tree/main/packages/vercel-deploy-hooks",
    npmUrl: "https://www.npmjs.com/package/vercel-deploy-hooks",
  },
];
```

## Phase 2 (Future)

- Interactive demo (chat with null-agent in browser via HTTP server)
- Documentation pages (API reference, guides, examples)
- Search functionality
- Version selector

## Validation

- `vp check` passes (format, lint, typecheck)
- `vp build` succeeds
- All routes render correctly in dev server
- Light/dark theme works on all pages
- Responsive on mobile/tablet/desktop
