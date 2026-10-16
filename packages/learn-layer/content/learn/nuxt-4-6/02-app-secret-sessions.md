---
title: "appSecret & Sessions: Sealed Cookies, Zero Storage"
description: "Configure one root NUXT_APP_SECRET, derive per-module secrets, and ship stateful-feeling features with iron-sealed cookie sessions — no database, no store."
series: "nuxt-4-6"
order: 2
feature: "runtimeConfig.appSecret + useSession"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/35874", "https://github.com/nuxt/nuxt/pull/36358"]
---

## What's new

Nuxt 4.6 adds a root application secret — `runtimeConfig.appSecret`, set with `NUXT_APP_SECRET` — plus a session helper in `nuxt/server` built on it. Modules and server features derive their own secrets via `deriveSecret(purpose)`, so it's the only secret you configure. Sessions are sealed into a cookie with [iron](https://github.com/brc-dd/iron-webcrypto): no server-side storage to set up.

## Why you'd care

"Remember this visitor / this draft / this A-B bucket" used to mean reaching for a database, Redis, or an auth library. For lightweight per-visitor state, sealed cookie sessions are the boring answer: tamper-proof, zero infrastructure, works on every deploy target including edge.

## Before

Per-visitor state meant storage wiring before the first line of feature code:

```ts [server/api/visits.ts]
// before: pick a store, configure it, handle TTLs and eviction…
// (or pull in a full session library for a counter)
```

## After

Generate one secret, then treat sessions like local state:

```bash
openssl rand -base64 32
```

```bash [.env]
NUXT_APP_SECRET="<output from above>"
```

```ts [server/api/visits.ts]
import { defineEventHandler, useSession } from "nuxt/server";

export default defineEventHandler(async (event) => {
  const session = await useSession<{ visits: number }>(event);
  await session.update((data) => ({ visits: (data.visits ?? 0) + 1 }));
  return { visits: session.data.visits };
});
```

In development Nuxt generates and persists a secret if none is configured (warning the first time a derived secret is used). Builds never generate one — production without `NUXT_APP_SECRET` fails loudly instead of silently sharing a secret.

## Do it yourself

1. Add `NUXT_APP_SECRET` to `.env` (generate with `openssl rand -base64 32`).
2. Add the `visits` handler above; hit it twice and watch the counter climb with no database involved.
3. Inspect the cookie — opaque sealed blob, nothing readable client-side.
4. Call `deriveSecret("my-module")` in a second feature to see per-purpose derivation.

## Gotchas

Cookie size is your budget: sealed sessions ride on every request, so keep payloads small (counters, flags, ids — not documents). `runtimeConfig.app*` keys are reserved for Nuxt — don't park your own config under that prefix. And remember sessions prove _integrity_, not _confidentiality upgrades_: iron seals, but don't stuff secrets the user shouldn't hold into one.

## Recap

One `NUXT_APP_SECRET`, `useSession(event)` for sealed cookie state, `deriveSecret(purpose)` for module keys. Dev auto-generates; production requires the env var. Keep session payloads tiny.
