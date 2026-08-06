---
title: "The Split"
description: "Six git mv commands and one deleted config block. The order matters, and the last step — deleting the collection from the host — is the one that proves the boundary was real."
series: "nuxt-layers-capstone"
order: 1
feature: "migrating a live feature out of the host app and into a layer"
sourceUrl: "https://content.nuxt.com/docs/collections/define"
difficulty: "Advanced"
estMinutes: 13
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

A migration in one direction: every file that exists _because of_ the learning platform moves out of `apps/web` and into `packages/learn-layer`. Nothing is rewritten. The routes, the markdown, the component code are identical — only their address changes.

Six moves:

```bash
git mv apps/web/app/pages/learn                      packages/learn-layer/app/pages/learn
git mv apps/web/app/composables/useTutorialProgress.ts \
       packages/learn-layer/app/composables/useTutorialProgress.ts
git mv apps/web/content/learn                        packages/learn-layer/content/learn
git mv apps/web/server/routes/learn/rss.xml.ts \
       packages/learn-layer/server/routes/learn/rss.xml.ts
mv     apps/web/app/components/content/NuxtLayerPlayground.vue \
       packages/learn-layer/app/components/content/
mv     apps/web/app/components/content/EveModulePlayground.vue \
       packages/learn-layer/app/components/content/
```

Then one config block moves, and that's the interesting one.

## Why you'd care

Because the mechanical part is easy and the boundary question is not. Every file in that list had to answer _"does the blog need this?"_ and a few answers were not obvious:

- `useTutorialProgress` — learn only. Moves.
- `BlogAlert.vue`, the MDC alert component used in every lesson — **stays in the host**. It's used by blog posts too, and the layer inherits it from the app rather than the other way round. That's an inversion worth noticing: a layer can consume things the host provides. It makes the layer less portable, and I took that trade knowingly.
- The site search and the sitemap both call `queryCollection('tutorials')` — **they stay in the host**. Querying a collection the layer defines is fine. Defining it twice is not.
- `apps/web/app/pages/eve/` — the agent studio. Related in subject, not in structure; it stays in the host app until it earns its own boundary.

The rule that settled each one: _if deleting the `extends` line would leave this file broken or orphaned, it belongs in the layer._

## Before

```
apps/web/
├─ app/pages/learn/{index.vue,[series]/index.vue,[series]/[step].vue}
├─ app/composables/useTutorialProgress.ts
├─ app/components/content/{NuxtLayerPlayground,EveModulePlayground}.vue
├─ content/learn/**/*.md              # 90+ lessons across 11 series
├─ content.config.ts                  # 9 collections, one of them `tutorials`
└─ server/routes/learn/rss.xml.ts
```

## After

```
apps/web/
└─ nuxt.config.ts                     # extends: ['@vvantol2000/learn-layer']

packages/learn-layer/
├─ package.json                       # main → ./nuxt.config.ts
├─ nuxt.config.ts                     # $meta.name only
├─ content.config.ts                  # owns `tutorials`
├─ content/learn/**/*.md
├─ app/pages/learn/
├─ app/components/LearnHeaderNav.vue
├─ app/components/content/
├─ app/composables/useTutorialProgress.ts
└─ server/routes/learn/rss.xml.ts
```

The content collection is the move that matters. It leaves the host:

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
    // …
  },
});
```

…and arrives in the layer, with its `source` now relative to the layer's own `content/`:

```ts
// packages/learn-layer/content.config.ts
import { defineContentConfig, defineCollection, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    tutorials: defineCollection({
      type: "page",
      source: "learn/**/*.md", // → packages/learn-layer/content/learn/**
      schema: z.object({
        title: z.string(),
        description: z.string(),
        series: z.string(),
        order: z.number().optional(),
        difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]).optional(),
        // …
      }),
    }),
  },
});
```

**Deleting it from the host is not optional.** Content merges collections by name across layers, host last — so leaving both definitions in place means the host's wins, its `source` resolves against `apps/web/content/learn` which no longer exists, and the site loses every lesson without a single error message.

Two more small changes made the boundary visible rather than merely true. The layer's own header component went onto its three pages:

```vue
<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <LearnHeaderNav />
    <!-- … -->
  </div>
