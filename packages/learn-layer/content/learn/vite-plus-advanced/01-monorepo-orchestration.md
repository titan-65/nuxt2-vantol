---
title: "Monorepo Orchestration"
description: "Run tasks across a workspace in dependency order with vp run: recursive (-r), transitive (-t), pnpm-style --filter, parallel mode, and concurrency limits — all driven by the regular package.json dependency graph."
series: "vite-plus-advanced"
order: 1
feature: "vp run -r / -t / --filter / --parallel"
sourceUrl: "https://viteplus.dev/guide/monorepo"
difficulty: "Advanced"
estMinutes: 16
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

In a monorepo, a single root `vite.config.ts` holds shared `lint`, `fmt`, `staged`, and task config, with `overrides` for package-specific rules. `vp run` executes tasks across the workspace in **dependency order**, resolved from the normal `package.json` dependencies between workspace packages — not a separate task-runner graph.

## Why you'd care

Monorepo build times live or die by orchestration: building things in the right order, only where needed, and in parallel when safe. Vite+ builds this into `vp run` so you don't bolt on a separate task runner.

## Before

A dedicated pipeline tool with its own config describing the package graph, kept in sync by hand with your actual dependencies.

## After

The graph _is_ your `package.json` dependencies. `vp run` reads it directly.

## Do it yourself

### 1. Centralize config with overrides

```ts [vite.config.ts]
import { defineConfig } from "vite-plus";

export default defineConfig({
  lint: {
    plugins: ["typescript"],
    options: { typeAware: true, typeCheck: true },
    overrides: [
      { files: ["apps/web/**", "packages/ui/**"], plugins: ["typescript", "react"] },
      { files: ["apps/api/**"], env: { node: true }, rules: { "no-console": "off" } },
    ],
  },
});
```

Globs resolve from the root, so use workspace paths like `apps/web/**`.

### 2. Run across the workspace

```bash
vp run -r build              # every package, in dependency order
vp run -t @my/app#build      # @my/app and all its dependencies
vp run @my/app#build         # one package, targeted from anywhere
```

### 3. Filter (pnpm syntax)

```bash
vp run --filter "@my/*" build          # by glob
vp run --filter ./apps/web build       # by directory
vp run --filter "@my/app..." build     # app + its dependencies
vp run --filter "...@my/core" build    # core + its dependents
vp run --filter "@my/*" --filter "!@my/utils" build  # union, then exclude
```

Use `--fail-if-no-match` to abort when a filter matches nothing.

### 4. Control concurrency

```bash
vp run -r --concurrency-limit 8 build   # up to 8 at once (default 4)
vp run -r --parallel dev                # ignore order, run everything at once
vp run -r -v build                      # detailed execution summary
```

## Gotchas

- The dependency graph comes **only** from `package.json` `dependencies` between workspace packages. If a build order is wrong, your declared deps are wrong.
- A root script like `"build": "vp run -r build"` would recurse into itself — Vite+ detects and prunes that self-reference automatically.
- `--parallel` ignores dependency ordering entirely. Use it only for genuinely independent tasks (like `dev` servers), not ordered builds.
- Per-package Vite/framework config still lives in each package's own `vite.config.ts`; the root file is for shared lint/format/staged/tasks.

## Recap

One root config + `vp run` with `-r`, `-t`, `--filter`, and `--parallel` orchestrates a monorepo off your real dependency graph. Next: the cache that makes re-running all of this nearly free.
