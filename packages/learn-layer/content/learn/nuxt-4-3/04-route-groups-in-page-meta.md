---
title: "Route Groups in Page Meta"
description: "Parenthesized route-group folders now show up in page meta, so middleware can make decisions based on which group a route belongs to."
series: "nuxt-4-3"
order: 4
feature: "route groups exposed via meta.groups"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/33460"]
---

## What's new

Route groups — folders wrapped in parentheses like `(protected)/` that organize files without affecting the URL — are now exposed in **page meta** as `meta.groups`.

## Why you'd care

Route groups were purely organizational. Now they carry meaning you can read at runtime. That means convention-based authorization: put protected pages in a `(protected)` folder and let one middleware handle them all — no per-page flags.

## Before

To protect pages, you added a marker to each one:

```vue [pages/dashboard.vue]
<script setup lang="ts">
definePageMeta({ requiresAuth: true });
</script>
```

Every protected page needed that line, and forgetting it silently left a page open.

## After

Group the pages by folder, and read the group in middleware:

```vue [pages/(protected)/dashboard.vue]
<script setup lang="ts">
// meta now includes: { groups: ['protected'] }
useRoute().meta.groups;
</script>
```

```ts [middleware/auth.ts]
export default defineNuxtRouteMiddleware((to) => {
  if (to.meta.groups?.includes("protected") && !isAuthenticated()) {
    return navigateTo("/login");
  }
});
```

## Do it yourself

1. Create a folder `pages/(protected)/` and move a page like `dashboard.vue` into it.
2. Confirm the URL is still `/dashboard` — the group name never appears in the path.
3. Add a global middleware at `middleware/auth.global.ts`.
4. In it, check `to.meta.groups?.includes('protected')` and redirect unauthenticated users.
5. Visit `/dashboard` signed out and confirm the redirect fires.

## Gotchas

- The group name is the folder name **without** the parentheses: `(protected)` → `'protected'`.
- A route can belong to nested groups; `meta.groups` is an array, so always use `.includes()` rather than `===`.

## Recap

`meta.groups` turns route-group folders into runtime-readable labels. It's the cleanest way to do route-level authorization without touching every page.
