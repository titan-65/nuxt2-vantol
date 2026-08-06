---
title: "The refresh Option for useCookie"
description: "Extend a cookie's expiration without changing its value — clean sliding-session behavior with one new option."
series: "nuxt-4-4"
order: 5
feature: "useCookie refresh option"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/33814"]
---

## What's new

`useCookie` gains a `refresh` option that extends the cookie's expiration each time you set it — even when the value doesn't change.

## Why you'd care

Sliding sessions are the classic case: keep a user logged in as long as they're active by pushing the expiry forward on each request. Before, re-setting the same value didn't reliably refresh `maxAge`, so you fought the cookie API to keep sessions alive.

## Before

Extending expiry without a value change was awkward — you'd nudge the value or manually re-issue the cookie to force a new `maxAge`.

```ts
const session = useCookie("session-id", { maxAge: 60 * 60 });
// Re-assigning the same value didn't dependably extend expiration
session.value = session.value;
```

## After

Opt into refresh and re-assigning the same value slides the window forward:

```ts
const session = useCookie("session-id", {
  maxAge: 60 * 60,
  refresh: true,
});

// Extends expiration each time, even with the same value
session.value = session.value;
```

## Do it yourself

1. Create a cookie with `useCookie('session-id', { maxAge: 60, refresh: true })`.
2. In a middleware or on a user action, run `session.value = session.value`.
3. Inspect the cookie in devtools and note the `Expires`/`Max-Age` moving forward.
4. Compare against a cookie **without** `refresh: true` and confirm its expiry stays put.
5. Wire it into a real "keep me signed in while active" flow.

## Gotchas

- Refresh only makes sense with a `maxAge` (or `expires`) set — there's nothing to slide otherwise.
- This extends the session on activity; it doesn't cap total session length. If you need an absolute timeout, track that separately.

## Recap

`useCookie(name, { maxAge, refresh: true })` gives you sliding-expiration cookies without value hacks. The go-to for active-session extension.
