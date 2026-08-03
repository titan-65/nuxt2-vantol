---
title: "Layer or Module?"
description: "Both ship reusable Nuxt code, so either usually 'works'. The rule that decides it: does your feature need to make a decision at build time? Plus the packages that are honestly both."
series: "nuxt-layers-advanced"
order: 2
feature: "the decision rule, and layer + module in one package"
sourceUrl: "https://nuxt.com/docs/4.x/guide/going-further/modules"
difficulty: "Advanced"
estMinutes: 11
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

A **module** is a function Nuxt calls at startup. It receives options and the Nuxt instance and edits the app programmatically.

A **layer** is a directory Nuxt merges into the app. It edits nothing; it _is_ more app.

|                             | Layer                                   | Module                                     |
| --------------------------- | --------------------------------------- | ------------------------------------------ |
| Shape                       | directories + `nuxt.config.ts`          | a function (`defineNuxtModule`)            |
| Runs                        | never — it's merged                     | once, at build time, in Node               |
| Configurable                | via `app.config` / `runtimeConfig` only | typed options with defaults and validation |
| Conditional                 | no                                      | yes — `if (!options.enabled) return`       |
| Can generate code           | no                                      | yes — templates, virtual files             |
| Overridable by the consumer | yes, file by file                       | only where you allow it                    |
| Discoverable                | in `_layers`                            | in `modules`                               |

The decision rule fits in one line: **if your feature needs to make a decision at build time, it's a module. If it's just files, it's a layer.**

Applied:

- A shared header, theme tokens, and three composables → **layer**. Nothing decides anything.
- A feature that registers different server routes depending on an option, or reads env at build time, or generates a typed file → **module**. This site's `nuxt-presence` signs a build-time token with `node:crypto`; there is no version of that which is "just files".
- A preset that fixes TypeScript, ESLint and app config for every new app → **layer**.
- Something that must _guarantee_ behaviour the consumer can't quietly shadow → **module**. A layer is a suggestion; any file in it can be overridden by a matching path in the app.

That last row is the one people miss. Layers are overridable by design, which is a feature until it's a compliance requirement.

## Why you'd care

Choosing wrong is recoverable but tedious — and the two wrong choices fail differently.

**Layer that should have been a module:** you start faking configuration. An `app.config` flag read by a plugin that early-returns. A component that renders nothing when a token is missing. You're doing conditional logic at runtime that a module would have done once at build time, and shipping the disabled code to the browser either way.

**Module that should have been a layer:** you start faking files. `addComponent` calls listing twelve components by hand. A `setup()` that's forty lines of registration and no logic. Every one of those is a file a layer would have picked up for free, and you now maintain the list.

If your `setup()` contains only `addComponent`/`addImports`/`addPlugin` calls and no branching — that's a layer wearing a module costume.

## Before

A "module" that is really a directory:

```ts
// modules/design-system/index.ts
export default defineNuxtModule({
  meta: { name: "design-system" },
  setup() {
    const { resolve } = createResolver(import.meta.url);
    addComponent({ name: "DsButton", filePath: resolve("./components/DsButton.vue") });
    addComponent({ name: "DsCard", filePath: resolve("./components/DsCard.vue") });
    addComponent({ name: "DsModal", filePath: resolve("./components/DsModal.vue") });
    addImports({ name: "useTheme", from: resolve("./composables/useTheme") });
    // …and one more line every time anybody adds a file
  },
});
```

## After

```ts
// packages/design-system/nuxt.config.ts
export default defineNuxtConfig({
  $meta: { name: "design-system" },
});
```

```
packages/design-system/app/
├─ components/DsButton.vue      # auto-imported
├─ components/DsCard.vue        # auto-imported
├─ components/DsModal.vue       # auto-imported
└─ composables/useTheme.ts      # auto-imported
```

The registration list is gone, and so is the class of bug where a component exists but nobody added the line.

**And sometimes it's both.** A package can be a layer that _ships_ a module — the layer's config lists it, so consumers get both from one `extends`:

```ts
// packages/learn-layer/nuxt.config.ts
export default defineNuxtConfig({
  $meta: { name: "learn-layer" },
  modules: ["@vvantol2000/nuxt-eve"], // consumers inherit this too
});
```

That's the natural shape for a feature that is mostly files plus one piece of build-time logic: files in the layer, logic in the module, one install for the consumer. Remember `modules` concatenates across layers — the consumer can add to that list but can't remove your entry, so only put things in it the feature genuinely can't work without.

Going the other way, a module can _read_ the layers around it. `getLayerDirectories()` from `@nuxt/kit` gives every layer's resolved directories, which is how a module scans for files across an app it didn't write:

```ts
import { defineNuxtModule, getLayerDirectories } from "@nuxt/kit";

export default defineNuxtModule({
  meta: { name: "docs-scanner" },
  setup(_options, nuxt) {
    for (const dirs of getLayerDirectories(nuxt)) {
      // dirs.app, dirs.server, dirs.appPages, dirs.public, …
      // highest-priority layer first
    }
  },
});
```

If you write modules for other people's apps, that function is the one to know — hand-rolling `_layers` traversal gets `srcDir` and alias resolution wrong in ways that only show up in someone else's project.

## Do it yourself

1. Open a module you've written and count the branches in `setup()`. Zero branches and only `add*` calls? Rewrite it as a layer and delete the registrations.
2. Take a layer you have and try to add a real option to it — something that changes _which_ files exist. You'll fail, and the failure is the point: layers have no build-time decision surface.
3. Combine them. Put a module in the layer's `modules` array and confirm the consumer inherits it with one `extends` line.
4. Write a throwaway module that logs `getLayerDirectories(nuxt).map(d => d.app)` and run it in an app with two layers. The ordering you see is the precedence from the beginner series, made concrete.

## Gotchas

- **Layers can't be conditionally disabled by the consumer.** There's no `enabled: false`. If it's extended, it's in. Anything optional belongs in a module with an option.
- **Modules from layers concatenate.** Your layer's `modules` entry can't be removed by the consumer — only added to.
- **A layer can't validate anything.** No options schema, no startup error for a missing env var. A module can fail the build with a useful message; a layer can only ship code that breaks later.
- **Two layers, one module, different options.** `modules` concatenation plus config deep-merge means the highest-priority layer's options win — quietly. Namespace your module's config key.
- **Don't reach into another layer's files by path.** `@acme/base/app/components/X.vue` works, but you've just made an internal file part of their public API. Import it deliberately, or ask the layer author to export it.

## Recap

Build-time decisions mean module; files mean layer. A `setup()` with no branches is a layer, a layer with fake feature flags is a module, and a package can honestly be both — layer for the files, module for the logic. Next: testing something that has no app.
