---
title: "The Storefront: Cookie Pages and Box Sizes"
description: "Turn the weekly menu into a real storefront with dynamic cookie pages, typed page props, and a working 4/6/12 box selector."
series: "void"
order: 3
feature: "Dynamic routes + box sizes"
sourceUrl: "https://void.cloud/guide/pages-routing/overview"
difficulty: "Advanced"
estMinutes: 25
img: "/jumble-stage-1.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1767533048/PXL_20251010_202726442_2_hhudfr.jpg"
  website: "https://vantolbennett.vercel.app"
---

Stage 2 put the menu on the page. Stage 3 makes each cookie a destination.

Every card in the menu now links to `/cookies/:slug`. The cookie page gets its data from the same active week, shows the description and price, and lets the reader choose a 4, 6, or 12-pack. The box selection is client state for now; stage 4 turns it into a KV-backed cart.

::JumblePreview{stage="3" height="760"}
::

## What it is

Three pieces make the storefront:

1. A dynamic page: `pages/cookies/[slug].vue` plus `pages/cookies/[slug].server.ts`.
2. A loader that reads the active menu, finds the flavor by slug, and returns the cookie, the week, and the box sizes as typed props.
3. A client-side box selector that updates the selected box and total without navigating.

There is no schema change in this stage. The cookie page is a different view of the data you already seeded.

## Why you'd care

A menu card is a teaser. A cookie page is where the product becomes real: the description, the price, the box math, and the eventual add-to-cart action. It also gives every cookie a shareable URL and a real server-rendered page.

The loader returns the same `MenuFlavor` shape used by the menu, plus the `BoxSize` options. The page component does not import the database, and the database does not know the page exists.

## Box sizes

Keep the box offer in one typed place. It is product configuration, not a database row yet:

```ts [src/boxes.ts]
export type BoxSize = {
  size: number;
  label: string;
  priceCents: number;
  note: string;
};

export const BOX_SIZES: BoxSize[] = [
  { size: 4, label: "4-pack", priceCents: 1600, note: "A small box for a quiet afternoon." },
  { size: 6, label: "6-pack", priceCents: 2250, note: "The table box." },
  { size: 12, label: "12-pack", priceCents: 4200, note: "The party box." },
];
```

When boxes need per-store pricing or promotions, this moves into D1. For the storefront stage, a typed constant is the honest amount of complexity.

## The dynamic route

```ts [pages/cookies/[slug].server.ts]
import { defineHandler, type InferProps } from "void";
import { BOX_SIZES } from "../../src/boxes";
import { CURRENT_STAGE } from "../../src/stages";
import { getActiveMenu } from "../../src/server/menu";

export type Props = InferProps<typeof loader>;

export const loader = defineHandler(async (c) => {
  const slug = c.req.param("slug");
  const embed = c.req.query("embed") === "1";
  const menu = await getActiveMenu();
  const flavor = menu.flavors.find((item) => item.slug === slug) ?? null;

  return {
    stage: CURRENT_STAGE,
    embed,
    week: menu.week,
    flavor,
    boxes: BOX_SIZES,
    backHref: embed ? "/menu?embed=1" : "/menu",
  };
});
```

```vue [pages/cookies/[slug].vue]
<script setup lang="ts">
import type { Props } from "./[slug].server";
import JumbleCookie from "../../src/JumbleCookie.vue";

defineProps<Props>();
</script>

<template>
  <JumbleCookie
    :stage="stage"
    :embed="embed"
    :week="week"
    :flavor="flavor"
    :boxes="boxes"
    :back-href="backHref"
  />
</template>
```

The `embed` query is only for the lesson preview. The real route uses the normal storefront shell and the back link goes to `/menu`.

## The box selector

The selector is local component state. It changes the selected box and the displayed total; the add button stays disabled until stage 4 gives it a cart to write to.

```vue
<script setup lang="ts">
import { computed, ref } from "vue";

const props = defineProps<{ boxes: BoxSize[] }>();

const selectedSize = ref(props.boxes[1]?.size ?? 4);
const selectedBox = computed(
  () => props.boxes.find((box) => box.size === selectedSize.value) ?? props.boxes[0] ?? null,
);
</script>

<template>
  <fieldset class="box-picker">
    <legend>Choose a box</legend>
    <div class="box-options">
      <button
        v-for="box in boxes"
        :key="box.size"
        type="button"
        class="box-option"
        :class="{ 'is-selected': selectedSize === box.size }"
        :aria-pressed="selectedSize === box.size"
        @click="selectedSize = box.size"
      >
        <span class="box-label">{{ box.label }}</span>
        <span class="box-size">{{ box.size }} cookies</span>
        <span class="box-price">{{ price(box.priceCents) }}</span>
      </button>
    </div>
  </fieldset>

  <p v-if="selectedBox">Selected: {{ selectedBox.label }} · {{ price(selectedBox.priceCents) }}</p>

  <button type="button" class="btn" disabled>Add to box — stage 4</button>
</template>
```

The actual component also renders the cookie art, the breadcrumb, the price, and the stage footnote.

## Wiring the menu

The full app links each menu card to its cookie page. The stage 2 preview deliberately keeps the cards inert, because the storefront is a stage 3 feature:

```vue
<script setup lang="ts">
import { Link } from "@void/vue";

const cardComponent = computed(() => (displayStage >= 3 ? Link : "div"));
</script>

<template>
  <component
    :is="cardComponent"
    v-for="flavor in flavors"
    :key="flavor.slug"
    :href="displayStage >= 3 ? `/cookies/${flavor.slug}` : undefined"
    class="menu-card"
  >
    <!-- cookie art + card body -->
  </component>
</template>
```

`Link` comes from `@void/vue` and keeps page navigation inside the Void app.

## Do it yourself

No migration is needed. The table from stage 2 already has everything.

```bash
pnpm dev
```

Open:

```txt
http://localhost:5173/
http://localhost:5173/cookies/sorrel-snickerdoodle
http://localhost:5173/preview/3
```

The full app at `/` is the menu with live links. `/preview/3` is the cookie page in embed mode for this lesson.

Deploy:

```bash
void deploy --platform cloudflare
```

The deploy applies no new migrations; it just ships the new routes and components.

## The live stage

The preview above is `/preview/3`, rendered from the active week and the first flavor. The full app lets you open any of the eight cookies, change the box, and see the total update.

The box selection is intentionally not persisted. Stage 4 adds the KV session and the cart; the disabled button becomes real.

## Gotchas

- **Dynamic params are server data.** `c.req.param("slug")` is the source of truth, not the client route. A flavor that is not in the active week gets the not-found state.
- **No schema change means no migration guilt.** Stage 3 is routes and UI; do not invent a table for three constants.
- **Cents, not floats.** The box total is `priceCents` all the way to the formatter.
- **Do not fake the cart.** The disabled button is deliberate. Stage 4 earns the interaction with KV persistence.
- **The stage 2 menu stays inert in preview.** If you link the cards at stage 2, the preview jumps into a stage 3 route and the stage boundary becomes a lie.

## Recap

Jumble now has a real storefront: the menu, shareable cookie pages, typed props, and a box selector. The only missing piece is persistence.

Next: **[Box + Cart](/learn/void/04-box-and-cart)** — KV sessions, a real cart drawer, and a box that survives a refresh.
