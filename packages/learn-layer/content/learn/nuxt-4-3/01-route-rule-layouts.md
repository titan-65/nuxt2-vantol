---
title: "Route Rule Layouts"
description: "Assign layouts to whole route trees from one place, without scattering definePageMeta across every page."
series: "nuxt-4-3"
order: 1
feature: "appLayout route rule"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/31092"]
---

## What's new

Nuxt 4.3 lets you set a page's layout **from route rules** using the new `appLayout` property. No more opening every page just to tell it which layout to use.

## Why you'd care

Picture an admin panel with twenty pages, all needing the `admin` layout. Until now, that meant twenty copies of the same `definePageMeta({ layout: 'admin' })`. Miss one and you get a broken-looking page. `appLayout` moves that decision to a single, declarative place.

## Before

Every page carried its own layout declaration:

```vue [pages/admin/users.vue]
<script setup lang="ts">
definePageMeta({ layout: "admin" });
</script>
```

Repeat that in `admin/settings.vue`, `admin/billing.vue`, `admin/logs.vue`… you get the idea.

## After

Declare it once, for the whole tree, in `nuxt.config.ts`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  routeRules: {
    "/admin/**": { appLayout: "admin" },
    "/dashboard/**": { appLayout: "dashboard" },
    "/auth/**": { appLayout: "minimal" },
  },
});
```

Every page under `/admin` now uses the `admin` layout — and you never touched the page files.

## Do it yourself

1. Make sure you have a layout at `layouts/admin.vue`.
2. Open `nuxt.config.ts` and add a `routeRules` entry mapping `'/admin/**'` to `{ appLayout: 'admin' }`.
3. Create a page at `pages/admin/index.vue` with **no** `definePageMeta` layout call.
4. Run the dev server and visit `/admin`. Confirm the admin layout renders.
5. Add a second page under `/admin` and confirm it inherits the layout too.

::BlogAlert{type="info"}
A page-level `definePageMeta({ layout })` still wins if you need to override a single route inside the tree.
::

## Gotchas

- Route rules match by path pattern — double-check your glob (`/admin/**` vs `/admin/*`). `**` matches nested segments; `*` matches only one.
- This is server-driven config. After editing `nuxt.config.ts`, restart the dev server if the change doesn't pick up.

## Recap

Layouts are now a route-tree concern you can declare centrally with `appLayout` in `routeRules`. Reach for it whenever a whole section shares a layout.
