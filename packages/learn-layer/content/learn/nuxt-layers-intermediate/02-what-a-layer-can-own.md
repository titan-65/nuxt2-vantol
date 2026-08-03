---
title: "What a Layer Can Own"
description: "Pages, layouts, composables, middleware, Nitro routes, and — the one that surprises people — a Nuxt Content collection with its own markdown. Everything a Nuxt app has, a layer can have."
series: "nuxt-layers-intermediate"
order: 2
feature: "layer-owned routes, server handlers and content collections"
sourceUrl: "https://content.nuxt.com/docs/getting-started/configuration"
difficulty: "Intermediate"
estMinutes: 11
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

The rule is short: **whatever a Nuxt app can have, a layer can have.** There's no reduced feature set. What differs is only _precedence_.

| Directory                        | Merges as                                                     |
| -------------------------------- | ------------------------------------------------------------- |
| `app/pages/`                     | routes, deduped by path — higher layer wins                   |
| `app/components/`                | auto-imports, higher layer wins on name                       |
| `app/composables/`, `app/utils/` | auto-imports, same rule                                       |
| `app/layouts/`                   | layouts by name                                               |
| `app/middleware/`                | named middleware; global middleware from every layer runs     |
| `app/plugins/`                   | all layers' plugins register — these stack, they don't shadow |
| `server/`                        | Nitro routes, api handlers, middleware, utils                 |
| `public/`                        | static assets, merged                                         |
| `modules/`                       | local modules, auto-registered per layer                      |
| `content/` + `content.config.ts` | Nuxt Content collections (see below)                          |

Two entries in that table deserve more than a row.

**Nitro routes.** A layer can ship server code, and this is what makes a layer a whole feature rather than a UI kit. The learn layer owns its own feed:

```ts
// packages/learn-layer/server/routes/learn/rss.xml.ts
import { queryCollection } from "@nuxt/content/server";

export default defineEventHandler(async (event) => {
  const docs = await queryCollection(event, "tutorials").all();
  // …build the RSS document
});
```

`/learn/rss.xml` exists in production, and the blog app has no idea how it's built.

**Content collections.** Nuxt Content v3 loads `content.config.ts` from _every_ layer and merges the collections by name. A layer's `source` resolves against that layer's own `content/` directory — so the markdown ships with the layer:

```ts
// packages/learn-layer/content.config.ts
export default defineContentConfig({
  collections: {
    tutorials: defineCollection({
      type: "page",
      source: "learn/**/*.md", // → packages/learn-layer/content/learn/**
      schema: z.object({
        title: z.string(),
        series: z.string(),
        order: z.number().optional(),
      }),
    }),
  },
});
```

Because merging is **by collection name**, the host app must not also define `tutorials` — if it does, the host's definition wins and the layer's markdown silently disappears from the site. One collection, one owner.

## Why you'd care

This is the difference between "a layer holds my shared components" and "a layer is a product".

The learning platform on this site owns:

- three routes (`/learn`, `/learn/:series`, `/learn/:series/:step`)
- a component (`LearnHeaderNav`) and two MDC components used inside lessons
- a composable (`useTutorialProgress`)
- a Nitro route (`/learn/rss.xml`)
- the `tutorials` content collection and every markdown file in it

Delete the `extends` line and all of that disappears cleanly — no dangling imports in the blog, no orphaned components. That's the test of whether the boundary is honest, and only a layer that owns its server and content layers can pass it.

## Before

The learning platform's markdown lived in `apps/web/content/learn/`, and its schema was one of nine collections in `apps/web/content.config.ts`. The blog app declared the shape of tutorial frontmatter — a thing it has no opinions about and no reason to know.

## After

```
packages/learn-layer/
├─ content.config.ts              # owns `tutorials`, and nothing else
├─ content/learn/**/*.md          # every lesson
├─ app/pages/learn/
│  ├─ index.vue
│  └─ [series]/
│     ├─ index.vue
│     └─ [step].vue
├─ app/components/LearnHeaderNav.vue
├─ app/components/content/        # MDC components for lessons
├─ app/composables/useTutorialProgress.ts
└─ server/routes/learn/rss.xml.ts
```

```ts
// apps/web/content.config.ts
export default defineContentConfig({
  collections: {
    // `tutorials` lives in the learn layer: packages/learn-layer/content.config.ts
    blog: defineCollection({
      /* … */
    }),
    projects: defineCollection({
      /* … */
    }),
  },
});
```

The host app still _queries_ `tutorials` — `queryCollection('tutorials')` is global, so the sitemap and the site search keep working untouched. It just doesn't _define_ it any more. Consuming a layer's collection is fine; owning it twice is not.

## Do it yourself

1. Move one feature's pages into `packages/<layer>/app/pages/<feature>/`. Visit the routes. They should be unchanged.
2. Move its composable across and delete the import from the host app — auto-imports don't care which layer a composable came from.
3. Move a server route into `packages/<layer>/server/routes/`. Curl it.
4. Move the collection: create `content.config.ts` in the layer, move the `content/<feature>/` directory next to it, and **delete the collection from the host's config**. Start the dev server and read the line Content prints:

```
[@nuxt/content] ✔ Processed 10 collections and 135 files
```

If the file count dropped, the layer's `source` isn't resolving — check that the markdown sits under `<layer>/content/` and not `<layer>/`.

5. Now the real check. Comment out the `extends` line, start the app, and confirm the _blog_ still builds with no missing imports. Anything that breaks was a dependency crossing the boundary in the wrong direction.

## Gotchas

- **One collection, one owner.** Both layers defining `tutorials` isn't an error — the higher-priority definition simply replaces the other, and the lower layer's markdown vanishes from the site with no warning.
- **MDC components need `app/components/content/`.** Nuxt Content scans that exact path in each layer's `srcDir`. `app/components/mdc/` is not scanned.
- **Global plugins and global middleware stack.** Three layers with a global middleware means three run, every navigation. Convenient for logging, expensive for auth checks.
- **`public/` collisions are last-writer-wins with no warning.** Namespace your layer's assets in a subdirectory.
- **Layer-owned server routes still share the Nitro namespace.** `/api/health` in a layer will happily collide with the host's. Prefix routes with the feature the layer owns.

## Recap

A layer can own everything an app owns — routes, layouts, plugins, Nitro handlers, and its own Nuxt Content collection with the markdown to fill it. The boundary test is deleting the `extends` line and seeing whether the host still builds. Next: the path bug that makes all of this fail once your layer moves.
