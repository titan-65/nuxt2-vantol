---
title: "Precedence and Overrides"
description: "Your project always wins, then extends in the order you wrote it. The rule is three sentences long — the useful part is knowing which things override and which things merge."
series: "nuxt-layers-core"
order: 3
feature: "_layers ordering, file overrides, array vs object merging"
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

Nuxt flattens every layer into one ordered list, `nuxt.options._layers`. Position 0 is your own project. Then your `extends` entries, in the order you wrote them. Earlier means higher priority.

```ts
export default defineNuxtConfig({
  extends: ["./layers/theme", "@acme/base"],
});

// _layers = [ your-project, ./layers/theme, @acme/base ]
//              highest ─────────────────────────► lowest
```

Everything follows from that list:

- **Same-named component or composable?** Highest-priority layer wins, the rest are shadowed.
- **Same route path?** Highest-priority layer's page renders.
- **Config values?** Deep-merged, with higher priority overwriting scalars.
- **Config arrays** (`modules`, `css`, `plugins`)? Concatenated, not replaced.
- **Hooks?** All of them run. Layers don't shadow each other's hooks — they stack, lowest priority first.

## Why you'd care

Because "override one file from a layer" is the whole reason layers beat copy-paste, and because the array rule is the one that bites.

Overriding is what makes a base layer survivable. You inherit forty files and disagree with one. You don't fork the layer — you create the same path in your app:

```
@acme/base/app/components/SiteFooter.vue   ← the layer's version
app/components/SiteFooter.vue              ← yours. This one renders.
```

No config, no flag. Same name, higher layer, done.

## Before

The wrong instinct — copying the layer's whole component directory into your app "so I can change the footer", and inheriting a maintenance problem for one file.

## After

One file in your app shadows one file in the layer. The other thirty-nine keep updating when the layer updates.

If you need the original as a starting point, import it explicitly rather than re-implementing:

```vue
<script setup lang="ts">
// The layer's version is still on disk — reach for it by path when you only
// want to wrap it, not replace it.
import BaseFooter from "@acme/base/app/components/SiteFooter.vue";
</script>

<template>
  <div class="border-t border-white/10">
    <BaseFooter />
    <p class="text-xs text-zinc-500">Extra line only this app needs.</p>
  </div>
</template>
```

The array rule, concretely — this is where people expect override behaviour and get concatenation:

```ts
// @acme/base/nuxt.config.ts
export default defineNuxtConfig({
  modules: ["@nuxt/image"],
  css: ["@acme/base/assets/base.css"],
});

// your nuxt.config.ts
export default defineNuxtConfig({
  extends: ["@acme/base"],
  modules: ["@nuxt/content"],
  css: ["~/assets/app.css"],
});

// result: modules = ['@nuxt/content', '@nuxt/image']
//         css     = ['~/assets/app.css', '@acme/base/assets/base.css']
```

You cannot _remove_ a module a layer added by re-declaring `modules`. If a layer's module is optional, the layer should gate it behind its own config key — which is the layer author's job, not yours.

## Do it yourself

1. In `layers/branding/app/components/`, keep `BrandBadge.vue`. Create `app/components/BrandBadge.vue` in the host app with different markup. Reload — yours renders.
2. Delete your copy. The layer's version comes back. That round trip is the entire override story.
3. Add a second layer that also defines `BrandBadge.vue`, and reorder the `extends` array. Watch which one wins follow the array order.
4. Print the resolved list and read it top to bottom:

```ts
hooks: {
  'modules:done': (nuxt) => {
    console.table(nuxt.options._layers.map((l, i) => ({
      priority: i,
      name: l.config?.$meta?.name ?? '(unnamed)',
      cwd: l.cwd,
    })))
  },
}
```

Name every layer with `$meta.name`. An unnamed layer in that table is a layer you'll misidentify at 3am.

## Gotchas

- **Overriding by filename, not by component name.** `app/components/BrandBadge.vue` shadows the layer's `app/components/BrandBadge.vue`. If the layer's file is at `app/components/brand/Badge.vue`, the resolved _name_ may match while the _path_ doesn't — and which wins depends on registration priority, not on what you intended. Match the path.
- **Pages override by route, not by file path.** `app/pages/learn/index.vue` and a layer's `app/pages/learn.vue` both claim `/learn`. Two files, one route, one loser.
- **Arrays concatenate.** `modules`, `css`, `plugins`, `extends` itself. Expect additive behaviour and you'll never be surprised.
- **Hooks all fire.** A layer's `build:before` doesn't replace yours. If two layers both mutate the same config in a hook, order — lowest priority first — decides the final value.
- **Nitro server routes follow the same precedence**, but a duplicate route is much harder to spot than a duplicate component. Namespace your layer's server routes under a prefix it owns.

## Recap

`_layers[0]` is you; `extends` follows in declaration order; earlier wins. Files override by path, config deep-merges, arrays concatenate, hooks stack. That's the complete mental model — the rest of this series is about doing real work inside it.

Next: **[Nuxt Layers: Going Further](/learn/nuxt-layers-intermediate)** — promoting a folder to a workspace package, and the path bugs that come with it.
