---
title: "Packaging with vp pack"
description: "vp pack builds libraries with tsdown — declaration files, multiple output formats, source maps, CSS bundling — configured in the pack block of vite.config.ts. Plus standalone executables via Node's Single Executable Applications."
series: "vite-plus-advanced"
order: 4
feature: "Libraries, DTS, formats, and standalone binaries"
sourceUrl: "https://viteplus.dev/guide/pack"
difficulty: "Advanced"
estMinutes: 15
img: "/vite_plus.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

`vp build` builds *apps*; `vp pack` builds *libraries and binaries*, powered by [tsdown](https://tsdown.dev/) (on Rolldown). Out of the box it handles declaration files, multiple output formats, source maps, minification, and CSS bundling — configured in the `pack` block of `vite.config.ts`.

## Why you'd care

Publishing a package well is fiddly: `.d.ts` generation, ESM + CJS outputs, correct `exports`, source maps. `vp pack` bakes those best practices in, so a publishable library is a config block rather than a bespoke build script.

## Before

A hand-rolled `tsdown.config.ts` (or Rollup config), plus `tsc` for types, plus manual `exports` wiring in `package.json`.

## After

One `pack` block, one command.

## Do it yourself

### 1. Configure packaging

Keep it all in `vite.config.ts` (Vite+ recommends *against* a separate `tsdown.config.ts`):

```ts [vite.config.ts]
import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    dts: true,
    format: ['esm', 'cjs'],
    sourcemap: true,
  },
})
```

### 2. Build the library

```bash
vp pack
vp pack src/index.ts --dts   # one-off entry + types
vp pack --watch              # rebuild on change
```

Output looks like:

```
ESM dist/index.js   4.8 kB
DTS dist/index.d.ts 1.2 kB
✓ Pack completed in 128ms
```

### 3. Ship a standalone executable

Bundle a CLI into a native binary that runs without a separate Node install:

```ts [vite.config.ts]
import { defineConfig } from 'vite-plus'

export default defineConfig({
  pack: {
    entry: ['src/cli.ts'],
    exe: true,
  },
})
```

This uses Node's [Single Executable Applications](https://nodejs.org/api/single-executable-applications.html) support.

## Gotchas

- **`vp build` vs `vp pack`:** apps use `vp build`; libraries and binaries use `vp pack`. Reaching for the wrong one is the classic mistake.
- **Executables need a recent runtime.** Node 25.7.0+ is required; if `vp pack --exe` reports an unsupported version, switch with `vp env use 26` (runtime control is the next lesson).
- Executable support and CSS bundling (CSS Modules + [Lightning CSS](https://lightningcss.dev/)) are **bundled into Vite+** — don't install `@tsdown/exe`, `@tsdown/css`, or `lightningcss` separately.
- Migrating an existing `tsdown.config.ts`? Move its options into `pack` and delete the file (see the Intermediate migration lesson).

## Recap

`vp pack` is the library/binary counterpart to `vp build`: tsdown-powered, configured in the `pack` block, with DTS, multi-format output, CSS bundling, and standalone executables built in. Next, the layer under everything — the Node runtime and supply chain.
