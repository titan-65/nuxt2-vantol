---
title: "Quick Hits & What to Watch"
description: "The rest of Nuxt 4.5 — Vite 8, Rspack 2, stable error codes, forwarded preload hints, import.meta.envName, tracing channels — plus the Nuxt 5 groundwork to know about."
series: "nuxt-4-5"
order: 6
feature: "Round-up: build layer, DX, observability, Nuxt 5"
sourcePRs: ["https://github.com/nuxt/nuxt/releases/tag/v4.5.0"]
---

The rest of Nuxt 4.5 in quick-hit form — enough to recognize each change and reach for it when it matters.

## Vite 8

Nuxt now runs on [Vite 8](https://vite.dev) — faster cold starts, Rolldown internals, transparent for most apps. If you have custom Vite plugins or `vite.config` tweaks, skim the [Vite migration guide](https://vite.dev/guide/migration) first. A major bump: verify direct Vite dependencies before shipping to production.

## Rspack 2 + Rsbuild

If you use `builder: 'rspack'`, you're now on Rspack 2 built on [`@rsbuild/core`](https://rsbuild.dev). Same `builder: 'rspack'` opt-in, same `rspack:*` hooks — but the dev server runs in middleware mode via Rsbuild, with an Rspack-specific Vue loader for correct SSR scoped-style ids. Review custom Rspack config.

## Stable error codes

Nuxt now ships a stable error/warning code system ([nostics](https://nostics.dev/)). Errors carry codes like `NUXT_E1001` or `NUXT_B5001`, with a why/fix inline and docs pages for the big ones (e.g. the "composable called outside Nuxt context" case links to `/docs/errors/e1001`). The verbose text is stripped from production builds, leaving just the greppable code. Great for grepping your logs.

## Forwarded preload hints on prefetch

Opt-in `experimental.prefetchPreloadTags` forwards the destination's `<link rel="preload">`/`modulepreload` hints into the **current** document (as `rel="prefetch"`) when you prefetch a route. Heavy next-page assets (hero image, critical script) start downloading while the user is still on the current page. Off by default — try it and report back.

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  experimental: { prefetchPreloadTags: true },
});
```

## import.meta.envName

The resolved environment name is available as `import.meta.envName` for Vite and webpack/Rspack builds (`--envName` or resolved default). Branch on it in app code:

```ts
if (import.meta.envName === "staging") {
  // staging-only behaviour
}
```

## Tracing channels for SSR events

Nuxt emits [diagnostics-channel](https://nodejs.org/api/diagnostics_channel.html) traces for `nuxt.render`, `nuxt.island`, `nuxt.data`, and `nuxt.plugin`. Turn them on with `tracingChannel: true` and build OpenTelemetry on top. Works in Node, Deno, Bun, and Cloudflare Workers.

## TypeScript plugin + named layout slots

`experimental.typescriptPlugin` (powered by `@dxup/nuxt`) adds renamed-component refactoring, glob/Nitro/go-to-definition. New in 4.5: opt-in **runtime** named layout slots — a page can fill a layout's named `<slot>`:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  experimental: { typescriptPlugin: true },
  dxup: { features: { namedLayoutSlots: true } },
});
```

## Performance & reliability

- **Shared file watcher** (opt-in `experimental.watcher: 'builder'`) — piggybacks on Vite's chokidar instead of a second watcher; becomes default under `compatibilityVersion: 5`.
- Faster dev startup, leaner prod builds (skips island-renderer chunk when unused), tree-shaken plugin handling, stable island hashing.
- `$fetch` is now auto-imported in user code; honors `HTTP_PROXY`/`HTTPS_PROXY`; HMR for `defineNuxtComponent` in JSX.

## Nuxt 5 groundwork

This release is heavy on v5 plumbing: `unhead` v3 (synchronous, smaller, stricter `useHead` types — possible _type_ breaking changes), `unctx` v3 (fixes async context issues), Nuxt's own build moved to `tsdown`, and a stable `nuxt/*` build output contract. You can opt into breaking v5 changes today with `future.compatibilityVersion: 5`. **Nuxt 3 hits end-of-life July 31, 2026** — if you're still on v3, now's the time to move.

::BlogAlert{type="warning"}
Three major bumps this release (Vite 8, Rspack 2, unhead v3). For most apps they're transparent, but check custom Vite plugins, Rspack config, and `useHead` typings before upgrading in production. Run `npx nuxt upgrade --dedupe`.
::

## Recap

That's Nuxt 4.5 — the biggest in a while. The hands-on steps (1–5) cover streaming, `useLayout`, named views, the `enabled` option, and custom-slot prefetch. The quick hits modernize the build layer and lay the ground for v5. On to the next release.
