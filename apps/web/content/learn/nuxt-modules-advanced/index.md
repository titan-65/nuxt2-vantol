---
title: "Building a Nuxt Module: Going Further"
description: "Your module works. Now make it real — Nitro routes behind an opt-in flag, a typed options surface with a public/private runtime split, and a test suite across three tiers that runs in seconds."
series: "nuxt-modules-advanced"
nuxtVersion: "4.x"
releaseDate: 2026-07-21
sourceUrl: "https://nuxt.com/docs/4.x/api/kit/nitro"
difficulty: "Intermediate"
estMinutes: 36
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

Picking up from **[The Basics](/learn/nuxt-modules-core)**, where `@vantol/presence` got a component, a composable and a client plugin — a wall that works until you refresh.

Three steps to make it a module you'd let someone else install. Server routes that don't exist unless they're asked for. Options that are typed, deep-merged, and split by who's allowed to read them. Tests at the cheapest tier that can actually prove each thing.

::BlogAlert{type="info"}
This series continues the same package. If you haven't done [The Basics](/learn/nuxt-modules-core), start there — every step here builds on that code.
::

## What we cover here

1. **Server Persistence & TTL** — `addServerHandler`, Nitro routes, and a store that forgets.
2. **A Real Options Surface** — `ModuleOptions`, deep-merged defaults, declaration merging, and the public/private runtime config decision.
3. **Testing the Module** — `@nuxt/test-utils`, and a rule for which tier a behaviour belongs in.

Three of the four bugs this module actually shipped and had to fix live in these steps. They're boxed as warnings where you'd otherwise write the broken version yourself.

## Where it goes next

- **[Nuxt Modules Capstone: The Signed Build](/learn/nuxt-modules-capstone)** — *Advanced.* ed25519 keys, build-time signing, a verify endpoint that can't be tricked, and the deploy.

## How this series works

Each step follows the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**
