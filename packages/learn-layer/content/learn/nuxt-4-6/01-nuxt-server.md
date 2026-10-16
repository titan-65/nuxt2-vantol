---
title: "nuxt/server: The Server-Agnostic Import Surface"
description: "Import server helpers from nuxt/server instead of h3 or nitropack — portable handlers that run unchanged on Nitro v2, Nitro v3, or the experimental Vite server, and smooth the road to Nuxt 5."
series: "nuxt-4-6"
order: 1
feature: "nuxt/server"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/36275"]
---

## What's new

Nuxt 4.6 adds **`nuxt/server`**, a new import source for server code — handlers, middleware, utilities. It's the server-side complement to `nuxt/app`: your code types against a portable, web-standard `RequestEvent` (`event.req` is a `Request`, `event.url` a `URL`, `event.res.headers` a `Headers`), and Nuxt's default `@nuxt/nitro-server` implementation powers it under the hood. The same handler runs on Nitro v2, Nitro v3, or the experimental `@nuxt/vite-server`.

## Why you'd care

Server code used to import from `h3` and `nitropack` directly, tying every module to whichever majors Nuxt happened to depend on. 4.6 owns the API surface instead: **Nuxt 5 moves to Nitro v3 + h3 v2, and server code written against `nuxt/server` on 4.6 runs unchanged there.** A module can ship one file for both. It also decouples Nuxt from the Nitro release cycle and removes hoisted h3/Nitro types from your app (a source of version-conflict pain for `useRequestEvent`, `$fetch`, and route rules).

## Before

Every handler imported the framework's server packages directly:

```ts [server/api/hello.ts]
import { defineEventHandler, getQuery } from "h3";

export default defineEventHandler((event) => {
  const { name } = getQuery(event);
  return { message: `Hello, ${name ?? "world"}!` };
});
```

That handler is pinned to h3 v1's event shape — a Nuxt 5 / h3 v2 world needs a rewrite.

## After

Import the same-shaped helpers from `nuxt/server` — web standards under the hood:

```ts [server/api/hello.ts]
import { defineEventHandler, getQuery } from "nuxt/server";

export default defineEventHandler((event) => {
  const { name } = getQuery<{ name?: string }>(event);
  return { message: `Hello, ${name ?? "world"}!` };
});
```

The portable event looks like this:

```ts
event.req; // Request
event.url; // URL
event.res; // { status, statusText, headers }
event.res.headers; // Headers
event.context; // per-request context
```

The surface is small but covers what apps and modules need: `defineEventHandler`, `createError`/`isNuxtError`, URL/headers/query, `readBody` (plain, Standard-Schema-validated, or function-validated), cookies, redirects, response status, `getRouterParam(s)`, `getRequestIP`, `handleCors`, `getRouteRules`, `useRuntimeConfig`, `useAppConfig`, and sessions (next step). Validated bodies work with any [Standard Schema](https://standardschema.dev) library:

```ts [server/api/users.post.ts]
import { defineEventHandler, readValidatedBody } from "nuxt/server";
import { z } from "zod";

export default defineEventHandler(async (event) => {
  const user = await readValidatedBody(event, z.object({ name: z.string() }));
  return { created: user.name };
});
```

Don't-migrate escape hatch: nothing was taken away. Import `defineEventHandler` and friends from `h3` or `nitropack/runtime` exactly as before and that handler works as on 4.5.

## Do it yourself

1. Pick one simple GET handler and change its import to `from "nuxt/server"`.
2. Replace any `event.node.req`/`event.node.res` access with `event.req` / `event.res`.
3. Add one `readValidatedBody` POST handler using your schema library of choice.
4. Build the app — the handler typechecks and runs identically under the default Nitro builder.

## Gotchas

This is the big one. **On Nuxt 4, the _auto-imported_ `defineEventHandler`, `getQuery`, `readBody` family is still h3's own helpers, which take a different event shape.** Import from `nuxt/server` explicitly — including `defineEventHandler` — or mixing the two gives you a `NUXT_E8012` error telling you which import to change. Also note three behavior deltas from h3 v1 namesakes: `sendRedirect` _returns_ the response instead of sending it, `createError` takes `status`/`statusText`, and response headers go through `event.res.headers`. Nothing requires a migration — but new server code should start on `nuxt/server`.

## Recap

`nuxt/server` is one portable import surface for server code, typed on web standards, running on Nitro v2/v3 or the Vite server unchanged — write it once on 4.6 and carry it straight into Nuxt 5. Explicit import required; mind the h3 behavior deltas.
