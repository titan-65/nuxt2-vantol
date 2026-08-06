---
title: "Nuxt Layers: Advanced"
description: "Layers you don't own the repo for, the line between a layer and a module, and how to test something that has no app of its own. The three questions that come up once layers stop being a monorepo trick."
series: "nuxt-layers-advanced"
nuxtVersion: "4.x"
releaseDate: 2026-07-28
sourceUrl: "https://nuxt.com/docs/4.x/guide/going-further/layers"
difficulty: "Advanced"
estMinutes: 32
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

Everything so far assumed the layer is in your repo and you're the only consumer. Once neither is true, three questions show up and all three have sharp edges:

- **How do I consume a layer I can't publish?** Remote layers work, and their caching model will surprise you.
- **Should this be a layer or a module?** They overlap enough that "either would work" is usually true and usually wrong.
- **How do I test a layer?** There's no app to run — so you build a fixture app that exists only to be a consumer.

::BlogAlert{type="warning"}
Remote layers are the feature most likely to bite a team. They resolve at config load, they're cached outside your lockfile, and a moving branch reference means two machines can build different sites from the same commit. Step one is mostly about containing that.
::

## What we cover here

1. **Remote and Private Layers** — git sources, auth, caching, and the pinning discipline that makes them safe.
2. **Layer or Module?** — the decision rule, and the packages that are both.
3. **Testing and Publishing** — fixture apps with `@nuxt/test-utils`, what to put in `files`, and versioning something with no build output.

## Where it goes next

- **[Nuxt Layers Capstone: Splitting This Blog](/learn/nuxt-layers-capstone)** — _Advanced._ The whole thing applied to a real site, deployed to production.

## How this series works

Each step follows the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**

Prerequisites: **[The Basics](/learn/nuxt-layers-core)** and **[Going Further](/learn/nuxt-layers-intermediate)**.
