---
title: "Paths, Aliases and the Trap"
description: "In a layer's nuxt.config, ~ and @ point at the consuming app — not at your layer. Everything works until someone else extends you. Here's the failure and the two-line fix."
series: "nuxt-layers-intermediate"
order: 3
feature: "resolving paths inside a layer's nuxt.config"
sourceUrl: "https://nuxt.com/docs/4.x/guide/going-further/layers"
difficulty: "Intermediate"
estMinutes: 9
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Two different resolution rules live in the same file, and they disagree.

- **Directory keys Nuxt understands** — `srcDir`, `dir.*`, `components[].path` — resolve **relative to the layer**. These are fine.
- **Aliases in value position** — `~`, `@`, `~~`, `@@` inside `css`, `plugins`, `alias`, or anything you pass to a module — resolve **relative to the final app's `srcDir`**, which is the consumer's, not yours.

So this config is a bug waiting for a second consumer:

```ts
// packages/theme-layer/nuxt.config.ts
export default defineNuxtConfig({
  css: ["~/assets/theme.css"], // ← the CONSUMER's app/assets/theme.css
});
```

It works in your own repo, because your test app happens to have that file. It breaks the moment someone extends the layer from a project without an `assets/theme.css` — with an error that names _their_ path, sending them looking in the wrong repo.

The fix is to resolve against the layer's own location:

```ts
// packages/theme-layer/nuxt.config.ts
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  css: [join(currentDir, "./app/assets/theme.css")],
});
```

`import.meta.url` is the one thing in that file guaranteed to be about the layer.

## Why you'd care

Because this is the bug that makes people say layers "don't work in monorepos". They work; the config was written as if it were the app's.

Three symptoms, all the same cause:

- CSS from the layer is silently missing in the consuming app.
- A plugin registered by the layer never runs.
- `Cannot find module '~/assets/…'` naming a path that doesn't exist in the repo you're currently in.

And the reason it's nasty: **it passes in development, in the repo where you wrote the layer.** Nothing surfaces until the second consumer.

## Before

```ts
// packages/learn-layer/nuxt.config.ts — wrong
export default defineNuxtConfig({
  css: ["~/assets/learn.css"],
  plugins: ["~/plugins/progress.client.ts"],
});
```

Both entries point at the consumer's `app/`. In this repo, `apps/web/app/plugins/progress.client.ts` doesn't exist — so the layer's plugin never ran, and nothing said so.

## After

```ts
// packages/learn-layer/nuxt.config.ts — correct
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const currentDir = dirname(fileURLToPath(import.meta.url));

export default defineNuxtConfig({
  $meta: { name: "learn-layer" },
  css: [join(currentDir, "./app/assets/learn.css")],
  plugins: [join(currentDir, "./app/plugins/progress.client.ts")],
});
```

Note what _doesn't_ need this treatment. Auto-imported directories — `app/components`, `app/composables`, `app/pages`, `server/` — are scanned per layer relative to that layer's `srcDir`. Nuxt already knows where your layer lives. The trap is only in paths _you_ write as strings in config.

The learn layer serving this page has an empty config for exactly that reason: it registers nothing by path, so there is nothing to resolve wrongly.

```ts
// packages/learn-layer/nuxt.config.ts — the real one
export default defineNuxtConfig({
  $meta: { name: "learn-layer" },
});
```

That's a design rule worth keeping: **prefer convention over a path string in a layer's config.** Every path you don't write is a path you can't get wrong.

## Do it yourself

1. Grep your layer for the trap:

```bash
grep -nE "'[~@]{1,2}/" packages/*/nuxt.config.ts
```

Every hit is either already broken or waiting to be.

2. Replace each with `join(currentDir, …)`.
3. Prove it by consuming the layer from a second, empty app:

```bash
mkdir -p /tmp/layer-probe && cd /tmp/layer-probe
npx nuxi init . --package-manager pnpm --no-gitInit
```

Add your layer to `extends` by absolute path, start it, and load a page that needs the layer's CSS. An empty consumer is the only honest test — your own repo is contaminated with the files you're accidentally relying on.

4. For anything the layer needs at _runtime_, use `runtimeConfig` rather than a path. Paths are a build-time concept; runtime code should never see one.

## Gotchas

- **`~` and `@` are the consumer's.** Say it once more, because the error message will never say it for you.
- **`~~` and `@@` are the consumer's root**, and equally wrong inside a layer.
- **`import` statements inside `.vue`/`.ts` files are fine.** Those resolve relative to the file, through Vite. The trap is config strings only.
- **`currentDir` needs `import.meta.url`, so the layer config must be ESM.** `"type": "module"` in the layer's `package.json`.
- **Options you pass to a module can carry the trap.** `image: { dir: '~/assets/img' }` inside a layer config has the same problem — and the module's error message will be even further from the cause.
- **Windows paths.** Use `join`/`resolve` from `node:path`, never string concatenation with `/`.

## Recap

Directory keys resolve against the layer; aliases in config values resolve against the consumer. Use `join(currentDir, …)` built from `import.meta.url` for any path a layer declares, and prefer conventional directories so you declare as few as possible.

Next: **[Nuxt Layers: Advanced](/learn/nuxt-layers-advanced)** — remote layers, the layer-vs-module decision, and testing a layer that has no app of its own.
