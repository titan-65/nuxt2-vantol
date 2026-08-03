---
title: "The Module Anatomy"
description: "A Nuxt module is a function that runs once, while Nuxt is starting, and edits the app before it's built. Understanding that one sentence — and the boundary it implies — is most of what makes modules click."
series: "nuxt-modules-core"
order: 1
feature: "defineNuxtModule and the build/runtime boundary"
sourceUrl: "https://nuxt.com/docs/4.x/guide/going-further/modules"
difficulty: "Beginner"
estMinutes: 8
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

A Nuxt module is a function. Nuxt calls it once at startup, hands it your options and the Nuxt instance, and lets it edit the app before anything is built.

```ts
export default defineNuxtModule({
  meta: { name: "nuxt-presence", configKey: "presence" },
  defaults: { enabled: true },
  setup(options, nuxt) {
    // runs once, at build time, in Node
  },
});
```

`configKey` is the key users write in `nuxt.config.ts`. `defaults` is merged with whatever they wrote. `setup` is where all the work happens — registering components, plugins, server routes, hooks.

That's the whole API. What makes modules confusing isn't `defineNuxtModule`; it's the boundary.

## Why you'd care

Your module has two kinds of code living in one package, and they never run together:

|                             | Build-time code                               | Runtime code                        |
| --------------------------- | --------------------------------------------- | ----------------------------------- |
| Where                       | `src/module.ts` and anything it imports       | `src/runtime/**`                    |
| When                        | Once, when Nuxt starts                        | On every request, or in the browser |
| Can use                     | `node:fs`, `node:crypto`, env, the filesystem | Whatever the target supports        |
| Gets bundled into your app? | No                                            | Yes                                 |

`setup()` never _calls_ your runtime code. It _registers paths to it_:

```ts
addPlugin({ src: resolve("./runtime/plugins/presence.client"), mode: "client" });
```

You're handing Nuxt a file path. Nuxt compiles that file into the app later. If you import your runtime plugin at the top of `module.ts` and call it directly, you've imported browser code into a Node build process — and it will break in ways that read as nonsense.

## Before

Without a module, sharing this feature across projects means copy-pasting a component, a plugin, and a server route into every app, then keeping four copies in sync.

## After

One line in `nuxt.config.ts`, and the component auto-imports, the plugin registers, the routes exist:

```ts
export default defineNuxtConfig({
  modules: ["nuxt-presence"],
});
```

## Do it yourself

Nothing to build yet — but read one module's source before you write your own. Open any module you already depend on in `node_modules` and find its `setup()`. You're looking for the shape:

1. Resolve options.
2. Bail early if disabled.
3. Call `createResolver(import.meta.url)` to get paths relative to the module file.
4. Register things: `addPlugin`, `addComponent`, `addImports`, `addServerHandler`.
5. Write to `nuxt.options.runtimeConfig` for anything runtime code needs to read.

Every module you'll ever write is a variation on those five moves.

## Gotchas

- **`setup()` runs in Node, always.** Even for a client-only feature. Reaching for `window` there throws.
- **Never import runtime code into `module.ts`.** Register the path; let Nuxt compile it.
- **`createResolver(import.meta.url)`, not raw relative strings.** Paths must resolve from your module's location, not the consuming app's.
- **`runtimeConfig` is the only bridge.** Options live at build time; anything the browser or a server route needs has to be written into runtime config to cross over. Public config ships to the browser — treat it as published.

## Recap

A module is a build-time function that edits the app. Its runtime code is registered by path, never imported directly, and the two sides talk only through `runtimeConfig`. Next step: a package that Nuxt can load.
