---
title: "Nuxt Layers: The Basics"
description: "A layer is a Nuxt app you can inherit from. Three steps to the mental model — what extends actually does, a first layer you can see working, and the precedence rules that decide who wins."
series: "nuxt-layers-core"
nuxtVersion: "4.x"
releaseDate: 2026-07-28
sourceUrl: "https://nuxt.com/docs/4.x/getting-started/layers"
difficulty: "Beginner"
estMinutes: 26
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

This site had a problem. It started as a blog. Then it grew a learning platform — tutorials, step pages, progress tracking, an RSS feed of its own — and both halves ended up in the same `app/` directory, fighting for the same folders.

Two products, one Nuxt app. That's the situation layers exist for.

A **layer** is a Nuxt application you inherit from. Not a plugin, not a module — an ordinary Nuxt directory structure with a `nuxt.config.ts`, that another Nuxt app can pull in wholesale with one config line. Pages, components, composables, server routes, content: all of it merges into the consuming app as if you'd written it there.

::BlogAlert{type="info"}
This series targets **Nuxt 4.x**. Everything here is running on the page you're reading — `/learn` is served by a layer, `/blog` is not. The capstone is the commit that split them.
::

## What we cover here

1. **What a Layer Actually Is** — `extends`, the auto-scanned `layers/` directory, and where layers sit next to modules.
2. **Your First Layer** — a real one, in about four files, that you can watch take effect.
3. **Precedence and Overrides** — who wins when two layers define the same file, and how to override one file without forking a layer.

By the end you can take any folder of shared Nuxt code and make it inheritable.

## Where it goes next

- **[Nuxt Layers: Going Further](/learn/nuxt-layers-intermediate)** — _Intermediate._ Layers as workspace packages, what a layer can own, and the relative-path trap.
- **[Nuxt Layers: Advanced](/learn/nuxt-layers-advanced)** — _Advanced._ Remote layers, layer-vs-module, testing and publishing.
- **[Nuxt Layers Capstone: Splitting This Blog](/learn/nuxt-layers-capstone)** — _Advanced._ The real migration, on this codebase, deployed.

## How this series works

Each step follows the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**

Every snippet is from `packages/learn-layer` in this repo — the layer serving this page.
