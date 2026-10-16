---
title: "Typed $fetch, Rebuilt: No More TS2589"
description: "Opt into experimental.routeTypedFetch — fetchdts compiles your routes into an exact-match table, so type cost scales with call sites, and body/query/headers get checked against what each handler validates."
series: "nuxt-4-6"
order: 3
feature: "experimental.routeTypedFetch"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/36238"]
---

## What's new

Typed `$fetch`/`useFetch` is rebuilt on [`fetchdts`](https://github.com/danielroe/fetchdts), opt-in on Nuxt 4 (default in Nuxt 5). Nuxt compiles your server routes into a route tree — exact-match table for static paths, accessors specialised to your route set — so resolution cost scales with call sites, not route count. Past a few hundred routes the old `InternalApi` typing hit `TS2589: Type instantiation is excessively deep`; the new numbers:

| routes                | before            | after        |
| --------------------- | ----------------- | ------------ |
| 100                   | 1.4M inst / 0.77s | 51k / 0.26s  |
| 300                   | 5.8M / 3.49s      | 51k / 0.16s  |
| 1000                  | 12.8M / 7.44s     | 51k / 0.20s  |
| 3000 (200 call sites) | 71.9M / 53.63s    | 101k / 0.62s |

Peak memory for the same runs dropped from 946 MB to 140 MB.

## Why you'd care

Large apps learned to fear typed fetch — add routes, watch typecheck times explode, sprinkle `as any` to survive. The rebuild makes typed `$fetch` usable at real scale, and it goes further: the route set carries the `body`, `query`, and `headers` each handler validates, so calls are checked against them, not just the path.

## Before

The old typing resolved every call against the full `InternalApi` union — and bodies were unchecked:

```ts
// 300+ routes: risk of TS2589; body shape never verified
await $fetch("/api/users", { method: "post", body: { title: "a", count: "no" } }); // no error (wrong!)
```

## After

One flag, and calls are validated against what the handler declares:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  experimental: {
    routeTypedFetch: true,
  },
});
```

```ts
// server/api/users.post.ts validates { title: string, count: number }
await $fetch("/api/users", { method: "post", body: { title: "a", count: 1 } }); // ✅
await $fetch("/api/users", { method: "post", body: { title: "a", count: "no" } }); // ❌ not assignable to number
await $fetch("/api/users", { method: "post" }); // ❌ body is required
```

Two companions: `experimental.strictRouteTypes` rejects calls to paths that don't exist (otherwise they return `unknown`), and `'isomorphic'` mode types your pages as `GET` routes so `$fetch`-from-renderer calls are checked too.

## Do it yourself

1. Set `experimental: { routeTypedFetch: true }` and run the typecheck — note the time on your route count.
2. Deliberately mistype a `body` at one call site; confirm the error points at the field.
3. Drop the `body` from a required-body call; confirm the "body is required" error.
4. Try `strictRouteTypes` and call a nonexistent path — decide if your codebase wants that strictness now or later.

## Gotchas

Opt-in for a reason: small inference changes ship with it — a `Date` returned by a handler is a `string` at the call site (it crossed JSON). Hand-written `ServerRoutes` augmentations need a small rewrite for the new shape. This is the default in Nuxt 5, so adopting it on 4.6 is pre-paying the migration.

## Recap

`experimental.routeTypedFetch` replaces `InternalApi` typing with a compiled route tree: TS2589 gone, memory down 85%, and `body`/`query`/`headers` checked per call site. Expect `Date`-over-JSON inference changes; rewrite custom `ServerRoutes` augmentations.
