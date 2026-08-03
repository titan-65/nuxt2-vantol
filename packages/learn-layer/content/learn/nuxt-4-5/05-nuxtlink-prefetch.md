---
title: "NuxtLink Prefetch Control for Custom Slots"
description: "When you use NuxtLink with custom, the slot now exposes prefetch, prefetched, and shouldPrefetch so you can wire prefetching onto your own markup."
series: "nuxt-4-5"
order: 5
feature: "NuxtLink custom prefetch slot"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/34539"]
---

## What's new

When you use `<NuxtLink custom>`, Nuxt no longer attaches prefetch handlers for you — it can't know how you structured your markup. So 4.5 exposes everything you need in the slot scope: `prefetch`, `prefetched`, and `shouldPrefetch`.

## Why you'd care

Custom-slot links (button-styled links, cards, menu items) used to lose prefetch behavior silently. Now you can reattach it properly — and reflect prefetched state in your UI (e.g. a subtle "preloaded" style). It respects the user's connection and config via `shouldPrefetch`.

## Before

With `custom`, you got `href` and `navigate`, but no clean hook for prefetching:

```vue
<NuxtLink v-slot="{ href, navigate }" to="/about" custom>
  <a :href="href" @click="navigate">About</a>
</NuxtLink>
```

No prefetch — the link behaved like a plain `<a>`.

## After

Wire prefetch onto your own events:

```vue
<NuxtLink v-slot="{ href, navigate, prefetch, prefetched, shouldPrefetch }" to="/about" custom>
  <a
    :href="href"
    :class="{ 'is-prefetched': prefetched }"
    @click="navigate"
    @pointerenter="shouldPrefetch('interaction') && prefetch()"
    @focus="shouldPrefetch('interaction') && prefetch()"
  >
    About page
  </a>
</NuxtLink>
```

`prefetch` triggers it; `prefetched` tells you it already happened (great for a prefetched class); `shouldPrefetch` respects connection/config.

## Do it yourself

1. Create a custom-slot `NuxtLink` to `/about` with the markup above.
2. Hover/point at it and confirm the `is-prefetched` class is applied after prefetching.
3. Throttle your connection (DevTools Network throttling) and confirm `shouldPrefetch` can return false so you don't waste bandwidth.
4. Move the prefetch trigger to a click-wrapper or keyboard handler to match your component's interaction model.

## Gotchas

- Only on `custom` mode — the normal `<NuxtLink>` already prefetches; this is for when you render your own anchor.
- `shouldPrefetch('interaction')` gates on the user's actual connection and your config. Don't bypass it by calling `prefetch()` unconditionally on hover — you'd prefetch on slow links too.
- `prefetch` and `navigate` are separate concerns; calling `navigate` does not prefetch.

## Recap

`<NuxtLink custom>` now exposes `prefetch`, `prefetched`, and `shouldPrefetch` so you can restore (and style) prefetching on fully custom markup. Honor `shouldPrefetch` before firing.