</template>
```

No import — `LearnHeaderNav` lives in the layer's `app/components/` and auto-imports into the layer's own pages exactly as it would into the host's. And the `extends` entry moved from a relative path to the package name, with `"@vvantol2000/learn-layer": "workspace:*"` added to `apps/web/package.json`.

## Do it yourself

Order matters — this sequence keeps the app running at every step:

1. **Create the package first.** `package.json` with `main: "./nuxt.config.ts"`, plus a `nuxt.config.ts` containing only `$meta`. Add the workspace dependency and the `extends` line. Start the dev server: nothing has changed yet, and it should still boot.
2. **Move the leaves.** Composable, then components. Restart. Auto-imports resolve from the new location with no import edits anywhere.
3. **Move the pages.** Restart, load every route.
4. **Move the server route.** `curl localhost:3000/learn/rss.xml`.
5. **Move the content last** — the collection config and the markdown together, deleting the host's definition in the same edit. Read the line Content prints on boot:

```
[@nuxt/content] ✔ Processed 10 collections and 145 files in 126.78ms
```

Nine collections became ten only because the layer's `tutorials` is now counted separately from the host's nine. **If the file count dropped, the layer's `source` isn't resolving** — the markdown must live under `<layer>/content/`, not `<layer>/`.

6. **Run the boundary check.** Comment out the `extends` line and start the app:

```bash
curl -o /dev/null -w '%{http_code}\n' localhost:3000/        # 200 — blog fine
curl -o /dev/null -w '%{http_code}\n' localhost:3000/learn   # 404 — expected
```

A 500 instead of a 404, or a missing-import error in the blog, means something crossed the boundary in the wrong direction. Fix it now; it's much harder to see once the layer is a published dependency.

7. Uncomment, and verify the whole surface:

```bash
for u in /learn /learn/nuxt-layers-core /learn/nuxt-layers-core/01-what-a-layer-is /learn/rss.xml; do
  printf '%s -> %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code}' "localhost:3000$u")"
done
```

## The bug this split actually caused

Worth its own section, because it's the failure mode nobody warns you about: **adding a layer can change which of two same-named components wins.**

This repo had two files called `BlogCard`:

```
apps/web/app/components/BlogCard.vue          # props: post — used by nothing
apps/web/app/components/content/BlogCard.vue  # a slot wrapper — used by ::BlogCard in markdown
```

That duplication had been there for months and was harmless. Adding one layer broke it. The production build failed on eight blog posts:

```
[nitro]   ├─ /blog/building-null-agent (3043ms)
  │ ├── [500] Server Error
```

```
Cannot read properties of undefined (reading 'img')
  at apps/web/app/components/BlogCard.vue
```

Every failing post used `::BlogCard` in its markdown. The MDC block had started resolving to the _props-based_ component, which immediately dereferenced a `post` prop that markdown never passes.

The cause is priority arithmetic. Nuxt gives each layer's component directories a priority derived from the number of layers, while Nuxt Content registers each layer's `app/components/content` separately. Going from one layer to two reshuffled the two `BlogCard` registrations, and the loser became the winner.

The fix was deletion, not configuration — the props-based component had no callers:

```bash
git rm apps/web/app/components/BlogCard.vue
```

The general rule this leaves you with: **duplicate component names are a latent bug, and adding a layer is what collects the debt.** Before you split, check:

```bash
find . -name '*.vue' -not -path '*/node_modules/*' -exec basename {} \; | sort | uniq -d
```

Every name in that output is a coin flip that a layer might re-toss. And note where this bug surfaced — not in `nuxt dev`, where those posts render on demand, but in the prerender pass of a production build.

## Gotchas

- **Two definitions of one collection is a silent data loss.** No warning, no error, just an empty section. Delete the host's copy in the same commit that adds the layer's.
- **`content/` sits at the layer root, `app/` holds the pages.** `packages/learn-layer/content/learn/**` and `packages/learn-layer/app/pages/learn/` — two different roots in one package, and mixing them up produces a build that works with nothing in it.
- **MDC components must be in `app/components/content/`.** That exact path, per layer. Anywhere else and lessons render `::NuxtLayerPlayground` as literal text.
- **`git mv`, not copy-then-delete.** History follows the files, and `git log --follow` still works on every lesson.
- **The host may still legitimately query the layer's collection.** The sitemap and search do. Consuming is fine; owning twice is not.
- **A layer consuming a host component is a debt, not a bug.** `BlogAlert` lives in the host and the layer's lessons use it. That's fine here — the layer isn't published — but it means the layer would not work standalone, and that's worth writing down before someone assumes otherwise.

## Recap

Move the leaves, then the pages, then the server routes, then the content — creating the package first so the app boots at every step. Delete the collection from the host in the same edit that adds it to the layer. Then comment out `extends` and confirm the host survives: that check is the difference between a split and a rename. Next: production.
