---
title: "Building a Real App with Nitro (Part 1): Foundations of a Food Truck API"
description: "Part 1 of a hands-on series where we use Nitro to build a real backend for a food truck / coffee shop application — from project setup to core API routes."
date: 2026-01-21
tag: "Application Development"
img: "https://images.unsplash.com/photo-1620589125156-fd5028c5e05b?q=80&w=3287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
readTime: 10
keywords: [nitro, backend, api, food truck, javascript, typescript]
language: "TypeScript"
rating: 9
---

# Introduction

Most backend tutorials stop at *“Hello World”*. In this **two-part series**, we’ll go further by using **Nitro** to build an **actual backend application** — a food truck / coffee shop API that could realistically power a real product.

In **Part 1**, we’ll focus on:
- Project setup  
- Application structure  
- Core API routes (menu, orders, hours)  
- Runtime configuration  
- Local development  

In **Part 2**, we’ll expand this into:
- Order creation and validation  
- Persistence (in-memory → storage)  
- Middleware and plugins  
- Deployment-ready architecture  

This series assumes basic JavaScript/TypeScript knowledge but **no prior Nitro experience**.

<!--more-->

# Main Content

## The App We’re Building

Our fictional app: **BrewStop** ☕🚚 — a mobile coffee truck.

### Core Features (Backend)
- Fetch menu items  
- View opening hours  
- Place orders  
- Track order status  

Nitro will serve as:
- The API server  
- The runtime abstraction layer  
- The deployment target (Node, serverless, edge)

---

## Why Nitro for This App?

Nitro is perfect for this use case because:
- It’s lightweight and fast  
- It supports filesystem routing  
- It deploys anywhere  
- It works great with frontend frameworks later  

::BlogAlert{type="info"}
Nitro is the same server engine powering Nuxt — meaning anything we build here can later scale into a fullstack Nuxt app.
::

---

## Step 1: Create the Nitro Project

```bash
npx create-nitro-app brewstop-api
cd brewstop-api
npm install
npm run dev
````

Your project structure will look like this:

```
server/
  api/
  routes/
  plugins/
nitro.config.ts
```

Nitro automatically wires everything together.

---

## Step 2: Define the Menu Data

For now, we’ll start with **in-memory data** (we’ll improve this in Part 2).

Create `server/data/menu.ts`:

```ts
export interface MenuItem {
  id: string
  name: string
  price: number
  category: "coffee" | "tea" | "food"
}

export const menu: MenuItem[] = [
  { id: "latte", name: "Latte", price: 4.5, category: "coffee" },
  { id: "espresso", name: "Espresso", price: 3, category: "coffee" },
  { id: "chai", name: "Chai Tea", price: 4, category: "tea" },
  { id: "croissant", name: "Croissant", price: 3.5, category: "food" }
]
```

This shared file keeps our types and data clean.

---

## Step 3: Create the Menu API Route

Create `server/api/menu.get.ts`:

```ts
import { menu } from "../data/menu"

export default defineEventHandler(() => {
  return {
    items: menu
  }
})
```

Now visit:

```
http://localhost:3000/api/menu
```

You’ll receive structured JSON instantly.

Filesystem routing means no router config, no boilerplate — your file structure *is* your API.
::

---

## Step 4: Add Business Hours

Create `server/api/hours.get.ts`:

```ts
export default defineEventHandler(() => {
  return {
    open: "08:00",
    close: "16:00",
    days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  }
})
```

This allows the frontend to determine if orders are allowed.

---

## Step 5: Runtime Configuration

Let’s make the truck name configurable.

Update `nitro.config.ts`:

```ts
import { defineNitroConfig } from "nitro/config"

export default defineNitroConfig({
  runtimeConfig: {
    public: {
      truckName: "BrewStop Coffee"
    }
  }
})
```

Use it in an endpoint:

```ts
export default defineEventHandler(() => {
  const config = useRuntimeConfig()
  return { name: config.public.truckName }
})
```

Environment overrides can be added later without code changes.

---

## Step 6: Create Orders (Initial Version)

Create `server/api/orders.post.ts`:

```ts
let orders: any[] = []

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const order = {
    id: crypto.randomUUID(),
    items: body.items,
    status: "pending",
    createdAt: Date.now()
  }

  orders.push(order)
  return order
})
```

This gives us a basic order flow we’ll **refactor and harden** in Part 2.

This approach is fine for development — but not production. We’ll address persistence and validation next.
::

---

## Step 7: Testing the API

You can test with `curl`, Postman, or any frontend:

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"items":["latte","croissant"]}'
```

You’ll receive a created order response immediately.

---

## What We’ve Built So Far

By the end of Part 1, we have:

* A working Nitro backend
* Menu and hours endpoints
* Order creation
* Runtime config
* Clean file structure

### Current API Endpoints

* GET `/api/menu`
* GET `/api/hours`
* POST `/api/orders`
  ::

---

# What’s Coming in Part 2

In **Part 2**, we’ll level this up:

* Input validation
* Order status updates
* Storage using UnJS tools
* Middleware (logging & auth)
* Deployment-ready output

---

# Conclusion

Nitro makes it incredibly easy to go from **idea → working backend** with almost zero friction. In just a few files, we’ve built the foundation of a real food truck application — something that could power a production system with the right enhancements.

In **Part 2**, we’ll turn this prototype into a **robust, scalable backend**.

👉 Stay tuned — BrewStop is just getting started ☕🚀
