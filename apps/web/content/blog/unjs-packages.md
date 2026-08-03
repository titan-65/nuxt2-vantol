---
title: "Using Core UnJS Packages to Build a Modern JavaScript Application"
description: "Explore the main UnJS packages and learn how to use them together in a real-world application — from config loading and HTTP servers to fetch utilities and building tools."
date: 2026-01-12
tag: "Technology"
img: "https://images.unsplash.com/photo-1498050108023-c5249f4df085"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
readTime: 10
keywords: [unjs, nitro, ofetch, unplugin, unstorage, c12]
language: "TypeScript"
rating: 5
---

# Introduction

The **UnJS ecosystem** is a large collection of focused, composable JavaScript utilities and tools created to empower developers with performant, agnostic building blocks. Instead of monolithic frameworks with opinionated APIs, UnJS packages are **small, well-scoped, and interoperable** — letting you pick exactly what you need for your app’s architecture and tooling. :contentReference[oaicite:0]{index=0}

In this post, we’ll focus on the **main UnJS packages** you’d use to build a real-world application and how they integrate together.

<!--more-->

# Main Content

::BlogAlert{type="info"}
UnJS packages follow a Unix philosophy — each one does one thing well and can be composed with others to form a complete solution. :contentReference[oaicite:1]{index=1}
::

---

## Key UnJS Packages for Your Application

Here’s a curated list of the most impactful UnJS packages you’ll likely use in a modern JavaScript/TypeScript application:

### **Nitro** — A Universal Server Engine

`nitro` lets you build **fast, portable servers** that run on Node.js, Deno, Bun, Cloudflare Workers, and more.

Use Nitro to create API routes and server logic without worrying about runtime differences:

```js
// server/index.ts
import { createNitro } from "nitro";

export default createNitro({
  handlers: [
    {
      route: "/api/hello",
      handler: () => ({ message: "Hello from Nitro!" }),
    },
  ],
});
```

Nitro becomes the backbone of your backend layer, powering APIs consistently across environments. ([UnJS][1])

---

### **c12** — Smart Configuration Loader

`c12` simplifies loading configuration from multiple sources (JSON, JSONC, YAML, TOML, .env, RC files) and merges them intelligently. This is useful for environment configs, feature flags, and CLI apps. ([UnJS][2])

```ts
import { loadConfig } from "c12";

const { config } = await loadConfig({});
console.log("App Config:", config);
```

It supports layering configs, environment overrides, and HMR during development — making config management a breeze. ([UnJS][2])

---

### **ofetch** — A Universal Fetch API

`ofetch` gives you a robust, cross-environment `fetch` API compatible with Node, browsers, and workers:

```ts
import { ofetch } from "ofetch";

const user = await ofetch("/api/user");
console.log(user);
```

Use it in your client and server code without worrying about environment differences. ([UnJS][1])

---

### **unplugin** — Plugin System Across Bundlers

`unplugin` lets you write **one plugin** that works with Vite, Rollup, webpack, and esbuild — ideal for extending builds consistently.

For example, creating a custom import transform:

```js
import Unplugin from "unplugin";

export default Unplugin(() => ({
  name: "example-plugin",
  transform(code) {
    return code.replace(/ENV_VAR/g, JSON.stringify(process.env.NODE_ENV));
  },
}));
```

It’s data-agnostic and integrates with major build systems seamlessly. ([UnJS][1])

---

### **jiti** — Runtime TypeScript and ESM Support

`jiti` makes it easy to load `.ts` modules at runtime without manual compilation:

```js
import { createRequire } from "module";
import jiti from "jiti";

const requireTs = jiti(__filename);
const config = requireTs("./config.ts").default;
```

This is invaluable for quick prototyping, custom servers, and tooling that needs TypeScript support without build steps. ([UnJS][1])

---

### **consola** — Elegant Console Logging

A lightweight yet powerful wrapper around console logs with levels, formatting, and grouping:

```ts
import { consola } from "consola";

consola.info("Server started");
consola.error("Unexpected error");
```

It improves readability of logs in production and development environments. ([UnJS][1])

---

### **defu** and **destr** — Defaults & Safe Parsing

- `defu` lets you merge objects with recursive defaults — perfect for configs. ([UnJS][1])
- `destr` safely parses JSON with better performance and security than `JSON.parse`. ([UnJS][1])

```ts
import { defu } from "defu";
import { destr } from "destr";

const defaults = { port: 3000 };
const config = defu(destr(process.env.APP_CONFIG), defaults);
```

These utilities pair well with `c12` for robust config and data handling.

---

## How These Fit Together in a Real App

Let’s imagine building a minimal app with UnJS tools:

1. **Configuration** – Use `c12` to load app configs, merging defaults and environment settings.
2. **Server Setup** – Use `nitro` to define API endpoints and middleware.
3. **Data Fetching** – Use `ofetch` on both client-side and server-side for HTTP requests.
4. **Build/Plugin Support** – Enhance the build pipeline with `unplugin` for consistent tooling across environments.
5. **Runtime TypeScript** – Use `jiti` in scripts or custom tooling parts of the app.
6. **Logging & Utilities** – Use `consola`, `defu`, and `destr` for reliable logging, defaults handling, and parsing.

Each UnJS package is independent and tree-shakeable. Only install what you need to keep your bundles lean.
(::)

---

## Code Example: Putting It All Together

Below is a simple example of a Nitro server with config loading and fetch utility:

```ts [example.ts]
import { createNitro } from "nitro";
import { loadConfig } from "c12";
import { ofetch } from "ofetch";
import { consola } from "consola";

const { config } = await loadConfig({});

export default createNitro({
  async handlers() {
    return [
      {
        route: "/api/hello",
        handler: () => ({
          message: "Hello from UnJS App!",
          env: config.NODE_ENV,
        }),
      },
      {
        route: "/api/user",
        handler: async () => {
          const user = await ofetch("https://jsonplaceholder.typicode.com/users/1");
          consola.info("Fetched user:", user);
          return user;
        },
      },
    ];
  },
});
```

This sample shows how **Nitro, c12, ofetch, and consola** can power a flexible, full-featured backend. ([UnJS][1])

---

# Conclusion

The **UnJS ecosystem** offers a rich — yet modular — toolkit for modern JavaScript applications. By adopting packages like **Nitro, c12, ofetch, unplugin, jiti, consola, defu, and destr**, you can assemble a highly productive development environment while keeping your dependencies lean. ([UnJS][3])

Whether you're building servers, tooling, or full-stack apps, UnJS packages empower you to choose _exactly the components you need_ — embracing composability and simplicity in equal measure. 🚀

[1]: https://unjs.io/packages/ "Packages · UnJS"
[2]: https://unjs.io/packages/c12 "c12 · Packages · UnJS"
[3]: https://unjs.io/ "UnJS: Unleash JavaScript's Potential"
