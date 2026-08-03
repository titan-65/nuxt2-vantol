---
title: "Nuxt Layers Capstone: Splitting This Blog"
description: "One site that had quietly become two products, separated into a host app and a layer — pages, content collection, composable and RSS feed moved, then deployed. Every path in this capstone is a real path in this repo."
series: "nuxt-layers-capstone"
nuxtVersion: "4.x"
releaseDate: 2026-07-28
sourceUrl: "https://nuxt.com/docs/4.x/getting-started/layers"
difficulty: "Advanced"
estMinutes: 24
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

vantolbennett.com started as a blog. Then it grew tutorials, then step pages with progress tracking, then a content collection with its own schema, then its own RSS feed. At some point it stopped being a blog with a tutorials section and became two products sharing a `nuxt.config.ts`.

This capstone is the commit that separated them: **`packages/learn-layer` now owns everything under `/learn`, and `apps/web` is a blog again.** The page you're reading is served by that layer.

::BlogAlert{type="info"}
Nothing here is a toy. The file paths, the config diffs, the numbers Nuxt Content printed, and the deploy notes are from the migration itself. You can clone the repo and read the result.
::

## What we cover here

1. **The Split** — what moved, in what order, and the one boundary check that decides whether a split is real.
2. **Ship It** — build, deploy, and the four things that only break in production.

## What "done" looks like

```ts
// apps/web/nuxt.config.ts
export default defineNuxtConfig({
  // The whole /learn platform lives in this layer. See packages/learn-layer.
  extends: ["@vvantol2000/learn-layer"],
  modules: [
    "@nuxt/content",
    "@nuxtjs/tailwindcss",
    "@nuxt/image",
    "shadcn-nuxt",
    "nuxt-presence",
    "nuxt-assistant",
  ],
});
```

Comment out that one line and the entire learning platform — three routes, ninety-odd markdown files, an RSS feed and a content collection — leaves the site cleanly, and the blog still builds.

## How this series works

Each step follows the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**

Prerequisites: **[The Basics](/learn/nuxt-layers-core)**, **[Going Further](/learn/nuxt-layers-intermediate)**, **[Advanced](/learn/nuxt-layers-advanced)**.
