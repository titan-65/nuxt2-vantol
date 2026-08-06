---
title: "Vite+ for Beginners"
description: "Vite+ is one CLI for your runtime, package manager, and frontend toolchain. This first series takes you from nothing installed to a running project on the everyday command loop — one small step at a time."
series: "vite-plus-beginner"
releaseDate: 2026-07-19
sourceUrl: "https://viteplus.dev/guide/"
difficulty: "Beginner"
estMinutes: 48
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

Here's the honest setup: modern web tooling is a pile of separate tools. Vite for dev and build, Vitest for tests, ESLint or Oxlint for linting, Prettier or Oxfmt for formatting, plus a package manager and a Node version manager on top. Each has its own config, its own commands, its own upgrade cadence. **Vite+** is a bet that you can put all of that behind one CLI called `vp`.

So this series is me learning `vp` from zero, and you're coming with me. We don't assume you've touched Vite+ before — only that you've built a web project at some point and know what `npm install` does.

::BlogAlert{type="warning"}
Vite+ is in **public beta**. The global `vp` is a binary you install with a script, not an npm dependency you pin; the local `vite-plus` package is versioned normally, but in beta you generally track the toolchain rather than hand-pinning versions. For reproducibility, note the output of `vp --version` and treat commands as accurate for that build. The commands in this series are the stable, documented ones.
::

## What we cover

1. **What Is Vite+?** — the `vp` (global) + `vite-plus` (local) mental model.
2. **Install `vp` & Create a Project** — from empty folder to running app.
3. **The Everyday Loop** — `vp dev`, `vp check`, `vp test`, `vp build`.
4. **Managing Dependencies** — `vp add` / `remove` / `update` over your package manager.

## How this series works

Each step takes one idea through the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**

Mark each step complete as you go — your progress is saved in your browser. Ready? Start with step one.
