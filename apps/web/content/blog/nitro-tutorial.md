---
title: "Building Real Nitro Plugins: Step-by-Step Tutorials You Can Use Today"
description: "Hands-on Nitro plugin tutorials showing how to build logging, authentication, caching, and feature flag plugins for real-world applications."
date: 2026-01-30
tag: "Technology"
img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1769836111/NitroFull_ww4pbg.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
readTime: 12
keywords: [nitro, plugins, server, api, typescript]
language: "TypeScript"
rating: 5
---

# Introduction

In the previous post, we explored **what Nitro plugins are** and why they’re one of Nitro’s most powerful features. In this tutorial-focused follow-up, we’ll **build real Nitro plugins step by step** — the kind you’d actually use in production.

By the end, you’ll know how to create plugins for:
- Request logging
- API key authentication
- Response caching
- Feature flags and runtime configuration

All examples use **TypeScript** and work in **Nuxt + Nitro** or standalone Nitro apps.

<!--more-->

# Project Setup

Assuming a Nitro or Nuxt project, your folder structure should include:

```txt
server/
  plugins/
    logger.ts
    auth.ts
    cache.ts
    feature-flags.ts
Nitro automatically loads plugins from server/plugins/.
```

# Tutorial 1: Request Logger Plugin
Goal
Log every incoming request with method, path, and timing.

Step 1: Create the Plugin
// server/plugins/logger.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    const start = Date.now()

    event.node.res.on("finish", () => {
      const duration = Date.now() - start
      console.log(
        `[${event.method}] ${event.path} - ${duration}ms`
      )
    })
  })
})


## What This Does
Hooks into every request

Measures request duration

Logs after the response finishes

When to Use
Debugging slow endpoints

Monitoring API usage

Lightweight analytics

## Tutorial 2: API Key Authentication Plugin
Goal
Protect your API by validating an API key before routes run.

Step 1: Define a Validator
const VALID_KEYS = new Set(["dev-key-123", "prod-key-456"])

function isValidKey(key?: string | null) {
  return key && VALID_KEYS.has(key)
}
Step 2: Create the Plugin
// server/plugins/auth.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    const apiKey = event.headers.get("x-api-key")

    if (!isValidKey(apiKey)) {
      throw createError({
        statusCode: 401,
        statusMessage: "Invalid API Key"
      })
    }
  })
})

## Why This Is Powerful
No auth logic in individual routes

Centralized, reusable security

Easy to extend with JWT or OAuth later

## Tutorial 3: Simple Response Caching Plugin
Goal
Cache GET responses for frequently accessed endpoints (menus, products, settings).

Step 1: Create an In-Memory Cache
const cache = new Map<string, { value: any; expires: number }>()
const TTL = 60_000 // 60 seconds
Step 2: Build the Plugin
// server/plugins/cache.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", async (event) => {
    if (event.method !== "GET") return

    const key = event.path
    const cached = cache.get(key)

    if (cached && cached.expires > Date.now()) {
      return cached.value
    }
  })

  nitroApp.hooks.hook("afterResponse", (event, response) => {
    if (event.method !== "GET") return

    cache.set(event.path, {
      value: response,
      expires: Date.now() + TTL
    })
  })
})

## Real-World Use Case
Food truck menu API

Business hours endpoint

Pricing data

## Tutorial 4: Feature Flags Plugin
Goal
Enable or disable features at runtime without touching routes.

Step 1: Define Flags
const flags = {
  seasonalMenu: true,
  enableDiscounts: false
}
Step 2: Attach Flags to Runtime
// server/plugins/feature-flags.ts
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("request", (event) => {
    event.context.features = flags
  })
})
Step 3: Use in a Route
export default defineEventHandler((event) => {
  if (event.context.features.seasonalMenu) {
    return { menu: "Winter Specials" }
  }

  return { menu: "Standard Menu" }
})

## Why This Matters
Toggle features instantly

Safe rollouts

Environment-based behavior

## Combining Plugins for a Real App
For a coffee shop or food truck API, you might use:

Plugin	Purpose
Logger	Track traffic & performance
Auth	Secure admin endpoints
Cache	Speed up menu reads
Feature Flags	Enable promotions
All without bloating your route handlers.

## Best Practices
Keep plugins focused on one responsibility

Avoid heavy computation in request hooks

Use plugins for cross-cutting concerns, not business logic

Prefer plugins over middleware duplication
::

# Conclusion
Nitro plugins give you framework-level power without framework-level complexity. Instead of repeating logic in routes, plugins let you build reusable, centralized behaviors that scale with your app.

If you’re serious about building maintainable APIs — whether for Nuxt apps, serverless deployments, or edge runtimes — mastering Nitro plugins is a game changer. 🚀

