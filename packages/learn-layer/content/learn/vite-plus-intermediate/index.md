---
title: "Vite+ Intermediate"
description: "Past the daily loop: understand the tools behind vp check and vp test, learn how vp run relates to your package.json scripts, bring an existing Vite project onto Vite+ with vp migrate, and wire up commit hooks."
series: "vite-plus-intermediate"
releaseDate: 2026-07-19
sourceUrl: "https://viteplus.dev/guide/"
difficulty: "Intermediate"
estMinutes: 70
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

You can now install `vp`, scaffold a project, and run the everyday loop. This series is about _understanding_ that loop and adopting it on real work — the tools underneath `vp check` and `vp test`, the difference between built-in commands and your own scripts, and how to migrate a project that already exists.

::BlogAlert{type="warning"}
Vite+ is in **public beta**. Commands here are the stable, documented surface. Note `vp --version` for reproducibility; details may shift as the beta evolves.
::

## Prerequisites

You've done the [Beginner series](/learn/vite-plus-beginner) (or you're comfortable with `vp create`, `vp install`, `vp dev`, `vp check`, `vp test`, `vp build`).

## What we cover

1. **`vp check` Deep Dive** — Oxlint + Oxfmt + tsgo, `--fix`, type-aware linting.
2. **Testing with `vp test`** — Vitest config, watch, coverage, browser mode.
3. **`vp run` & Vite Task** — built-in commands vs `package.json` scripts.
4. **Migrating an Existing Project** — `vp migrate` and its rewrites.
5. **Commit Hooks & Staged Checks** — `vp config` and `vp staged`.

## How this series works

Same path each step: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.** Progress saves in your browser. Start with step one.
