---
title: "Quick Hits & What to Watch"
description: "The rest of Nuxt 4.4 worth knowing — vue-router v5, useState reset, better import protection, build profiling — plus the performance wins under the hood."
series: "nuxt-4-4"
order: 6
feature: "Round-up: router, DX, tooling, perf"
sourcePRs: ["https://github.com/nuxt/nuxt/releases/tag/v4.4.0"]
---

The rest of Nuxt 4.4 in quick-hit form — enough to recognize each change and reach for it when it matters.

## Vue Router v5

Nuxt now runs on [vue-router v5](https://github.com/vuejs/router), the first major router upgrade since Nuxt 3. It removes the dependency on `unplugin-vue-router` — if you used that directly, you can drop it. For most apps the upgrade is transparent. Typed routes leaving experimental status is the next step. 👀

## useState reset to default

`useState` and `clearNuxtState` can now reset to the **initial value** instead of clearing to `undefined`, matching `useAsyncData`:

```ts
const count = useState("counter", () => 0);
count.value = 42;

clearNuxtState("counter"); // resets to 0, not undefined
```

Much saner for state you always expect to have a value.

## Better import protection

When server-only code leaks into your client bundle, the error now shows a full **trace** of the import chain, the exact line, and actionable suggestions — inspired by TanStack Start. Debugging accidental server imports goes from guesswork to a clear map.

## View transition types

Experimental view transitions now support [transition **types**](https://developer.chrome.com/blog/view-transitions-update-io24#view-transition-types), so you can style forwards vs. backwards navigation, tabs vs. pages, and so on differently.

## Normalised page component names (experimental)

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  experimental: {
    normalizeComponentNames: true,
  },
});
```

Makes page component names match route names — nicer devtools and debugging.

## Build profiling

Find out where your build time actually goes:

```bash
nuxt build --profile
```

You get a per-phase/module/plugin breakdown plus three artifacts: a Chrome trace (`.nuxt/perf-trace.json`), a JSON report (`.nuxt/perf-report.json`), and a CPU profile (`nuxt-build.cpuprofile`). Use `--profile=verbose` for console timing detail.

## Performance under the hood

- **14,000x faster module ID parsing** — a regex chain replaced with `indexOf` + slice.
- **Faster dev via `unrouting`** — file-system route generation now uses a trie; dev changes up to **28x faster** when not adding/removing pages, and route generation is deterministic (no longer sensitive to file ordering).
- NuxtLink visibility prefetching disabled in dev to stop unnecessary Vite reloads.

::BlogAlert{type="info"}
Several 4.4 items (`payloadExtraction: 'client'`, typed routes) point straight at `compatibilityVersion: 5`. Skimming the [upgrade guide](https://nuxt.com/docs/getting-started/upgrade) now makes the v5 jump smaller later.
::

## Recap

That's Nuxt 4.4. The headline steps (1–5) change how you fetch data, configure layouts, handle accessibility, cache payloads, and manage sessions; these quick hits modernize the router and sharpen the tooling. On to the next release.
