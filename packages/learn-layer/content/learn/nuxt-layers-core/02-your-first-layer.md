---
title: "Your First Layer"
description: "Four files, no build step, no publish. A layer that ships a component, a composable, a page and shared config — and a way to prove each one crossed the boundary."
series: "nuxt-layers-core"
order: 2
feature: "layers/ directory, app.config merging, auto-imports across layers"
sourceUrl: "https://nuxt.com/docs/4.x/getting-started/layers"
difficulty: "Beginner"
estMinutes: 10
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

The fastest layer you can make lives in `layers/` at your project root, because Nuxt scans that directory for you. No `extends` entry, no package, no install.

```
your-app/
├─ layers/
│  └─ branding/
│     ├─ nuxt.config.ts
│     ├─ app.config.ts
│     └─ app/
│        ├─ components/BrandBadge.vue
│        └─ composables/useBrand.ts
├─ app/
└─ nuxt.config.ts
```

Start the dev server and `<BrandBadge />` is already auto-imported in your pages. Nothing else was configured.

## Why you'd care

Because this is the cheapest way to find out whether a boundary is the right one. Move a feature into `layers/<name>/`, run the app, and see what breaks. Every broken import is a dependency you didn't know that feature had.

If nothing breaks, the boundary was real, and promoting the folder to a package later is a `git mv` (that's the Intermediate series). If ten things break, you've learned something for the price of one folder.

## Before

`app/components/BrandBadge.vue` in the host app, imported by three pages, mentally tagged "branding stuff" and physically indistinguishable from everything else.

## After

```ts
// layers/branding/nuxt.config.ts
export default defineNuxtConfig({
  $meta: { name: "branding" },
});
```

```ts
// layers/branding/app.config.ts
export default defineAppConfig({
  brand: {
    name: "VantolBennett",
    accent: "#f5c542",
  },
});
```

```vue
<!-- layers/branding/app/components/BrandBadge.vue -->
<script setup lang="ts">
const { brand } = useAppConfig();
</script>

<template>
  <span
    class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest"
    :style="{ background: brand.accent, color: '#000' }"
  >
    {{ brand.name }}
  </span>
</template>
```

```ts
// layers/branding/app/composables/useBrand.ts
export function useBrand() {
  const { brand } = useAppConfig();
  return { name: brand.name, accent: brand.accent };
}
```

Now, in the host app, with no import statement anywhere:

```vue
<!-- app/pages/index.vue -->
<template>
  <BrandBadge />
</template>
```

Four things just crossed the boundary: a component (auto-imported), a composable (auto-imported), app config (deep-merged), and — if you add `layers/branding/app/pages/brand.vue` — a route.

`app.config.ts` is worth pausing on. It merges _deeply_ across layers, and the host app wins on conflicts:

```ts
// app/app.config.ts — in the host app
export default defineAppConfig({
  brand: { accent: "#8a5cff" }, // name stays 'VantolBennett', accent is overridden
});
```

That's the pattern for themeable layers: the layer ships defaults, the consumer overrides the keys it cares about, and neither has to know the full shape.

## Do it yourself

1. Create `layers/branding/` with the four files above.
2. Drop `<BrandBadge />` into any page. It works with no import — confirm it, then confirm you didn't accidentally have a component of the same name already.
3. Add `app/app.config.ts` in the host app overriding only `brand.accent`. Reload. The badge changes colour, the name doesn't.
4. Add `layers/branding/app/pages/brand.vue` and visit `/brand`. A layer contributed a route.
5. Rename the folder to `layers/branding-two`. Nuxt hard-restarts and everything still works — the _directory name_ is not the boundary, the config file is.

## Gotchas

- **`app/` inside the layer, not next to it.** Nuxt 4's default `srcDir` is `app/`, and it applies per layer. `layers/branding/components/` is ignored; `layers/branding/app/components/` is scanned. This is the single most common first-layer mistake.
- **`app.config.ts` sits at the layer root**, beside `nuxt.config.ts` — not inside `app/`.
- **Name collisions resolve silently.** Two layers with `BrandBadge.vue` don't error; one wins. Step three covers which.
- **`layers/` auto-scanning is root-relative.** A layer's own `layers/` subdirectory is _not_ recursively scanned into your app — nest deliberately, with `extends`, not by accident.
- **Config in a layer is a fallback, not a mandate.** Anything the host app sets wins. If your layer _must_ enforce something, that's a module, not a layer.

## Recap

A folder in `layers/` with a `nuxt.config.ts` and an `app/` directory is a working layer — components, composables, pages and app config all merge with zero wiring. The host app overrides the layer, never the other way round. Next: the exact rules of who wins.
