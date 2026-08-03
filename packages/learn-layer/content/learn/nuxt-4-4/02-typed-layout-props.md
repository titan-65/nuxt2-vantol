---
title: "Typed Layout Props in definePageMeta"
description: "Pass fully-typed props to a layout straight from a page's definePageMeta — no provide/inject, with autocomplete and type-checking."
series: "nuxt-4-4"
order: 2
feature: "definePageMeta layout props"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/34262", "https://github.com/nuxt/nuxt/pull/34409"]
---

## What's new

In 4.3 you could pass layout props via `setPageLayout`. Nuxt 4.4 lets you do it **declaratively from a page** inside `definePageMeta` — and the props are **fully typed** against the layout's own `defineProps`.

## Why you'd care

For page-specific layout config (a title, a sidebar toggle), middleware was the wrong home. Now the page that knows its own needs declares them, and the compiler checks you passed the right shape.

## Before

You reached for `provide`/`inject` or a store to parameterise a layout per page:

```vue [pages/dashboard.vue]
<script setup lang="ts">
provide("layoutTitle", "Dashboard");
provide("layoutSidebar", true);
</script>
```

Untyped, easy to typo, and the coupling was invisible.

## After

Declare the layout and its props together, with types enforced:

```vue [pages/dashboard.vue]
<script setup lang="ts">
definePageMeta({
  layout: {
    name: "panel",
    props: {
      sidebar: true,
      title: "Dashboard",
    },
  },
});
</script>
```

```vue [layouts/panel.vue]
<script setup lang="ts">
defineProps<{
  sidebar?: boolean;
  title?: string;
}>();
</script>
```

If `panel` defines those props, you get autocomplete and type-checking on the `props` object in `definePageMeta`.

## Do it yourself

1. Add typed `defineProps` to `layouts/panel.vue` (`sidebar?`, `title?`).
2. In a page, set `definePageMeta({ layout: { name: 'panel', props: { title: 'Dashboard', sidebar: true } } })`.
3. Render `title` and `sidebar` in the layout template.
4. Confirm the page shows its props applied.
5. Pass a wrong type (e.g. `sidebar: 'yes'`) and confirm the type error surfaces.

## Gotchas

- This is the page-driven counterpart to 4.3's `setPageLayout(name, props)`. Use `definePageMeta` for static per-page config; use `setPageLayout` when the decision is dynamic (middleware, runtime conditions).
- Typing only works if the layout declares `defineProps` — an untyped layout gives you an untyped `props` object.

## Recap

`definePageMeta({ layout: { name, props } })` gives each page a typed way to configure its layout. Cleaner and safer than provide/inject.
