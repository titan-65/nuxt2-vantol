---
title: "Testing with vp test"
description: "vp test is Vitest under the hood, reusing your Vite config and plugins. Configure it in vite.config.ts, run once or in watch mode, collect coverage, and understand how browser-mode providers are handled."
series: "vite-plus-intermediate"
order: 2
feature: "Vitest via vp test: watch, coverage, browser mode"
sourceUrl: "https://viteplus.dev/guide/test"
difficulty: "Intermediate"
estMinutes: 14
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

`vp test` runs [Vitest](https://vitest.dev/), reusing the same resolve and transform config as your app. You get Jest-style expectations, snapshots, coverage, and native ESM/TS/JSX — configured in the same `vite.config.ts` as everything else.

## Why you'd care

Tests share your app's Vite pipeline, so what runs in dev is what runs in tests. And because `vite-plus` bundles Vitest, a plain `vp install` is enough for node-mode tests — no separate `vitest` dependency to manage.

## Before

A separate `vitest.config.ts`, a `vitest` dependency to keep in sync with Vite, and `vitest` sitting in watch mode by default (surprising in CI).

## After

```bash
vp test              # run once and exit
vp test watch        # watch mode when you want it
vp test run --coverage
```

## Do it yourself

### 1. Configure tests in `vite.config.ts`

```ts [vite.config.ts]
import { defineConfig } from 'vite-plus'

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
  },
})
```

Vite+ recommends putting test config here rather than a separate `vitest.config.ts`.

### 2. Write a test — import from `vite-plus/test`

In a Vite+ project, pull test utilities from `vite-plus/test`, not `vitest`:

```ts [src/sum.test.ts]
import { describe, expect, it } from 'vite-plus/test'
import { sum } from './sum'

describe('sum', () => {
  it('adds', () => {
    expect(sum(2, 3)).toBe(5)
  })
})
```

### 3. Run it

```bash
vp test
```

### 4. Coverage

```bash
vp test run --coverage
```

## Gotchas

- **`vp test` runs once by default** — the opposite of raw Vitest. Use `vp test watch` for the interactive loop.
- **`vp test` ≠ `vp run test`.** `vp test` is the built-in Vitest command; `vp run test` runs a `test` *script* from `package.json`. (Next lesson makes this distinction concrete.)
- **Browser mode is partly opt-in.** The base browser runtime and preview provider ship with `vite-plus`, but the **Playwright** and **WebdriverIO** providers do not — install `@vitest/browser-playwright` (+ `playwright`) or `@vitest/browser-webdriverio` (+ `webdriverio`) yourself, pinned to the bundled Vitest version.
- Leave any `declare module 'vitest'` type augmentations pointing at `'vitest'` — `vite-plus/test` is a thin re-export, so augmentations must target the upstream module identity.

## Recap

`vp test` is Vitest wired into your Vite config, run-once by default. Configure it in the `test` block, import from `vite-plus/test`, add `watch` or `--coverage` as needed, and install browser providers explicitly. Next: how `vp run` fits your existing scripts.
