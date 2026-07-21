---
title: "What Is Vite+?"
description: "Vite+ is a unified toolchain: one global CLI (vp) that wraps Vite, Vitest, Oxlint, Oxfmt, Rolldown, tsdown, and a task runner, plus a local vite-plus package per project. Here's the mental model."
series: "vite-plus-beginner"
order: 1
feature: "The vp + vite-plus mental model"
sourceUrl: "https://viteplus.dev/guide/"
difficulty: "Beginner"
estMinutes: 10
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Vite+ is a **unified toolchain and single entry point** for web development. Instead of learning a different tool for each job, you learn one command: `vp`. Under the hood it combines tools you may already know:

| Job | Tool Vite+ wraps |
| --- | --- |
| Dev server & app build | [Vite](https://vite.dev/) + [Rolldown](https://rolldown.rs/) |
| Testing | [Vitest](https://vitest.dev/) |
| Linting | [Oxlint](https://oxc.rs/) |
| Formatting | [Oxfmt](https://oxc.rs/) |
| Library packaging | [tsdown](https://tsdown.dev/) |
| Task running & caching | [Vite Task](https://github.com/voidzero-dev/vite-task) |
| Runtime & package manager | Node.js + pnpm/npm/yarn/bun |

It ships in **two parts**:

- **`vp`** — the *global* command-line tool you install once on your machine.
- **`vite-plus`** — a *local* package installed into each project (it carries the actual Vite, Vitest, and friends).

## Why you'd care

One tool means one thing to learn, one place for config (`vite.config.ts`), and one upgrade story. You stop wiring five tools together and stop arguing about which lint config goes where. It's also friendlier to AI coding agents, because there's a single predictable command surface.

## Before

A typical project today: `package.json` scripts calling `vite`, `vitest`, `eslint`, `prettier`; a `.nvmrc` for Node; a lockfile for one specific package manager; separate config files for each tool. Nothing is *wrong* — it's just a lot of moving parts.

```bash
npm run dev      # vite
npm run test     # vitest
npm run lint     # eslint
npm run format   # prettier
```

## After

The same jobs, one CLI:

```bash
vp dev     # dev server
vp test    # tests
vp check   # format + lint + type-check, together
vp build   # production build
```

## Do it yourself

No install yet — that's the next lesson. For now, just internalize the split:

```text
vp  (global CLI)                     ← you type commands here
 │
 ├─ reads ──────────► vite.config.ts (one config for everything)
 │
 └─ delegates to ───► vite-plus (local package, ships in your repo)
                        ├─ Vite / Rolldown   (dev + build)
                        ├─ Vitest            (test)
                        ├─ Oxlint / Oxfmt    (lint + format)
                        ├─ tsdown            (pack)
                        └─ Vite Task         (run + cache)
```

The global `vp` is the steering wheel; the local `vite-plus` is the engine that ships in your repo.

## Gotchas

- Vite+ is **not** the same as Vite. Vite is one of the tools *inside* it. `vp dev` and `vp build` invoke Vite; the rest is extra.
- `vp` commands are **built-in and fixed** — `vp build` always runs the Vite+ builder, never a `package.json` script named `build`. (We'll cover how to run your own scripts in the Intermediate series.)
- It's beta: expect the surface to grow. The global `vp` isn't an npm package you pin — it's a curl-installed binary with its own version. The local `vite-plus` package *is* versioned normally, but in beta you generally track the toolchain (`vp --version`) rather than hand-pinning.

## Recap

Vite+ = one CLI (`vp`, global) + one package (`vite-plus`, local) that together wrap Vite, Vitest, Oxlint, Oxfmt, tsdown, and a task runner. Next: install `vp` and scaffold a real project.
