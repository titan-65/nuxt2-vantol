---
title: "Testing and Publishing a Layer"
description: "A layer has no app to run, so you build one that exists only to consume it. Then you publish source — no dist, no build step — and version it like the breaking-change surface it actually is."
series: "nuxt-layers-advanced"
order: 3
feature: "fixture apps with @nuxt/test-utils, files, and versioning source"
sourceUrl: "https://nuxt.com/docs/4.x/getting-started/testing"
difficulty: "Advanced"
estMinutes: 11
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

You can't run a layer. You can only run something that extends it — so the test setup is a **fixture app**: the smallest possible Nuxt project whose entire purpose is to be a consumer.

```
packages/learn-layer/
├─ nuxt.config.ts
├─ app/
└─ test/
   ├─ fixtures/basic/
   │  ├─ nuxt.config.ts        # extends: ['../../..']
   │  └─ app/app.vue
   └─ layer.test.ts
```

```ts
// packages/learn-layer/test/fixtures/basic/nuxt.config.ts
export default defineNuxtConfig({
  extends: ["../../.."],
});
```

```ts
// packages/learn-layer/test/layer.test.ts
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { $fetch, setup } from "@nuxt/test-utils/e2e";

describe("learn layer", async () => {
  await setup({
    rootDir: fileURLToPath(new URL("./fixtures/basic", import.meta.url)),
    server: true,
  });

  it("contributes the /learn route", async () => {
    const html = await $fetch("/learn");
    expect(html).toContain("Learning, one release at a time");
  });

  it("contributes its own nitro route", async () => {
    const xml = await $fetch("/learn/rss.xml");
    expect(xml).toContain("<rss");
  });
});
```

The fixture is the test. It boots a real Nuxt app, and every route, component, and server handler the layer claims to provide either shows up in it or doesn't.

## Why you'd care

Because a layer's contract is _"extend me and these things exist"_, and that contract breaks in ways unit tests can't see:

- A component moves from `app/components/` to `app/components/ui/` — its auto-import name changes. Nothing fails to compile in your repo. Every consumer breaks.
- The `~/assets/…` path from the last series works in your repo and nowhere else. Only an isolated fixture catches it, because a fixture has no files to accidentally satisfy it.
- A collection you own gets renamed, and every consumer's `queryCollection()` returns nothing.
- `files` in `package.json` misses a directory. The package publishes, installs, and is silently missing a quarter of itself.

Each of those is invisible to type-checking and obvious to a fixture app.

## Before

Testing the layer by running the real site. Which means the real site's dependencies, the real site's `app/` directory, and the real site's copy of every file the layer is accidentally borrowing. It passes. It proves nothing about anyone else.

## After

```bash
vp test --run packages/learn-layer/test/layer.test.ts
```

A cold app that has exactly one thing in it: your layer. If the route renders here, it renders anywhere.

Publishing is the shorter half, because there's nothing to build:

```json
{
  "name": "@vvantol2000/learn-layer",
  "version": "0.1.0",
  "type": "module",
  "main": "./nuxt.config.ts",
  "exports": { ".": "./nuxt.config.ts" },
  "files": ["app", "server", "content", "content.config.ts", "nuxt.config.ts"]
}
```

```bash
npm pack --dry-run   # read the file list. Every time.
```

That command is the entire pre-publish checklist. `files` omissions don't error, they just ship a package with a hole in it.

Versioning deserves a moment, because a layer's breaking-change surface is wider than a normal package's and none of it is in a type signature:

| Change                                                        | Semver    |
| ------------------------------------------------------------- | --------- |
| Renaming or moving a component (its auto-import name changes) | **major** |
| Renaming a composable or util                                 | **major** |
| Changing a route path the layer owns                          | **major** |
| Renaming a content collection                                 | **major** |
| Changing an `app.config` key's shape                          | **major** |
| Adding a component, page, or config default                   | minor     |
| Changing internals of an existing component                   | patch     |

Every file in a layer is public API. That's the cost of auto-imports, and it's why "just move that component into a subfolder" is a major version.

## Do it yourself

1. Create `test/fixtures/basic/` with a `nuxt.config.ts` that extends `'../../..'` and an `app/app.vue` containing only `<NuxtPage />`.
2. Write one test per thing the layer promises — a route, a component, a server handler, a collection.
3. Run the tests from the package, not the repo root:

```bash
cd packages/learn-layer && vp test
```

4. Break it deliberately: rename `LearnHeaderNav.vue` to `HeaderNav.vue` and re-run. The test that fails is the consumer breakage you'd otherwise have shipped.
5. Run `npm pack --dry-run` and diff the file list against your directory listing. Anything missing is a hole.
6. If the layer depends on the app providing something — a module, an env var, a peer — assert it. A fixture that fails with _"this layer needs @nuxt/content"_ is worth more than a README section nobody read.

## Gotchas

- **`setup()` from `@nuxt/test-utils/e2e` is slow** — it builds a real app. One `setup` per describe block, not per test.
- **The fixture must not accidentally provide what the layer needs.** Keep it empty. An `assets/` directory in the fixture will happily hide the path trap you're trying to catch.
- **Test the built output, not just dev.** Some layer bugs — prerendering, content SQL dumps — only exist after `nuxt build`.
- **Don't add a build step to make tests easier.** Layers ship source; a `dist/` breaks SFC handling and auto-import scanning.
- **Peer dependencies need a fixture that installs them.** If `@nuxt/content` must be a single shared instance, a fixture with its own copy will hide the duplicate-instance bug.
- **A layer's `README` is its type definitions.** Nothing about auto-imported names is enforced by the compiler; document the surface or the surface doesn't exist.

## Recap

Test a layer by building the smallest app that consumes it, and keep that app empty enough to be honest. Publish source with an explicit `files` list, check it with `npm pack --dry-run`, and treat every filename as public API when you pick a version number.

Next: **[Nuxt Layers Capstone: Splitting This Blog](/learn/nuxt-layers-capstone)** — all of it applied to the site you're reading, in one commit.
