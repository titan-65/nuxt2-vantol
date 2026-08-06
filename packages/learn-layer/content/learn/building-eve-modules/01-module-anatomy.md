---
title: "Step 1: Module Anatomy & Agent Discovery"
description: "Scaffold the open-source nuxt-eve package structure, define module options, and discover server/agents/ filesystem agent definitions."
series: "building-eve-modules"
order: 1
releaseDate: 2026-07-28
difficulty: "Intermediate"
estMinutes: 15
---

In Step 1, we establish the **build/runtime boundary** for our Eve Nuxt module.

## What we're building

A Nuxt 4 module (`@vvantol2000/nuxt-eve`) that scans your project's `server/agents/` folder at build time and automatically configures Eve AI agents without manual route registration.

::EveModulePlayground
::

## Key Concepts

- **Filesystem-First Convention**: Every folder in `server/agents/[agentId]` represents an agent containing `instructions.md`, `agent.config.ts`, and `tools/`.
- **`defineNuxtModule` setup**: `@nuxt/kit` scans agent folders, registers composables, and mounts Nitro handlers.

```ts
import { defineNuxtModule, createResolver, addImports, addServerHandler } from "@nuxt/kit";

export default defineNuxtModule({
  meta: { name: "@vvantol2000/nuxt-eve", configKey: "eve" },
  setup(options, nuxt) {
    const resolver = createResolver(import.meta.url);
    addImports([
      { name: "useEveChat", from: resolver.resolve("./runtime/composables/useEveChat") },
    ]);
  },
});
```

Use the interactive sandbox above to click between the code tabs and test the initial module configuration!
