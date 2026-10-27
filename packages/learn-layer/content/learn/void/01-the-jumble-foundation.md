---
title: "The Jumble Foundation: One Void App, One Deploy"
description: "Scaffold Jumble as a Void + Vue app, wire the stage route that every future lesson embeds, and ship the branded foundation of the cookie storefront."
series: "void"
order: 1
feature: "voidPlugin + Vue Pages"
sourceUrl: "https://void.cloud/guide/pages-routing/overview"
difficulty: "Advanced"
estMinutes: 20
img: "/jumble-stage-1.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1767533048/PXL_20251010_202726442_2_hhudfr.jpg"
  website: "https://vantolbennett.vercel.app"
---

Jumble starts as a brand, a loader, and one route that can render any stage of the app. No menu yet. No cart. Just the foundation the other seven lessons will build on.

::JumblePreview{stage="1" height="680"}
::

## What it is

A Void app is a Vite app with a server. In Pages mode, `pages/index.vue` is the UI, and `pages/index.server.ts` is its server-side loader. Void renders the page on the server, sends typed props to the Vue component, and hydrates it in the browser.

The stage route is the same idea with a parameter: `pages/preview/[stage].vue` and `pages/preview/[stage].server.ts`. It becomes `/preview/1`, `/preview/2`, and so on. The blog iframe always loads a real stage URL.

## Why you'd care

A tutorial that shows screenshots rots the moment the code changes. A tutorial that embeds the app at each stage stays honest: if the menu breaks, the lesson preview breaks. The stage route also forces the app to be decomposed by feature instead of by lesson. Stage 1 is not a separate demo; it is the final app with later features not enabled yet.

## What we're building

Stage 1 is the Jumble foundation:

- A warm brand shell with the Jumble wordmark and stage map.
- A typed loader that returns the current stage.
- `/preview/:stage`, rendered by the same Vue component as `/`.
- A deployable Void project with D1 ready for stage 2.

The branded shell matters. The app should feel like a place, not a scaffold. We use Fraunces for the display voice, DM Sans for UI, and a cream, cocoa, guava, and lime palette. The blog stays monochrome; Jumble gets to be warm.

## Before

A new Void Pages starter is a form and a message list. It is useful for proving the stack works, but it has no identity and no stage boundary.

## After

The same Void project now has:

```txt
apps/jumble/
├─ pages/
│  ├─ index.vue
│  ├─ index.server.ts
│  └─ preview/
│     ├─ [stage].vue
│     └─ [stage].server.ts
├─ src/
│  ├─ JumbleLanding.vue
│  ├─ stages.ts
│  └─ style.css
├─ db/
│  ├─ schema.ts
│  └─ seed.ts
├─ vite.config.ts
└─ void.config.ts
```

```ts [vite.config.ts]
import { defineConfig } from "vite";
import { voidPlugin } from "void";
import { voidVue } from "@void/vue/plugin";

export default defineConfig({
  plugins: [voidPlugin(), voidVue()],
});
```

```ts [pages/index.server.ts]
import { defineHandler, type InferProps } from "void";
import { LIVE_STAGE } from "../src/stages";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async () => {
  return { stage: LIVE_STAGE, embed: false };
});
```

```vue [pages/index.vue]
<script setup lang="ts">
import type { Props } from "./index.server";
import JumbleLanding from "../src/JumbleLanding.vue";

defineProps<Props>();
</script>

<template>
  <JumbleLanding :stage="stage" :embed="embed" />
</template>
```

```ts [pages/preview/[stage].server.ts]
import { defineHandler, type InferProps } from "void";
import { LIVE_STAGE, STAGE_COUNT } from "../../src/stages";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const raw = Number(c.req.param("stage"));
  const stage = Number.isFinite(raw)
    ? Math.min(Math.max(Math.trunc(raw), 1), STAGE_COUNT)
    : LIVE_STAGE;

  return { stage, embed: true };
});
```

## Do it yourself

Void 1.2.1 requires Node 24.21 or newer. Check it first:

```bash
node -v
# v24.21.0 or later
```

Create the workspace app and initialise Void:

```bash
mkdir -p apps/jumble
cd apps/jumble
pnpm add -D void
pnpm exec void init --toolchain vite-plus --framework vue --starter sqlite
```

Then, from the repository root:

```bash
pnpm install --no-frozen-lockfile
```

Generate the initial D1 migration now, even though stage 1 does not query the database yet:

```bash
cd apps/jumble
pnpm exec void db generate
```

Run the app:

```bash
pnpm dev
```

Vite prints the local URL. If port 5173 is busy, it picks the next free port. Point the blog at it with:

```bash
NUXT_PUBLIC_JUMBLE_URL=http://localhost:5173 pnpm --filter @vvantol2000/web dev
```

When you are ready to deploy:

```bash
pnpm exec void deploy
```

Void builds the app, provisions the D1 resources it detects, applies migrations, and prints the deployment URL. Set `NUXT_PUBLIC_JUMBLE_URL` to that URL in the blog environment.

## The live stage

The preview at the top of this lesson is `http://localhost:5173/preview/1?embed=1` in development and `https://jumble.vantolbennett.com/preview/1?embed=1` in production. The `embed=1` flag lets the app use a compact shell inside the blog.

The blog component renders the browser frame, the stage label, and the “Open app” link. The app never needs to know it is inside an iframe.

## Gotchas

- **Node version.** Void 1.2.1 wants Node 24.21+. A Node 22 runtime will install, warn, and eventually fail at the native worker layer.
- **Build scripts.** Approve `workerd` builds in the workspace. Without it, `workerd` can install without its binary and the dev server will not start.
- **Stage routing.** Do not create eight apps. One app with a stage parameter keeps the data, components, and deploy in one place.
- **Migration warnings.** Stage 1 does not query D1, so the dev server may warn that migrations are missing. Run `void db generate` before stage 2.
- **Iframe limits.** Stage routes should be `noindex`, and the deployment should allow framing only from the blog. Do that before the series is public.

## Recap

You now have the smallest real version of Jumble: a branded Void + Vue app, a typed loader, a stage route, and a deployment path. Stage 2 gives it a menu.

Next: **[The Weekly Menu in D1](/learn/void/02-the-weekly-menu)**.
