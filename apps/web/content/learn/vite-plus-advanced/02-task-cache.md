---
title: "The Task Cache"
description: "How Vite Task decides a cache hit: arguments, fingerprinted env vars, and tracked input files. Automatic data tracking, manual input/output rules, environment fingerprinting, content-based cache sharing, and vp cache clean."
series: "vite-plus-advanced"
order: 2
feature: "Automatic data tracking & cache fingerprints"
sourceUrl: "https://viteplus.dev/guide/cache"
difficulty: "Advanced"
estMinutes: 16
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

When a cached task exits 0, Vite Task saves its terminal output **and** the files it wrote. On the next run it checks three things — arguments, fingerprinted env vars, and input files — and if all match, it replays the saved output and restores the files instead of running the command.

## Why you'd care

Understanding *why* a task is a hit or a miss is the difference between a cache that saves you minutes and one you don't trust. At scale, correct caching is your biggest lever on build and CI time.

## Before

Ad-hoc caching: manually listing inputs and outputs for a pipeline tool, and debugging "why did this rebuild?" with print statements.

## After

Vite Task tracks what each task reads and writes automatically, and tells you exactly why a miss happened:

```
$ vp lint ✗ cache miss: 'src/utils.ts' modified, executing
$ vp build ✗ cache miss: env 'VITE_GREETING' changed, executing
$ vp test ✗ cache miss: args changed, executing
```

## Do it yourself

### 1. Know the resolution order

Cache behavior is decided in this order (first match wins):

1. **Per-task `cache: false`** — never cached; cannot be overridden by any flag.
2. **CLI flag** — `--no-cache` / `--cache` override config for that run.
3. **Workspace config** — `run.cache.tasks` (default `true`), `run.cache.scripts` (default `false`).

Tasks (from `vite.config.ts`) are cached by default; scripts (from `package.json`) are not.

### 2. Let automatic tracking work

Two tiers:

- **File-system tracking** records file reads, missing-file probes, directory listings, and written outputs for every cache-enabled task.
- **Cooperative tracking** lets a tool report metadata tracking can't infer — Vite+ supports this for `vp build` today.

### 3. Add manual rules when needed

```ts [vite.config.ts]
tasks: {
  build: {
    command: 'node build.mjs',
    input: [{ auto: true }, '!dist/**'], // what invalidates the cache
    output: ['dist/**'],                 // what to restore on a hit
  },
}
```

### 4. Fingerprint environment variables

Tasks run in a **clean environment** — only `PATH`, `HOME`, `CI`, and a few others pass through. To make a var part of the cache key:

```ts [vite.config.ts]
tasks: {
  build: { command: 'webpack --mode production', env: ['NODE_ENV'] },
}
```

Use `untrackedEnv` for vars the task needs but that shouldn't bust the cache (like `CI`).

### 5. Clear it

```bash
vp cache clean   # deletes node_modules/.vite/task-cache
```

## Gotchas

- **Cache is content-based.** Two tasks running the same command with the same inputs share one entry — so `vp lint` in a `check` script is an instant hit if `release` already ran it.
- Env vars are invisible to tasks unless passed via `env`/`untrackedEnv` — a task that silently relied on an ambient var will behave differently under caching. This is a feature (reproducibility), but it surprises people.
- `cache: false` on a task can't be overridden by `--cache`. It's the hard opt-out for genuinely non-deterministic steps (deploys).

## Recap

A hit needs matching args, fingerprinted env, and tracked inputs; automatic tracking handles most of it, `input`/`output`/`env` handle the rest, and the cache is content-shared. Next: pushing this cache and the whole toolchain into CI and Docker.
