---
title: "Install vp & Create a Project"
description: "Install the global vp binary, then scaffold a fresh project with vp create and start it with vp install and vp dev. From empty folder to running app."
series: "vite-plus-beginner"
order: 2
feature: "vp create, vp install, vp dev"
sourceUrl: "https://viteplus.dev/guide/create"
difficulty: "Beginner"
estMinutes: 14
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

`vp` installs with a single script. Once it's on your `PATH`, `vp create` scaffolds a new app (interactively or from a template), `vp install` pulls dependencies, and `vp dev` starts the Vite dev server.

## Why you'd care

This is the "hello world" of Vite+. Getting a project running end-to-end proves your install works and gives you a playground for every later lesson.

## Before

You have an empty folder and no `vp`.

## After

A scaffolded project, dependencies installed, dev server running in your browser — all through `vp`.

## Do it yourself

### 1. Install `vp` globally

**macOS / Linux:**

```bash
curl -fsSL https://vite.plus | bash
```

**Windows (PowerShell):**

```powershell
irm https://vite.plus/ps1 | iex
```

Open a **new** terminal, then confirm it worked:

```bash
vp help
vp --version
```

::BlogAlert{type="info"}
On install, Vite+ turns on **managed mode** — it will manage your global Node.js runtime and package manager. If you'd rather opt out, run `vp env off`. If Vite+ isn't for you, `vp implode` removes it. (More on `vp env` in the Advanced series.)
::

### 2. Create a project

```bash
vp create
```

The interactive picker walks you through it. To skip the prompts, pass a template directly — for a plain Vite app:

```bash
vp create vite -- --template react-ts
```

`vp create` can also make monorepos and libraries (`vite:monorepo`, `vite:library`), use community shorthands (`svelte`, `vue`, `nuxt`, `@tanstack/start`), or pull remote templates (`github:user/repo`). Run `vp create --list` to see them.

### 3. Install dependencies

```bash
cd my-app
vp install
```

`vp install` uses whatever package manager the project declares (via `packageManager` in `package.json` or a lockfile). You don't call pnpm/npm/yarn directly.

### 4. Start the dev server

```bash
vp dev
```

Open the URL it prints (usually `http://localhost:5173`). Edit a file and watch Hot Module Replacement update the page instantly.

## Gotchas

- **Open a new shell after installing.** The installer edits your shell profile; the current session won't see `vp` until you reload.
- On **Alpine Linux (musl)** you need `apk add libstdc++` first — the managed Node build depends on the GNU C++ standard library.
- `vp create` may pause to ask about **dependency build scripts** (for native deps like `better-sqlite3`). That's a security feature, not an error — approve the ones you trust.
- Don't run `pnpm install` / `npm install` directly in a Vite+ project. Use `vp install` so the right package manager and Node version are used.

## Recap

`curl … | bash` installs `vp`. Then `vp create` → `vp install` → `vp dev` takes you from empty folder to running app. Keep this project — the next lesson runs the daily loop against it.
