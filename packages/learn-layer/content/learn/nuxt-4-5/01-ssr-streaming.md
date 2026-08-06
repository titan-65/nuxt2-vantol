---
title: "Experimental SSR Streaming"
description: "Flush the HTML shell immediately and stream the body as Vue renders — a big Time to First Byte win for content-heavy routes. With the gotchas that matter."
series: "nuxt-4-5"
order: 1
feature: "experimental.ssrStreaming"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/34411"]
---

## What's new

Nuxt 4.5 adds experimental **SSR streaming**: instead of buffering the whole page and sending it in one shot, Nuxt flushes the HTML shell (your `<head>`, styles, preload hints, entry scripts) right away, then streams the body as it renders.

## Why you'd care

Time to First Byte (TTFB) drops dramatically for content-heavy routes, because the browser starts receiving and painting the page immediately. Bots and crawlers still get fully-rendered HTML — streaming is disabled for them automatically.

## Before

Everything was buffered and sent as one response:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  // default: whole page buffered, then sent
});
```

The user's browser waited for the entire render to finish before receiving the first byte.

## After

Turn it on experimentally:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  experimental: {
    ssrStreaming: true,
  },
});
```

Tune which user agents count as crawlers, and opt individual routes out:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  experimental: {
    ssrStreaming: {
      botRegex: /googlebot|bingbot|my-internal-crawler/i,
    },
  },
  routeRules: {
    "/no-stream/**": { streaming: false },
  },
});
```

## Do it yourself

1. Add `experimental: { ssrStreaming: true }` to `nuxt.config.ts`.
2. Build and preview a content-heavy route (e.g. a long blog post).
3. In the Network tab, confirm the response streams rather than arriving all at once (you'll see bytes arriving over time).
4. Add a `/no-stream/**` route rule and confirm that route falls back to buffered rendering.
5. Test a `setResponseStatus()` in a page script to see the dev warning about dropped mutations.

## Gotchas

This is the big one. Because the HTTP status and headers commit with the **first byte**, anything that mutates the response _after_ rendering has begun — `setResponseStatus()` in `<script setup>`, cookie writes in middleware — can't reach the client. Nuxt auto-falls back to the buffered renderer for routes with `redirect`, `cache`, `isr`, `swr`, `noScripts`, or `ssr: false` rules, and logs a dev warning naming any dropped mutations. Audit your response-mutating logic before shipping widely.

## Recap

`experimental.ssrStreaming` flushes the shell first for big TTFB wins; bots get full HTML; mutating status/headers/cookies after streaming starts is dropped (with a dev warning). Test against your response logic first.
