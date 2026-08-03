---
title: "The useLayout Composable"
description: "Read the layout resolved for the current route, reactively — finally a clean way to ask which layout a page is using."
series: "nuxt-4-5"
order: 2
feature: "useLayout composable"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/35623"]
---

## What's new

Nuxt 4.5 adds `useLayout()` — a read-only composable that returns the layout resolved for the current route as a reactive computed ref.

## Why you'd care

Until now there was no clean, reactive way from a component to ask "which layout am I on right now?" You could only declare one (`definePageMeta`, route rules). But some UI needs to _know_ the resolved layout — a badge, a debug indicator, conditional chrome — and stay in sync as route rules or `definePageMeta` change it on navigation.

## Before

You reached for your own state or guessed from the route. No reliable source of truth:

```vue [components/LayoutBadge.vue]
<script setup lang="ts">
// No first-class way to read the resolved layout reactively
const guessed = route.meta.layout;
</script>
```

`route.meta.layout` wasn't reliably the resolved value and didn't update cleanly on navigation.

## After

Ask Nuxt directly:

```vue [components/LayoutBadge.vue]
<script setup lang="ts">
const layout = useLayout();
</script>

<template>
  <span>Current layout: {{ layout }}</span>
</template>
```

It's a read-only computed ref, so it stays in sync as you navigate or as route rules and `definePageMeta` change the resolved layout.

## Do it yourself

1. Add a `LayoutBadge.vue` component using `const layout = useLayout()`.
2. Drop it into a layout-using page and confirm it shows the current layout name.
3. Navigate between a page using the `admin` layout and one using the default.
4. Confirm the badge updates reactively on each navigation.
5. Try it alongside route-rule layouts (from the 4.3 series) to see it reflect the rule-driven layout.

## Gotchas

- It's **read-only** by design. To _change_ the layout, keep using `definePageMeta`, route rules, or `setPageLayout`.
- It reflects the resolved layout, which may come from `definePageMeta`, a route rule, or `setPageLayout` — so the value answers "what's actually applied right now."

## Recap

`useLayout()` gives a reactive read of the current page's resolved layout. Perfect for chrome that needs to know which layout is active — without trying to change it.
