---
title: "From Folder to Workspace Package"
description: "A layer package has no build step and no entry point in the usual sense — main points at nuxt.config.ts and Nuxt does the rest. Five lines of package.json, and one import rule you now get for free."
series: "nuxt-layers-intermediate"
order: 1
feature: "package.json main/files, workspace:* dependencies, extends by name"
sourceUrl: "https://nuxt.com/docs/4.x/guide/going-further/layers"
difficulty: "Intermediate"
estMinutes: 10
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

A layer package is a package whose entry point is a Nuxt config:

```json
{
  "name": "@vvantol2000/learn-layer",
  "version": "0.1.0",
  "type": "module",
  "main": "./nuxt.config.ts",
  "exports": { ".": "./nuxt.config.ts" },
  "files": ["app", "server", "content", "content.config.ts", "nuxt.config.ts"],
  "dependencies": {
    "@nuxt/content": "^3.15.0",
    "@nuxt/kit": "^4.0.0"
  }
}
```

No `build` script. No `dist/`. The consuming app compiles the layer's raw `.ts` and `.vue` files as part of its own build, because a layer is source, not a library.

In the workspace, the consumer depends on it like any other package:

```json
// apps/web/package.json
"dependencies": {
  "@vvantol2000/learn-layer": "workspace:*"
}
```

```ts
// apps/web/nuxt.config.ts
export default defineNuxtConfig({
  extends: ["@vvantol2000/learn-layer"],
});
```

## Why you'd care

The relative path worked. `extends: ['../../packages/learn-layer']` builds fine. So why bother?

- **It survives leaving the monorepo.** The day this layer is published, or vendored into another repo, the config line doesn't change.
- **It gets a dependency list.** `@nuxt/content` is a dependency _of the layer_, declared where it's actually used. A relative-path layer silently borrows whatever the host app happens to have installed — and breaks the day the host removes it.
- **It gets a name in tooling.** The layer shows up in `pnpm why`, in the lockfile, in `nuxt.options._layers` with a real identity.
- **It gets an explicit surface.** `files` says what ships. Everything else is private by construction.

Under pnpm's strict `node_modules`, that third point has teeth: the layer can only import what it declares. If you moved code into the layer and forgot a dependency, install fails loudly instead of working locally and dying in CI.

## Before

```ts
extends: ['../../packages/learn-layer'],
```

Fine, until: the layer imports `zod` that only `apps/web` installed; someone moves `apps/` one level deeper; or you want to consume the same layer from a second app whose relative depth is different.

## After

```
packages/learn-layer/
├─ package.json          # main → ./nuxt.config.ts
├─ nuxt.config.ts
├─ content.config.ts
├─ content/
├─ app/
└─ server/
```

```ts
// apps/web/nuxt.config.ts
extends: ['@vvantol2000/learn-layer'],
```

Two apps can now extend it with the identical line, and the layer's dependencies are its own.

## Do it yourself

1. `git mv layers/learn packages/learn-layer` — the directory structure inside doesn't change at all.
2. Add the `package.json` above. `main` and `type: "module"` are the two fields that matter; getting `main` wrong produces a confusing _"cannot resolve"_ on the `extends` line.
3. Add `"@vvantol2000/learn-layer": "workspace:*"` to the consuming app and install.
4. Switch `extends` from the relative path to the package name.
5. Grep the layer for imports and make each one a declared dependency:

```bash
grep -rhoE "from '[^.@/][^']*'|from '@[^/]+/[^']*'" packages/learn-layer/app packages/learn-layer/server \
  | sort -u
```

Anything in that list that isn't in the layer's `package.json` and isn't auto-imported by Nuxt is a latent break.

6. Confirm the layer resolved by name:

```ts
hooks: {
  'modules:done': (nuxt) => console.log(nuxt.options._layers.map(l => l.cwd)),
}
```

You should see a path inside `node_modules` (a symlink to `packages/learn-layer` in a workspace).

## Gotchas

- **`main` must point at the config.** `"main": "./nuxt.config.ts"` — not `index.ts`, not `dist/`. Ship `exports` too; some tools read one and not the other.
- **Don't add a build step.** Compiling the layer to `dist/` breaks Vue SFC handling and auto-import scanning. Ship source. This is the one place in the JS ecosystem where that's the correct answer.
- **`files` is easy to under-fill.** Forget `content` and the package publishes with no lessons in it — and no error, because the directory is simply absent. Run `npm pack --dry-run` and read the file list before publishing.
- **Nuxt transpiles layers inside `node_modules` automatically**, so raw `.ts`/`.vue` from a dependency is fine — but only for layers Nuxt knows about. A random package with `.vue` files still needs `build.transpile`.
- **Peer vs direct dependency.** If the layer and the host must share one instance — `@nuxt/content` is the obvious case — a `peerDependency` is more honest than a direct one. In a workspace with a single lockfile you usually get away with a direct dependency; across repos you won't.

## Recap

A layer package is source with `main` pointing at `nuxt.config.ts` — no build, no `dist`, an explicit `files` list, and its own dependencies. The `extends` line stops caring where the layer sits on disk. Next: everything that layer is allowed to own.
