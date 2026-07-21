---
title: "Building a Nuxt Module: The Basics"
description: "You've installed a dozen Nuxt modules and never written one. Three steps to close that gap — the build/runtime boundary, a package Nuxt can load, and a working feature visitors can touch."
series: "nuxt-modules-core"
nuxtVersion: "4.x"
releaseDate: 2026-07-21
sourceUrl: "https://nuxt.com/docs/4.x/guide/going-further/modules"
difficulty: "Beginner"
estMinutes: 34
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

You know Nuxt. You've installed a dozen modules and never written one. That's the gap this series closes.

We build one real module across three series, `@vantol/presence`, and it does two things that pull in opposite directions — which is exactly why it teaches well:

- **The Wall** — a hidden scratch board. A key combo opens it, visitors leave a signature, the signature ages out and dissolves.
- **The Mark** — an ed25519 token signed at build time and stamped into every page's `<head>`. Anyone can read the source and check it.

One module, both halves of the module boundary: the code that runs while Nuxt builds your site, and the code that ships to the browser. Getting that line wrong is the most common way a first module breaks, so step one is about nothing else.

::BlogAlert{type="info"}
This series targets **Nuxt 4.x**. Where Nuxt 4.5 changed something out from under the obvious approach — it does, twice — the step says so and shows what works instead.
::

## What we cover here

1. **The Module Anatomy** — `defineNuxtModule`, and the build/runtime boundary.
2. **Scaffold the Presence Package** — a workspace package Nuxt can actually load.
3. **First Wall, Client-Only** — component, composable, plugin, key combo.

By the end you have a module that installs in one line and does something a visitor can see.

## Where it goes next

- **[Building a Nuxt Module: Going Further](/learn/nuxt-modules-advanced)** — *Intermediate.* Server routes, a typed options surface, and tests worth having.
- **[Nuxt Modules Capstone: The Signed Build](/learn/nuxt-modules-capstone)** — *Advanced.* ed25519 signing, a verify endpoint, and a real deploy.

## How this series works

Each step follows the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**

Every snippet is from the module running on this page. Open devtools and run `await $presence.verify()` — that endpoint gets built in the capstone.
