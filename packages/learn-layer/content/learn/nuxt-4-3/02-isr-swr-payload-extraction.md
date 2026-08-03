---
title: "ISR / SWR Payload Extraction"
description: "Cached pages can now generate _payload.json files, so client navigation and CDNs reuse data instead of re-fetching it."
series: "nuxt-4-3"
order: 2
feature: "Payload extraction for ISR/SWR/cache route rules"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/33467"]
---

## What's new

Payload extraction now works with **ISR** (incremental static regeneration), **SWR** (stale-while-revalidate), and `cache` route rules. Previously only fully pre-rendered pages produced `_payload.json` files.

## Why you'd care

A payload file is the page's data, serialized. When it exists, client-side navigation to that page reuses the cached data instead of hitting your API again. Before 4.3, ISR/SWR pages couldn't do this — every navigation re-fetched. Now they can, and CDNs (Vercel, Netlify, Cloudflare) can cache the payload right next to the HTML.

## Before

An ISR product page revalidated its HTML on a schedule, but client navigation still fired fresh API calls for the data:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  routeRules: {
    "/products/**": { isr: 3600 },
  },
});
```

HTML: cached. Data on client nav: re-fetched every time.

## After

Same config — but now Nuxt also emits a cached `_payload.json`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  routeRules: {
    "/products/**": {
      isr: 3600, // revalidate hourly; payload cached alongside
    },
  },
});
```

Client navigation to `/products/123` can now serve data straight from the cached payload — fewer API calls, faster transitions.

## Do it yourself

1. Add an `isr` route rule for a data-driven section, e.g. `'/products/**': { isr: 3600 }`.
2. In that page, load data with `useAsyncData` / `useFetch` as normal.
3. Build and preview the app (`nuxt build` then `nuxt preview`).
4. Navigate to a product page, then use client-side links to move between products.
5. Watch the network tab — data should come from the cached payload, not repeated API calls.

## Gotchas

- This is a production/caching behavior. You won't see the full effect with a plain `nuxt dev` server unless payload extraction in dev is enabled (that's the next step).
- Payloads are only as fresh as your ISR/SWR window — pick a revalidation interval that matches how often the data actually changes.

## Recap

Caching route rules now extract payloads too, so cached pages stop re-fetching their data on client navigation. Turn it on wherever you already use `isr`, `swr`, or `cache`.
