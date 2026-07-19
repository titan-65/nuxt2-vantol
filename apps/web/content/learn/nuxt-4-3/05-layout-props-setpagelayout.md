---
title: "Layout Props with setPageLayout"
description: "Pass props into your layout at runtime — toggle a sidebar or theme from middleware or a page, no global state required."
series: "nuxt-4-3"
order: 5
feature: "setPageLayout second argument"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/33805"]
---

## What's new

The `setPageLayout` composable now takes a **second argument**: props to pass into the layout.

## Why you'd care

Layouts used to be all-or-nothing. If you wanted an admin layout with the sidebar collapsed on some routes, you reached for a store or a global flag. Now you can hand the layout its configuration directly at the moment you select it.

## Before

The layout read shared state to decide how to render:

```ts
// somewhere global
const uiStore = useUiStore()
uiStore.sidebar = true
uiStore.theme = 'dark'
```

The layout and the caller were coupled through a store neither of them owned cleanly.

## After

Select the layout **and** pass its props in one call:

```ts [middleware/admin.ts]
export default defineNuxtRouteMiddleware(() => {
  setPageLayout('admin', {
    sidebar: true,
    theme: 'dark'
  })
})
```

```vue [layouts/admin.vue]
<script setup lang="ts">
defineProps<{
  sidebar?: boolean
  theme?: 'light' | 'dark'
}>()
</script>
```

## Do it yourself

1. Add typed props to `layouts/admin.vue` with `defineProps`.
2. Use those props in the template — e.g. show the sidebar only when `sidebar` is true.
3. In a route middleware, call `setPageLayout('admin', { sidebar: true, theme: 'dark' })`.
4. Visit a route that runs the middleware and confirm the layout renders with those props.
5. Change the props for a different route and confirm the layout responds.

## Gotchas

- Type your `defineProps` so you get autocomplete and catch typos in the prop names passed to `setPageLayout`.
- Props apply to the layout for that navigation. Set them where the decision belongs (middleware for route-wide rules, the page for page-specific ones).

## Recap

`setPageLayout('admin', props)` lets you configure a layout at selection time. Pair it with the route rule layouts from step 1 for a fully declarative layout system.
