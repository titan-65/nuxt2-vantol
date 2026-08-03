---
title: "The enabled Option for useFetch & useAsyncData"
description: "Gate any data fetching behind a reactive condition — no request fires (or refreshes) until the precondition is met, and cancelling mid-flight keeps your existing data."
series: "nuxt-4-5"
order: 4
feature: "enabled option"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/33260"]
---

## What's new

`useFetch` and `useAsyncData` gain a reactive `enabled` option. While it's `false`, every execution is blocked — the initial fetch, `execute`/`refresh`, and watch triggers. Flip it from `true` to `false` mid-flight and the in-flight request is **cancelled without clearing your existing `data`**.

## Why you'd care

Dependent and conditional queries are everywhere: don't search until the user has typed something, don't fetch a profile until you have an id. Before, you leaned on `watch` + manual guards or `immediate: false` and forgetting to call `refresh`. `enabled` makes the precondition declarative and reactive.

## Before

You guarded with `immediate: false` and remembered to trigger a fetch:

```vue [pages/search.vue]
<script setup lang="ts">
const query = ref("");
const { data } = await useFetch("/api/search", {
  query: { q: query },
  immediate: false, // then you had to remember to call refresh()
});
watch(query, () => {
  /* manually trigger */
});
</script>
```

## After

Pass a getter as `enabled` and let it gate everything:

```vue [pages/search.vue]
<script setup lang="ts">
const query = ref("");

const { data } = await useFetch("/api/search", {
  query: { q: query },
  // Only fetch once the user has typed something
  enabled: () => query.value.length > 2,
});
</script>
```

It stays reactive — typing more updates the query as usual, but nothing fires until the condition holds.

## Do it yourself

1. Recreate the search page above with `enabled: () => query.value.length > 2`.
2. Load the page with an empty query — confirm the network tab shows **no** request.
3. Type two characters, then three — confirm the request only fires after the threshold and re-fires on change.
4. Clear back to empty — confirm the in-flight request is cancelled and existing `data` is kept.
5. Pair `enabled` with a ref instead of a getter for a manually-toggled gate.

## Gotchas

- `enabled` blocks the initial fetch **and** `execute`/`refresh` **and** watch triggers — all of them.
- Cancelling mid-flight preserves your current `data` rather than blanking it, which is usually what you want, but be aware stale data may briefly remain.
- Works with both `useFetch` and `useAsyncData`.

## Recap

`enabled: () => condition` declaratively gates all fetching for `useFetch`/`useAsyncData`. Perfect for dependent/conditional queries, with safe mid-flight cancellation.
