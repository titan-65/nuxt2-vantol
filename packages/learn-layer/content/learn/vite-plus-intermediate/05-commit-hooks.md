---
title: "Commit Hooks & Staged Checks"
description: "Set up Git commit hooks with vp config and run checks on staged files with vp staged — no Husky or lint-staged needed. Your staged-file rules live in the same vite.config.ts as everything else."
series: "vite-plus-intermediate"
order: 5
feature: "vp config + vp staged"
sourceUrl: "https://viteplus.dev/guide/commit-hooks"
difficulty: "Intermediate"
estMinutes: 12
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Vite+ has built-in commit hooks. `vp config` installs the Git hooks and hook directory; `vp staged` runs checks against the files currently staged for commit, using a `staged` block in `vite.config.ts`. No Husky, no lint-staged.

## Why you'd care

Fast, staged-only checks at commit time catch problems before they land, and keeping the rules in `vite.config.ts` means your hook config lives beside your lint, format, test, and task config — one file, one source of truth.

## Before

Husky writing shell scripts under `.husky/`, plus a separate `.lintstagedrc` and a `lint-staged` dependency to keep updated.

## After

Hooks managed by `vp`, staged rules in `vite.config.ts`.

## Do it yourself

### 1. Install hooks

```bash
vp config
```

By default hooks are written to `.vite-hooks`. Useful flags:

```bash
vp config --hooks-dir .vite-hooks
vp config --no-hooks    # leave existing Git hooks alone
vp config --no-agent    # skip coding-agent instruction files
```

(If you used `vp create` or `vp migrate`, you were already prompted to set this up.)

### 2. Define staged-file checks

```ts [vite.config.ts]
import { defineConfig } from "vite-plus";

export default defineConfig({
  staged: {
    "*.{js,ts,tsx,vue,svelte}": "vp check --fix",
  },
});
```

### 3. See it run

```bash
vp staged            # run staged checks manually
vp staged --verbose
```

Once hooks are installed, `vp staged` runs automatically on `git commit`.

## Gotchas

- Only the **`staged` block format** is supported. Non-JSON `.lintstagedrc` and `lint-staged.config.*` files are **not** migrated automatically — port them into `staged`.
- Disable hook installation from lifecycle scripts (`prepare`/`postinstall`) with `VITE_GIT_HOOKS=0` — handy in CI where you don't want hooks installed.
- Remember the `vp check` config interaction from lesson 1: if you disabled a step (say `fmt: false`) in the `check` block, a `vp check` in your staged rules skips it too.
- Migrating from `lefthook`/`simple-git-hooks`/`yorkie`? Move commands into `staged`, point your lifecycle script at `vp config`, and create `.vite-hooks/pre-commit` running `vp staged` — then remove the old tool.

## Recap

`vp config` installs hooks; `vp staged` runs staged-file checks from the `staged` block in `vite.config.ts` — replacing Husky + lint-staged. That closes the Intermediate series: you understand `vp check` and `vp test`, the script-vs-built-in split, migration, and hooks. The **Advanced** series scales this up — monorepos, cache internals, CI/Docker, library packaging, and runtime control.
