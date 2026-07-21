---
title: "Server Persistence & TTL"
description: "Add Nitro routes behind an opt-in flag, back them with a store that forgets on a timer, and see why one shared instance is the difference between working and silently broken."
series: "nuxt-modules"
order: 4
feature: "addServerHandler, Nitro routes, in-memory TTL store"
sourceUrl: "https://nuxt.com/docs/4.x/api/kit/nitro"
difficulty: "Intermediate"
estMinutes: 13
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Two Nitro routes — `POST` and `GET /api/_presence/wall` — over an in-memory store where every signature carries an expiry. Registered only when the user opts in with `wall.server: true`.

## Why you'd care

Modules that add server routes unconditionally are rude. A client-only install should ship zero endpoints. And a store with a TTL is a small enough problem to get exactly right, which makes it a good place to learn what "shared state in a Nitro app" actually means.

## Before

Signatures live in one browser tab and die on refresh.

## After

Signatures survive reloads and are visible to every visitor, until they age out.

## Do it yourself

### 1. A store that forgets

```ts
// src/server/utils/wallStore.ts
export function createWallStore(opts: WallStoreOptions): WallStore {
  const items: StoredSignature[] = [];

  function evictExpired(): void {
    const now = Date.now();
    while (items.length > 0 && items[0]!.expiresAt <= now) {
      items.shift();
    }
  }

  function add(input: SignatureInput): StoredSignature {
    evictExpired();
    const now = Date.now();
    const sig: StoredSignature = {
      ...input,
      id: makeId(),
      createdAt: now,
      expiresAt: now + opts.ttlSeconds * 1000,
    };
    items.push(sig);
    if (items.length > opts.maxSignatures) {
      items.splice(0, items.length - opts.maxSignatures);
    }
    return sig;
  }

  function list(): StoredSignature[] {
    evictExpired();
    return [...items];
  }

  return { add, list, clear };
}
```

No timers. Eviction happens on read and on write, which means no background interval to leak and no work done while nobody's looking. The array is fine here precisely because the TTL is uniform — insertion order *is* expiry order, so eviction only ever shifts from the front.

### 2. One store, not one per route

```ts
let shared: WallStore | undefined;

export function getWallStore(opts: WallStoreOptions): WallStore {
  shared ??= createWallStore(opts);
  return shared;
}
```

::BlogAlert{type="warning"}
This is the bug worth internalising. If `wall.post.ts` and `wall.get.ts` each call `createWallStore(...)` at module scope, you get **two** stores. `POST` writes to one, `GET` reads the other, and the wall is permanently empty — with no error anywhere. Shared server state needs one owner.
::

### 3. The routes

```ts
// src/server/api/wall.post.ts
export default defineEventHandler(async (event) => {
  const { ttlSeconds, maxSignatures }: WallStoreOptions = useRuntimeConfig(event).presence;
  const store = getWallStore({ ttlSeconds, maxSignatures });

  const body = await readBody<{ text?: unknown; x?: unknown; y?: unknown }>(event);

  if (
    typeof body?.text !== "string" ||
    body.text.length === 0 ||
    body.text.length > MAX_TEXT_LENGTH ||
    typeof body.x !== "number" ||
    typeof body.y !== "number"
  ) {
    setResponseStatus(event, 400);
    return { error: "invalid_signature" };
  }

  if (store.list().length >= maxSignatures) {
    setResponseStatus(event, 429);
    return { error: "wall_full" };
  }

  return { ok: true, signature: store.add({ /* ... */ }) };
});
```

The route reads its limits from runtime config rather than hardcoding them — otherwise `wall.ttlSeconds` in someone's `nuxt.config.ts` would be a lie.

### 4. Register them only when asked

```ts
if (resolved.wall.server) {
  // Private config — the routes need the TTL/cap, the browser does not.
  nuxt.options.runtimeConfig.presence = {
    ttlSeconds: resolved.wall.ttlSeconds,
    maxSignatures: resolved.wall.maxSignatures,
  };

  for (const method of ["post", "get"] as const) {
    addServerHandler({
      route: "/api/_presence/wall",
      method,
      handler: resolve(`./server/api/wall.${method}`),
    });
  }
}
```

Because the routes don't exist when the flag is off, they need no "am I enabled?" guard inside them. Deleting that guard is the smaller, better version.

## Gotchas

- **`#imports` doesn't typecheck outside a Nuxt build.** It's a virtual alias. In module server code, import `useRuntimeConfig` from `nitropack/runtime` and h3 helpers from `h3`, and add both as devDependencies.
- **Nitro's runtime config is index-signature typed**, so destructuring gives you `any`. Annotate the destructure to pin it back down.
- **Namespace your routes.** `/api/_presence/*` is unlikely to collide; `/api/wall` absolutely will.
- **Validate at the boundary.** `readBody` returns whatever was sent. Check types, check length, then store.
- **Restarts empty the wall.** That's intended here — the wall is ephemeral by design. Say so in your README before someone files it as a bug.

## Recap

Register routes only when the feature is on, keep one shared store, evict on access, and read limits from runtime config. Next: make those options real and typed.
