---
title: "Building a Nuxt Module From Scratch"
description: "We build @vantol/presence together — a hidden scratch board visitors can sign, and a cryptographic mark that proves who built the page they're reading. Eight steps, from 'I've never written a module' to shipped on this blog."
series: "nuxt-modules"
nuxtVersion: "4.x"
releaseDate: 2026-07-21
sourceUrl: "https://nuxt.com/docs/4.x/guide/going-further/modules"
difficulty: "Beginner"
estMinutes: 90
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

You know Nuxt. You've installed a dozen modules and never written one. That's the gap this series closes.

We build one real module, `@vantol/presence`, and it does two things that pull in opposite directions — which is exactly why it teaches well:

- **The Wall** — a hidden scratch board. A key combo opens it, visitors leave a signature, the signature ages out and dissolves. Client code, a component, an optional server route.
- **The Mark** — an ed25519 token signed at build time and stamped into every page's `<head>`. Anyone can read the source and check it. Build-time code, Node crypto, the filesystem.

One module, both halves of the module boundary: the code that runs while Nuxt builds your site, and the code that ships to the browser. Getting that line wrong is the single most common way a first module breaks, so we spend step one on nothing else.

::BlogAlert{type="info"}
This series targets **Nuxt 4.x**. Where Nuxt 4.5 changed something out from under the obvious approach — it does, twice — the step says so and shows what works instead.
::

## What we cover

1. **The Module Anatomy** — `defineNuxtModule`, and the build/runtime boundary.
2. **Scaffold the Presence Package** — a workspace package Nuxt can actually load.
3. **First Wall, Client-Only** — component, composable, plugin, key combo.
4. **Server Persistence & TTL** — a Nitro route and a store that forgets.
5. **A Real Options Surface** — typed options, defaults, runtime config.
6. **Testing the Module** — `@nuxt/test-utils`, and what's worth asserting.
7. **The Signed Mark** — ed25519, a build hook, and a verify endpoint.
8. **Deploy to the Blog** — installed, built, and verified on production.

Steps 1–3 get you a working module. Steps 4–6 make it real. Steps 7–8 make it provable. You can stop after any of those three and have something that works.

## How this series works

Each step follows the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**

Every snippet is from the module running on this page right now. Open devtools and run `await $presence.verify()` — that endpoint is what we build in step seven.
