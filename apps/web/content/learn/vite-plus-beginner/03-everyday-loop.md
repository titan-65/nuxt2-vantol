---
title: "The Everyday Loop"
description: "The four commands you'll run every day: vp dev to develop, vp check to format/lint/type-check, vp test to run tests, and vp build for production. One consistent flow across any project."
series: "vite-plus-beginner"
order: 3
feature: "vp dev / check / test / build"
sourceUrl: "https://viteplus.dev/guide/check"
difficulty: "Beginner"
estMinutes: 12
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Four built-in commands cover the whole local development cycle:

| Command | What it does |
| --- | --- |
| `vp dev` | Start the Vite dev server with instant HMR |
| `vp check` | Format, lint, **and** type-check in one pass |
| `vp test` | Run tests once (Vitest) |
| `vp build` | Produce a production build |

## Why you'd care

These are the same four commands in *every* Vite+ project. Move between repos and teams and you already know the loop — no reading each project's `package.json` scripts to figure out what "the test command" is this time.

## Before

Different projects, different script names: `dev` vs `start`, `lint` split from `format`, `typecheck` sometimes missing. You memorize each repo's dialect.

## After

One vocabulary everywhere.

## Do it yourself

In the project from the last lesson:

### 1. Develop

```bash
vp dev
```

Leave it running while you edit. Stop it with `Ctrl+C` when you move on.

### 2. Check (the star of the loop)

```bash
vp check
```

This runs **three tools together** — Oxfmt (format), Oxlint (lint), and TypeScript type checks — and it's faster than running them separately. Let it auto-fix what it can:

```bash
vp check --fix
```

A clean run looks like:

```
pass: All 42 files are correctly formatted (88ms, 16 threads)
pass: Found no warnings, lint errors, or type errors in 42 files (184ms, 16 threads)
```

### 3. Test

```bash
vp test
```

::BlogAlert{type="info"}
Unlike raw Vitest, `vp test` does **not** stay in watch mode by default — it runs once and exits (great for CI and quick checks). Want watch mode? Run `vp test watch`.
::

### 4. Build

```bash
vp build
vp preview   # serve the production build locally to sanity-check it
```

## Gotchas

- `vp check` is your validation loop — prefer it over calling `vp fmt` and `vp lint` separately. It's designed to be the one command.
- Type checking inside `vp check` depends on `typeCheck` being enabled in `vite.config.ts`. Projects made with `vp create` turn this on for you; older/migrated projects may need it flipped on (covered in the Intermediate series).
- `vp build` builds **apps**. Building a *library* is a different command (`vp pack`) — that's an Advanced-series topic.

## Recap

`vp dev` to build, `vp check` to keep it clean, `vp test` to verify, `vp build` to ship. Same four commands in every Vite+ project. Next: adding and removing dependencies the Vite+ way.
