---
title: "Quick Hits & the Nuxt 5 Runway"
description: "The rest of Nuxt 4.6 — compatibilityVersion 5 flags, experimental vite-server, NuxtLink SSR diet, early-404, payload controls, useFetch addons, module-author APIs — and what to adopt now."
series: "nuxt-4-6"
order: 6
feature: "Round-up: Nuxt 5 flags, perf, addons, module APIs"
sourcePRs: ["https://github.com/nuxt/nuxt/releases/tag/v4.6.0"]
---

The rest of 4.6 in quick-hit form — enough to recognize each change and reach for it when it matters.

## Nuxt 5 features, today

Most of Nuxt 5 is already in 4.6, on by default or behind a flag. `future.compatibilityVersion: 5` turns the Nuxt 5 defaults on at once (toggle each individually too):

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  future: {
    compatibilityVersion: 5,
  },
});
```

New to the flag in 4.6: typed pages, typed `$fetch`, case-sensitive routing, `navigateTo` early-return in setup, build-time extraction of serializable `definePageMeta`, client payload extraction, no `baseUrl` in generated tsconfigs, inline error rendering, normalized page names, `clearNuxtState` resetting to defaults, `watcher: 'builder'`, and no auto-imported server-only head composables. The upgrade guide lists exactly what the flag changes — read it before flipping in a big app.

## Experimental `@nuxt/vite-server`

`server.builder` accepts a second builder: `@nuxt/vite-server` (shorthand `'vite'`, default stays `'nitro'`). Pure-Vite server builds via the Vite Environment API — SPA, SSR with a small Node entry, web-standard `fetch` handlers (e2e examples for Cloudflare Workers, Netlify, universal-deploy), or static output. No storage/caching/tasks/server plugins; highly experimental, API will change. Its real job today: enforcing the `nuxt/server` contract and giving deploy-target Vite plugins something to build on. Most apps stay on Nitro.

## Performance worth knowing

- `<NuxtLink>` renders on the server as a plain `<a>` — no `useLink`, no reactive state. 200 links: 1.36ms → 0.57ms, faster than bare `<RouterLink>`. SSR throughput on a 300-link page: 110 → 140 req/s.
- `experimental.early404` compiles page routes into a static matcher at build time; unmatched requests skip Vue app creation entirely (JSON 404 on a 30-page app: 37.1ms → 0.3ms).
- `useAsyncData`/`useFetch` accept `serialize: false` to keep data out of the payload; `experimental.stripNeverHydratedData` applies it inside `hydrate-never` trees. Dev warns when a page payload exceeds 100 kB.
- One client prefetch scheduler for chunks/layouts/middleware/payloads/islands/hints — per-kind concurrency caps, dedup, cancellation on navigate-away. Prefetch hints throttled and prioritised.
- Templates declare invalidation deps — editing a component regenerates 0 of 49 core templates.
- Overall: starter build 4.4s → 3.6s; `@nuxt/kit` install 6.4MB → 2.1MB.

## `useFetch`/`useAsyncData` addons

`createUseFetch`/`createUseAsyncData` take an `addons` option — declare call-site options, adjust merged options, wrap with middleware, extend the return. Refresh-on-focus, polling, auth headers: build them as reusable addons instead of waiting on core:

```ts [app/composables/useApiFetch.ts]
const refreshOnFocus = defineUseFetchAddon({
  setup: (options) => {
    if (import.meta.server || !options.refreshOnFocus) return;
    return (asyncData) => {
      const focused = useWindowFocus();
      watch(focused, (focused) => focused && asyncData.refresh());
      return { focused };
    };
  },
});

export const useApiFetch = createUseFetch({ baseURL: "/api", addons: [refreshOnFocus] });
```

## DX small wins

Top-level `prerender` option (alias for `nitro.prerender`, like `runtimeConfig`/`routeRules` are top-level); clickable file paths in terminal output; hover docs for built-in components in templates; `<NuxtLink>` to `public/` files falls through to full-page load without `external`; component renames refresh imports; `app/types/` + `server/types/` picked up by the right tsconfig; augmentable `NuxtPageMeta`; `(group)/` folders excluded from component names; dev warns when `public/` shadows a route.

## For module authors

`addServerHandler`/`addDevServerHandler`/`addNitroPlugin` accept per-server-API variant maps (`nuxt` vs `nitro2`) — a pure-`nuxt/server` handler needs no variants. Plus augmentable `ServerTypes`/`ServerRoutes`/`AppRouteRules`/`NuxtRequestContext`, `deriveSecret`, `useTerminal` for CLI-panel output, `module:before`/`module:done` hooks, `onConfigResolved`/`diffNuxtConfig`, `ensureDependencyInstalled`, template `dependencies`, `addServerImports` across Nitro versions, explicit `@nuxt/kit` public API, wider kit peer ranges.

:::BlogAlert{type="warning"}
4.6's Node floor is `^22.22.3 || ^24.15.0 || >=26.0.0` — CI images on older Node break at upgrade time. Nuxt 3 is end-of-life (no 3.x alongside this release). Adopt `compatibilityVersion: 5` per-flag in big apps, not all at once.
:::

## Recap

That's Nuxt 4.6 — the hands-on steps cover `nuxt/server`, sessions, typed `$fetch`, CLI v4, and Vapor + errors. The runway items (v5 flags, vite-server, addons, module APIs) are adopt-on-purpose, not adopt-by-upgrade. On to the next release.
