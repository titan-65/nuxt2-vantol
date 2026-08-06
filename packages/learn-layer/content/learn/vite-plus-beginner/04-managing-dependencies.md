---
title: "Managing Dependencies"
description: "Add, remove, and update packages through vp — which detects and wraps your project's package manager (pnpm, npm, yarn, or bun) so you use one command set regardless of which one the repo uses."
series: "vite-plus-beginner"
order: 4
feature: "vp add / remove / update over any package manager"
sourceUrl: "https://viteplus.dev/guide/install"
difficulty: "Beginner"
estMinutes: 12
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Vite+ wraps dependency management too. `vp add`, `vp remove`, `vp update`, and friends run through whichever package manager the project uses — Vite+ detects it from the `packageManager` field or the lockfile. You type the same commands whether the repo is on pnpm, npm, yarn, or bun.

## Why you'd care

You stop context-switching between `pnpm add`, `npm install --save`, and `yarn add`. One muscle memory works across every project, and Vite+ makes sure the _right_ package manager (and Node version) is used each time.

## Before

```bash
# depends on the repo…
pnpm add lodash
npm install lodash
yarn add lodash
```

## After

```bash
vp add lodash    # works the same everywhere
```

## Do it yourself

In your project:

### 1. Add packages

```bash
vp add zod                 # runtime dependency
vp add -D vitest-fetch-mock  # dev dependency
```

### 2. Remove a package

```bash
vp remove zod
```

(`vp rm`, `vp un`, and `vp uninstall` are aliases.)

### 3. Keep things fresh

```bash
vp outdated   # what's behind
vp update     # bump to latest allowed by your ranges
vp dedupe     # flatten duplicate versions
```

### 4. Understand your tree

```bash
vp list          # installed packages
vp why zod       # why is this package here?
vp info zod      # registry metadata for a package
```

### 5. Escape hatch

Anything Vite+ doesn't wrap directly, forward straight to the package manager:

```bash
vp pm <command>
```

## Gotchas

- **Don't mix tools.** Running `npm install` in a pnpm project can corrupt the lockfile. Let `vp` pick the package manager so you never guess.
- `vp add` respects the project's declared `packageManager`. If a repo pins `pnpm@10`, `vp add` uses exactly that.
- The full alias set: `vp remove` = `rm`/`un`/`uninstall`; `vp update` = `up`; `vp list` = `ls`; `vp why` = `explain`; `vp info` = `view`/`show`. Use whichever sticks.

## Recap

`vp add` / `remove` / `update` (plus `outdated`, `dedupe`, `list`, `why`, `info`) give you one dependency workflow over any package manager, with `vp pm` as the escape hatch. That wraps the Beginner series — you can now install Vite+, scaffold a project, run the daily loop, and manage packages. The **Intermediate** series goes under the hood of `vp check` and `vp test`, and shows how to bring an existing project onto Vite+.
