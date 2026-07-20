---
title: "Roadmap & When to Use"
description: "Where Vapor Mode stands today, the signal from the Vue team, and a personal decision guide: workloads that benefit vs. ones to wait on."
series: "vue-vapor"
order: 8
feature: "Vapor Mode status & adoption guidance"
sourceUrl: "https://blog.vuejs.org/"
difficulty: "Intermediate"
estMinutes: 8
img: "/vue_vapor.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Vapor Mode is **experimental and not yet generally available**. The Vue team is actively developing it; the APIs and supported surface in this series are pinned to one version on purpose.

## Why you'd care

So you can make a calm, informed call instead of either ignoring Vapor or prematurely shipping it to production.

## Current status & roadmap

Vapor Mode became feature-complete in Vue 3.6, which entered RC on 2026-07-18 — one day before this series was written. The stable `latest` is still 3.5.x (no Vapor). The core team is actively fixing hydration/slots bugs during the RC; watch the Vue blog for 3.6 GA.

## When Vapor helps

- UIs with **many leaf components** (dashboards, data grids, design systems).
- **High-frequency, small updates** (counters, live values, tickers).
- Bundle-size-sensitive targets where dropping vdom runtime matters.

## When to wait

- Heavy use of **dynamic components** or features not yet supported (lesson 7).
- Dependence on **third-party libs** unverified against Vapor.
- Need for **SSR/hydration parity** if the pinned version doesn't cover it.
- Anything production-critical you can't easily roll back.

## Decision checklist

- [ ] My hot path is many-leaf / high-frequency?
- [ ] The features I use are in the pinned support matrix?
- [ ] My libs are Vapor-compatible (or I can keep them on vdom)?
- [ ] I'm okay tracking a pinned experimental version?

If yes across the board, a Vapor branch is worth a spin. Otherwise, wait for GA — the mental model from this series already pays off.

## Do it yourself

None. Track the pinned version's changelog and the Vue blog for GA.

## Gotchas

- Experimental ≠ abandoned. It's moving, which is exactly why we pinned a version.
- You don't have to choose all-or-nothing; coexistence lets you opt in surgically.

## Recap

Vapor is experimental and improving. Reach for it on leaf-heavy, update-heavy UIs once your features and libs clear the matrix. Go deeper: Vue Macros — which now houses the former Reactivity Transform — is an adjacent experimental surface we deliberately left for another series.
