---
title: "What a Layer Actually Is"
description: "A layer is just a Nuxt app with a nuxt.config.ts. extends merges its directories into yours. That's the whole feature — the interesting part is everything it implies."
series: "nuxt-layers-core"
order: 1
feature: "extends, and the auto-scanned layers/ directory"
sourceUrl: "https://nuxt.com/docs/4.x/getting-started/layers"
difficulty: "Beginner"
estMinutes: 8
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

A layer is a directory with a `nuxt.config.ts` in it. Anything else is optional.

```ts
// packages/learn-layer/nuxt.config.ts
export default defineNuxtConfig({
  $meta: { name: "learn-layer" },
});
```

That file — plus whatever `app/`, `server/`, `content/` directories sit beside it — becomes inheritable the moment another app names it:

```ts
// apps/web/nuxt.config.ts
export default defineNuxtConfig({
  extends: ["@vvantol2000/learn-layer"],
});
```

Nuxt now builds one app out of two directory trees. The layer's `app/pages` join your routes. Its `app/components` join your auto-imports. Its `server/routes` join your Nitro routes. Its config is merged underneath yours.

`extends` accepts three kinds of entry:

| Form          | Example                             | Use it for                        |
| ------------- | ----------------------------------- | --------------------------------- |
| Relative path | `'../../packages/learn-layer'`      | a folder in the same repo         |
| Package name  | `'@vvantol2000/learn-layer'`        | a workspace or published package  |
| Git URL       | `'github:vantolbennett/some-layer'` | a layer you don't want to publish |

And there's a fourth that needs no config at all: **any directory inside `layers/` at your project root is picked up automatically.** `layers/branding/nuxt.config.ts` is extended without you writing a line of `extends`.

::NuxtLayerPlayground
::

## Why you'd care

Three reasons show up in practice, in increasing order of how much pain they save:

1. **Reuse across projects.** The same header, theme tokens, and `useApi` composable in four client sites, from one package.
2. **Presets.** A layer that fixes your defaults — TypeScript strictness, ESLint config, `app.config` tokens — so a new app starts correct.
3. **Splitting one app that became two.** This is the case that brought me here. The blog and the learning platform have different navigation, different content collections, different release cadence, and no shared feature except the domain name.

That third one is the one people reach for last and should reach for earlier. A layer is the cheapest possible boundary: no build step, no publish, no API to design. You move files and add one line.

## Before

Everything lives in the host app, and the only thing separating two products is your discipline about file naming:

```
apps/web/app/
├─ components/     # blog components and learn components, mixed
├─ composables/    # useBookmarks.ts, useTutorialProgress.ts, side by side
├─ pages/
│  ├─ blog/
│  └─ learn/
└─ content/        # one content.config.ts owning every collection
```

Nothing is _wrong_ here. It just doesn't say anything. There's no line in the codebase that answers "what belongs to the learning platform?" — the answer lives in your head.

## After

```
apps/web/                       # the blog. Owns /, /blog, /projects…
└─ nuxt.config.ts               # extends: ['@vvantol2000/learn-layer']

packages/learn-layer/           # the learning platform. Owns /learn.
├─ nuxt.config.ts
├─ content.config.ts
├─ content/learn/**
├─ app/pages/learn/
├─ app/components/
├─ app/composables/useTutorialProgress.ts
└─ server/routes/learn/rss.xml.ts
```

Same site, same URLs, same build. But now the boundary is a directory, and "does the blog depend on this?" is a question the filesystem answers.

## Do it yourself

Don't build anything yet — look at what you already have. In any Nuxt app, add a config file and print the layers Nuxt resolved:

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  hooks: {
    "modules:done": (nuxt) => {
      console.log(nuxt.options._layers.map((l) => l.cwd));
    },
  },
});
```

Run `nuxt dev`. You'll see at least one entry — your own project. **Your app is always `_layers[0]`.** That's not trivia; it's the precedence rule, and step three is about what it means.

## Gotchas

- **A layer is not a module.** A module is a _function_ that runs at build time and edits config. A layer is a _directory_ that gets merged into yours. Different tools; step two of the Advanced series draws the line properly.
- **`extends` by package name needs `main` to point at the config.** `"main": "./nuxt.config.ts"` in the layer's `package.json`, or Nuxt won't find it.
- **Layers are resolved once, at startup.** Adding a directory under `layers/` while the dev server is running triggers a hard restart — that's expected, not a bug.
- **Layer code is not sandboxed.** Everything the layer registers is global to the final app: routes, auto-imports, middleware. A layer is an organisational boundary, not a security one.

## Recap

A layer is a Nuxt app you inherit from — a directory with a `nuxt.config.ts`, pulled in by path, package name, git URL, or by living in `layers/`. Your own project is always the first and highest-priority layer. Next: build one.
