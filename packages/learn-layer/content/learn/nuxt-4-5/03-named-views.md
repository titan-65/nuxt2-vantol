---
title: "Named Views"
description: "Render multiple page outlets from a single route using the name@view.vue convention — Vue Router's named views, wired into Nuxt's file-based routing."
series: "nuxt-4-5"
order: 3
feature: "named views (name@view.vue)"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/35123"]
---

## What's new

Nuxt 4.5 brings **named views** to file-based routing. If a parent page renders more than one `<NuxtPage>` outlet, each outlet gets a name and a sibling page file fills it via the `name@view.vue` convention.

## Why you'd care

Some layouts/pages want a main content area **and** a side area (sidebar, drawer, secondary column) that each render a _different_ page from the same route. Previously you hacked that with components or nested layouts. Now it's a routing convention.

## Before

You approximated multi-outlet pages with manual components or nested layouts:

```vue [pages/parent.vue]
<template>
  <div>
    <NuxtPage />
    <aside>
      <MyHardcodedSidebar />
    </aside>
  </div>
</template>
```

The sidebar couldn't itself be a routable page.

## After

Name the outlets and provide sibling page files:

```
-| pages/
---| parent/
-----| child.vue
-----| child@sidebar.vue
---| parent.vue
```

```vue [pages/parent.vue]
<template>
  <div>
    <NuxtPage />
    <aside>
      <NuxtPage name="sidebar" />
    </aside>
  </div>
</template>
```

Navigating to `/parent/child` renders `child.vue` into the default outlet and `child@sidebar.vue` into the `sidebar` outlet.

## Do it yourself

1. Create `pages/parent.vue` with a default `<NuxtPage />` and a `<NuxtPage name="sidebar" />` inside an `<aside>`.
2. Create `pages/parent/child.vue` and `pages/parent/child@sidebar.vue`.
3. Visit `/parent/child` and confirm both outlets render their respective files.
4. Add a second child (`pages/parent/other.vue`) and navigate between them — the sidebar stays driven by its `@sidebar` sibling.
5. Confirm `definePageMeta` (transitions, layout) is read from the default `child.vue`, not the `@sidebar` file.

## Gotchas

- `definePageMeta` is read from the **default** route file only; the `@view` file doesn't independently set page meta.
- Per-view rendering modes aren't supported — the parent page's mode applies to the default view. Keep that in mind if you mix client/server rendering.

## Recap

Named views let one route fill multiple `<NuxtPage>` outlets via `name@view.vue`. Great for content + sidebar patterns without component hacks.
