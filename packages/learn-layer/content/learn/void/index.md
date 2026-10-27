---
title: "Void in Practice: Build Jumble Cookies"
description: "Build Jumble, a real Jamaican cookie storefront, across eight stages on Void, Vue, D1, and the edge. Every lesson embeds the actual stage of the app as a live preview."
series: "void"
releaseDate: 2026-10-26
sourceUrl: "https://void.cloud/guide/"
difficulty: "Advanced"
estMinutes: 480
img: "/jumble-stage-1.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1767533048/PXL_20251010_202726442_2_hhudfr.jpg"
  website: "https://vantolbennett.vercel.app"
---

Most framework tutorials hand you a counter, a to-do list, or a weather card. This one hands you a cookie shop.

**Jumble** is a small-batch Jamaican cookie storefront built on Void and Vue. It has a rotating weekly menu, a box builder, a cart, pickup, checkout, orders, and an admin view. You build it one real stage at a time — and every lesson embeds the actual app at that stage.

::JumblePreview{stage="8" height="760"}
::

## What you will build

Eight stages, one codebase:

1. **Foundation** — Void + Vue, the branded shell, and the stage route. Live now.
2. **Weekly menu** — D1, Drizzle, and a seeded rotating menu. Live now.
3. **Storefront** — Cookie pages, box sizes, and typed page props. Live now.
4. **Box + cart** — KV sessions, the cart API, and a live drawer. Live now.
5. **Pickup + checkout** — Locations, pickup slots, validation, and orders in D1. Live now.
6. **Order status** — A status page, background confirmation, and a weekly menu cron. Live now.
7. **Admin + auth** — Protected menu and order operations. Live now.
8. **Ship** — R2 images, CI, the production deploy, and the final storefront. Live now.

The final app is `/`. Until each stage ships, `/preview/:stage` shows the app with only the features that exist at that point. The live preview above is the real stage 8 app, not a video or a screenshot.

## How this series works

Each lesson follows the same shape:

**What it is → Why you'd care → What we're building → Before/After → Do it yourself → Live stage → Gotchas → Recap.**

The live stage is part of the lesson. It is a real iframe pointing at `/preview/:stage` on the Jumble deployment. The blog passes `NUXT_PUBLIC_JUMBLE_URL` and the stage number; the app does the rest. The code shown in the lesson is the code in `apps/jumble`, so the preview and the source cannot drift.

The app is its own brand. Jumble is an original Jamaican bakery identity with original cookie names, copy, and art; the ordering flow is inspired by modern cookie stores, not copied from their assets or trade dress.

## Before you start

- Node **24.21+** (Void 1.2.1 requires it).
- `pnpm` and the Void CLI.
- Vue 3 and TypeScript basics.
- A Cloudflare account for the final deploy. Local dev only needs Node.

Void gives us the pieces the app needs: [Vue pages with typed loaders](https://void.cloud/guide/pages-routing/overview), [D1 with Drizzle](https://void.cloud/guide/database), [KV](https://void.cloud/guide/kv), queues and crons, and [`void deploy`](https://void.cloud/guide/deployment).

## Start here

All eight stages are live. Start with **[The Jumble Foundation](/learn/void/01-the-jumble-foundation)**, continue through **[The Weekly Menu](/learn/void/02-the-weekly-menu)**, **[The Storefront](/learn/void/03-the-storefront)**, **[Box + Cart](/learn/void/04-box-and-cart)**, **[Pickup + Checkout](/learn/void/05-pickup-and-checkout)**, **[Order Status](/learn/void/06-order-status)**, and **[Admin + Auth](/learn/void/07-admin-and-auth)**, then ship with **[Ship](/learn/void/08-ship)**.

The final storefront is `/`.
