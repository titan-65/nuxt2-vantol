---
title: "Scaffold the Presence Package"
description: "Build the smallest package Nuxt will accept as a module, wire it into a monorepo, and prove it loads with a playground app and one test."
series: "nuxt-modules-core"
order: 2
feature: "packages/presence, @nuxt/kit, workspace wiring"
sourceUrl: "https://nuxt.com/docs/4.x/guide/going-further/modules"
difficulty: "Beginner"
estMinutes: 12
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

A Nuxt module is an ordinary npm package whose entry point default-exports the result of `defineNuxtModule`. Ours lives at `packages/presence/` in the same monorepo as the blog that consumes it.

## Why you'd care

A module you can't load is a module you can't debug. Getting "it installs and the test proves it" done first means every later step has a green baseline to break.

## Before

An empty folder.

## After

```
packages/presence/
  src/module.ts
  playground/          # a tiny Nuxt app that installs the module
  test/module.test.ts
  package.json
```

`vp test` starts a real Nuxt app with your module in it and gets HTML back.

## Do it yourself

### 1. `package.json`

```json
{
  "name": "nuxt-presence",
  "version": "0.0.0",
  "type": "module",
  "files": ["src"],
  "exports": {
    ".": {
      "types": "./src/module.ts",
      "import": "./src/module.ts"
    }
  },
  "dependencies": {
    "@nuxt/kit": "^4.0.0",
    "@nuxt/schema": "^4.0.0"
  },
  "peerDependencies": {
    "nuxt": "^4.0.0"
  }
}
```

Pointing `exports` straight at TypeScript source looks wrong if you've published libraries before. It isn't, here: Nuxt loads modules through [jiti](https://github.com/unjs/jiti), which compiles TS on the fly. We skip a build step entirely — see the gotchas for when that stops being true.

### 2. The smallest module that loads

```ts
// src/module.ts
import { defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  meta: { name: "nuxt-presence", configKey: "presence" },
  setup() {
    // nothing yet — it just has to load
  },
});
```

### 3. A playground to load it into

```ts
// playground/nuxt.config.ts
export default defineNuxtConfig({
  alias: {
    "nuxt-presence": "../src/module",
  },
  modules: ["nuxt-presence"],
});
```

```vue
<!-- playground/app.vue -->
<template>
  <div>presence playground</div>
</template>
```

### 4. Prove it loads

```ts
// test/module.test.ts
import { describe, it, expect } from "vite-plus/test";
import { setup, $fetch } from "@nuxt/test-utils/e2e";
import { fileURLToPath } from "node:url";

await setup({
  rootDir: fileURLToPath(new URL("../playground", import.meta.url)),
  server: true,
});

describe("nuxt-presence", () => {
  it("installs without errors", async () => {
    const html = await $fetch("/");
    expect(html).toBeDefined();
  });
});
```

`vp test` should print `1 passed`. That test is doing more than it looks like: `setup()` boots a genuine Nuxt build with your module installed, so a module that throws during `setup()` fails here loudly.

## Gotchas

- **`server: true` is required.** With `server: false` there's no base URL and `$fetch('/')` fails with `Failed to parse URL from /`.
- **The first run is slow.** It's building a Nuxt app. Subsequent runs are cached.
- **Source exports are a workspace convenience.** Publishing to npm means shipping compiled JS and `.d.ts`, and then your build has to emit the whole `runtime/` tree — not just the module entry — or the paths you register point into an empty `dist`. `@nuxt/module-builder` handles that shape; the capstone covers the switch, including the part it quietly leaves out.
- **`alias` in the playground** is what lets the playground resolve the module without an install step.

## Recap

A module is a package that exports `defineNuxtModule`. A playground app plus one e2e test gives you a loop where "did I break the module?" takes seconds to answer. Next: something a visitor can actually see.
