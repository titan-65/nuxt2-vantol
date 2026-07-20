---
title: "Quick Hits & What to Watch"
description: "The smaller 4.3 wins worth knowing — dev-mode payloads, disabling layer modules, the draggable error overlay — plus the deprecations to get ahead of."
series: "nuxt-4-3"
order: 6
feature: "Round-up: DX, layers, deprecations"
sourcePRs: ["https://github.com/nuxt/nuxt/releases/tag/v4.3.0"]
---

Not every feature needs a full tutorial. Here are the rest of Nuxt 4.3's changes worth knowing, in quick-hit form — enough to recognize them and reach for them later.

## Dev-mode payload extraction

Payload extraction (step 2) now also works in **development**, so you can test and debug payload behavior without a production build.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  nitro: { static: true }
})
```

It also kicks in for individual pages with `isr`, `swr`, `prerender`, or `cache` route rules. Handy for verifying the caching work from step 2 without `nuxt build`.

## Disable modules from layers

Extending a layer but don't want one of its modules? Pass `false`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  extends: ['../shared-layer'],
  image: false // drop @nuxt/image from the layer
})
```

## Draggable error overlay

The dev error overlay is now draggable and minimizable — snap it to any corner, shrink it to a pill while you fix things, and it remembers where you left it across reloads. Nothing to configure; just nicer.

## Async plugin constructors

Module authors can now use async functions when adding build plugins, enabling true lazy loading:

```ts [modules/my-module.ts]
export default defineNuxtModule({
  async setup() {
    addVitePlugin(() => import('my-cool-plugin').then(r => r.default()))
  }
})
```

## Deprecations to get ahead of

In preparation for Nitro v3 and H3 v2, `createError` is moving to Web API naming:

```ts
// old (still works, deprecated)
throw createError({ statusCode: 404, statusMessage: 'Not Found' })

// new
throw createError({ status: 404, statusText: 'Not Found' })
```

::BlogAlert{type="warning"}
The old properties still work in 4.3, but updating now saves you a migration later when v5 lands.
::

## Recap

That's Nuxt 4.3. The headline features (steps 1–5) change how you structure layouts, caching, and server imports; these quick hits smooth the edges and point toward v5. Keep an eye on the [upgrade guide](https://nuxt.com/docs/getting-started/upgrade) as `future.compatibilityVersion: 5` becomes available.

You made it through the series — nice work. On to the next release.
