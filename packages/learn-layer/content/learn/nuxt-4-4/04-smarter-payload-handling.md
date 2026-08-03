---
title: "Smarter Payload Handling for Cached Routes"
description: "Inline the payload in the initial HTML with payloadExtraction: 'client' and skip the second SSR render that cached routes used to trigger."
series: "nuxt-4-4"
order: 4
feature: "payloadExtraction: 'client' + LRU payload cache"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/34410"]
---

## What's new

Nuxt 4.4 fixes an expensive quirk of payload extraction on cached routes and adds a new `payloadExtraction: 'client'` mode plus a runtime in-memory LRU cache for `_payload.json`.

## Why you'd care

With the ISR/SWR payload extraction from the 4.3 series, the browser would immediately fetch `_payload.json` as a **second request** — which triggered a full SSR re-render of the same page. In serverless, that could spin up a second lambda before the first response finished streaming. Wasteful. 4.4 makes it stop.

## Before

Payload extraction on a cached route meant: render HTML → browser fetches `_payload.json` → server re-renders the whole page just to produce that JSON.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  routeRules: {
    "/products/**": { isr: 3600 },
  },
});
```

Two renders for one page view.

## After

Inline the payload in the initial HTML, and let a runtime cache serve later `_payload.json` requests without re-rendering:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  experimental: {
    payloadExtraction: "client",
  },
});
```

- `'client'` mode inlines the full payload in the first HTML response, while still generating `_payload.json` for client-side navigation.
- The in-memory LRU cache serves `_payload.json` without a full re-render — and it's **active for all users** regardless of this setting.

## Do it yourself

1. Keep your `isr`/`swr` route rules from the 4.3 series.
2. Add `experimental: { payloadExtraction: 'client' }` to `nuxt.config.ts`.
3. Build and preview (`nuxt build` → `nuxt preview`).
4. Load a cached route and watch the network tab — the initial navigation should **not** fire a separate `_payload.json` re-render.
5. Client-navigate to another cached route and confirm `_payload.json` is still used (served from cache).

## Gotchas

- `payloadExtraction: 'client'` becomes the **default** under `compatibilityVersion: 5` — adopting it now is future-proofing.
- The LRU cache is in-memory per server instance. Across many serverless instances each keeps its own cache; that's fine, it still removes the re-render cost.

## Recap

`payloadExtraction: 'client'` inlines the payload and, with the runtime LRU cache, kills the redundant second render on cached routes. Turn it on if you use `isr`/`swr`.
