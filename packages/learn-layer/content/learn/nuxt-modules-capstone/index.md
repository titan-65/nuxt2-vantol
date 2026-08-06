---
title: "Nuxt Modules Capstone: The Signed Build"
description: "The build-time half of a module doing real work — an ed25519 keypair generated on first build, a payload signed and stamped into every page, a verify endpoint that can't be tricked, and a deploy that proves it on production."
series: "nuxt-modules-capstone"
nuxtVersion: "4.x"
releaseDate: 2026-07-21
sourceUrl: "https://nodejs.org/api/crypto.html#cryptosignalgorithm-data-key-callback"
difficulty: "Advanced"
estMinutes: 25
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

The wall is done. It runs in the browser, persists on the server, and is typed and tested.

Now the other half of the boundary — code that only ever runs while Nuxt builds. `node:crypto`, the filesystem, the commit sha. At build time the module signs `{ handle, siteUrl, buildSha, timestamp }` with an ed25519 private key and stamps the token into every page's `<head>`. Anyone reading the source can check it.

It's a compact lesson in getting a small crypto surface right, where two of the obvious designs are quietly wrong — one of them wrong in the way that _looks_ like verification and checks nothing.

::BlogAlert{type="info"}
Continues from **[The Basics](/learn/nuxt-modules-core)** and **[Going Further](/learn/nuxt-modules-advanced)**. The mark is independent of the wall, so you can follow this on its own — but the module scaffolding comes from step two of The Basics.
::

## What we cover here

1. **The Signed Mark** — ed25519 keys on first build, canonical signing, head injection, and a verify endpoint.
2. **Deploy to the Blog** — installing in a real app, the packaging trap, and verifying on production output.

## What "done" looks like

The module running on this page. Open devtools:

```js
await $presence.verify();
// { valid: true, payload: { handle: "vantolbennett", buildSha: "…", … } }
```

That mark was signed by the build that published this page.

## How this series works

Each step follows the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**
