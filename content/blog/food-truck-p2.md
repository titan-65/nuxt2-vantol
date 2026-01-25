---
title: "Building a Real App with Nitro (Part 2): Persistence, Validation, and Production Readiness"
description: "Part 2 of our Nitro series where we level up the BrewStop food truck backend with validation, storage, middleware, and deployment-ready architecture."
date: 2026-01-21
tag: “Application Development”
img: "https://images.unsplash.com/photo-1620589125156-fd5028c5e05b?q=80&w=3287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
readTime: 10
keywords: [nitro, backend, api, unjs, serverless, food truck]
language: "TypeScript"
rating: 10
---

# Introduction

In **Part 1**, we built the foundation of **BrewStop**, a food truck / coffee shop backend powered by **Nitro**. We created menu endpoints, business hours, and a basic order flow.

In **Part 2**, we’ll turn that prototype into something **production-ready** by adding:

- Input validation  
- Persistent storage (using UnJS tools)  
- Order status updates  
- Middleware & plugins  
- Better structure for deployment  

This is where Nitro really shines — small additions, big capability.

<!--more-->

# Main Content

## Recap: Where We Left Off

At the end of Part 1, we had:
- `GET /api/menu`
- `GET /api/hours`
- `POST /api/orders`
- In-memory order storage  

The biggest limitation? **Orders disappear on restart** and inputs are not validated. Let’s fix that.

---

## Step 1: Add Persistent Storage with Unstorage

Nitro integrates beautifully with **Unstorage**, a key-value storage system from the UnJS ecosystem.

### Install Unstorage

```bash
npm install unstorage
````

### Create a Storage Utility

Create `server/utils/storage.ts`:

```ts
import { createStorage } from "unstorage"
import fsDriver from "unstorage/drivers/fs"

export const storage = createStorage({
  driver: fsDriver({ base: "./.data" })
})
```

This gives us:

* Persistent storage
* Zero database setup
* Easy swap to Redis, Cloudflare KV, etc.

You can switch storage drivers without rewriting your application logic.
::

---

## Step 2: Refactor Orders to Use Storage

Update `server/api/orders.post.ts`:

```ts
import { storage } from "../utils/storage"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const order = {
    id: crypto.randomUUID(),
    items: body.items,
    status: "pending",
    createdAt: Date.now()
  }

  await storage.setItem(`orders:${order.id}`, order)
  return order
})
```

Now orders persist across restarts.

---

## Step 3: Input Validation

Never trust user input — even for coffee ☕.

Create `server/utils/validation.ts`:

```ts
export function validateOrder(body: any) {
  if (!body?.items || !Array.isArray(body.items)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid order format"
    })
  }
}
```

Use it in your endpoint:

```ts
import { validateOrder } from "../utils/validation"

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  validateOrder(body)
  // continue logic
})
```

Validation protects your API from malformed requests and accidental misuse.
::

---

## Step 4: Fetch Orders & Update Status

### Get All Orders

Create `server/api/orders.get.ts`:

```ts
import { storage } from "../utils/storage"

export default defineEventHandler(async () => {
  const keys = await storage.getKeys("orders:")
  const orders = await Promise.all(
    keys.map((key) => storage.getItem(key))
  )
  return orders
})
```

### Update Order Status

Create `server/api/orders/[id].patch.ts`:

```ts
import { storage } from "../../utils/storage"

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const body = await readBody(event)

  const order = await storage.getItem(`orders:${id}`)
  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" })
  }

  const updated = { ...order, status: body.status }
  await storage.setItem(`orders:${id}`, updated)

  return updated
})
```

Now BrewStop supports a real workflow:

* pending → preparing → ready → completed

---

## Step 5: Add Middleware (Logging)

Create `server/plugins/logger.ts`:

```ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    console.log(
      `[${new Date().toISOString()}] ${event.method} ${event.path}`
    )
  })
})
```

This gives you centralized request logging without cluttering endpoints.

---

## Step 6: Simple API Key Protection

Let’s protect order updates.

Update `nitro.config.ts`:

```ts
export default defineNitroConfig({
  runtimeConfig: {
    apiKey: "super-secret-key"
  }
})
```

Create `server/plugins/auth.ts`:

```ts
export default defineNitroPlugin(() => {
  addEventHandler((event) => {
    if (event.path.startsWith("/api/orders") && event.method !== "GET") {
      const key = event.headers.get("x-api-key")
      if (key !== useRuntimeConfig().apiKey) {
        throw createError({ statusCode: 401, statusMessage: "Unauthorized" })
      }
    }
  })
})
```

This is intentionally simple — Nitro plugins scale well to JWT, OAuth, or third-party auth later.
::

---

## Step 7: Deployment Readiness

Build your app:

```bash
npm run build
```

Nitro outputs a `.output` directory that can run on:

* Node.js servers
* Serverless platforms
* Edge runtimes

```bash
node .output/server/index.mjs
```

No changes needed.

---

## Final API Overview

### BrewStop API (Final)

* GET `/api/menu`
* GET `/api/hours`
* GET `/api/orders`
* POST `/api/orders`
* PATCH `/api/orders/:id`
  ::

This backend can now realistically power:

* A POS system
* A mobile app
* A Nuxt frontend
* An admin dashboard

---

# Conclusion

In just **two parts**, we’ve built a real backend using **Nitro**:

* Persistent storage
* Validation
* Middleware
* Secure endpoints
* Multi-runtime deployment

Nitro proves that you don’t need heavy frameworks or complex infrastructure to build **serious applications**. With composable UnJS tools and clean architecture, you can ship fast — and scale later.

Next steps?

* Add a frontend (Nuxt or Vite)
* Add payments
* Deploy to edge
* Replace storage with a database

BrewStop is production-ready — and this is only the beginning. ☕🚀
