---
title: "vp run & Vite Task"
description: "vp run executes package.json scripts and tasks defined in vite.config.ts, with caching and dependency ordering built in. Understand built-in commands vs your own scripts, and when to define a task instead of a script."
series: "vite-plus-intermediate"
order: 3
feature: "Scripts vs built-ins, vpr, and cached tasks"
sourceUrl: "https://viteplus.dev/guide/run"
difficulty: "Intermediate"
estMinutes: 15
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Vite+ has **built-in commands** (`vp dev`, `vp build`, `vp test`, `vp check`…) that always run the Vite+ tool. To run a `package.json` **script**, you use `vp run <script>` (shorthand: `vpr <script>`). `vp run` works like `pnpm run`, but adds optional caching and dependency-aware ordering via Vite Task.

## Why you'd care

This is the single most common source of confusion when adopting Vite+: `vp test` and `vp run test` are **not the same thing**. Getting the mental model right saves you a lot of "why is my script not running?".

## Before

`npm run <anything>` ran a `package.json` script, full stop. Some of those script names (`build`, `test`, `dev`) now collide with Vite+ built-ins.

## After

```text
You type a command
  │
  ├─ built-in name? (dev / build / test / check …)
  │     └─ vp build      → runs the Vite+ built-in tool
  │
  └─ vp run build        → runs the "build" SCRIPT in package.json
```

## Do it yourself

### 1. Run an existing script

Given:

```json [package.json]
{
  "scripts": {
    "dev:setup": "node scripts/seed.js",
    "build": "node compile-legacy-app.js"
  }
}
```

Run them explicitly as scripts:

```bash
vp run dev:setup
vp run build      # the SCRIPT, not the Vite+ builder
vpr build         # same thing, shorthand
```

Run `vp run` with no name for an interactive task picker.

### 2. Cache a script run

Scripts aren't cached by default. Opt in:

```bash
vp run --cache build
```

Run it again with nothing changed and the output replays instantly from cache.

### 3. Promote a script to a task

Define tasks in `vite.config.ts` to get caching by default, dependency ordering, and input/env control:

```ts [vite.config.ts]
import { defineConfig } from "vite-plus";

export default defineConfig({
  run: {
    tasks: {
      build: {
        command: "vp build",
        dependsOn: ["lint"],
        env: ["NODE_ENV"],
      },
      deploy: {
        command: "deploy-script --prod",
        cache: false,
        dependsOn: ["build", "test"],
      },
    },
  },
});
```

Now `vp run deploy` runs `build` and `test` first, in order.

## Gotchas

- **`vp build` vs `vp run build`:** the first is the built-in Vite+ builder; the second is your `package.json` script named `build`. Same for `test`, `dev`, etc.
- A task name can live in **either** `vite.config.ts` **or** `package.json`, not both.
- **Tasks are cached by default; scripts are not.** Use `--cache` for a one-off, or define a task for permanent caching.
- Commands joined with `&&` are split into independently cached sub-tasks — so `"ci": "vp run lint && vp run test && vp run build"` caches each stage separately.

## Recap

Built-ins run the Vite+ tool; `vp run <name>` (or `vpr`) runs your scripts. Add `--cache` for speed, or define tasks in `vite.config.ts` for cached, ordered execution. Next: bringing an existing project onto all of this with `vp migrate`.
