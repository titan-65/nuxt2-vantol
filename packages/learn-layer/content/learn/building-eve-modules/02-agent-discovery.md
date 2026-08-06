---
title: "Step 2: Nitro Server Engine & Tool Binding"
description: "Mount SSE Server-Sent Event streaming routes and define type-safe tools with defineEveTool."
series: "building-eve-modules"
order: 2
releaseDate: 2026-07-28
difficulty: "Intermediate"
estMinutes: 15
---

In Step 2, we connect the **Nitro server runtime** with Eve's tool execution engine.

## What we're building

- **`defineEveTool`**: A helper function that wraps Zod parameter schemas with access to H3 event context.
- **SSE Stream Handler**: Real-time token streaming over Server-Sent Events (`/api/_eve/:agent/stream`).

::EveModulePlayground
::

## Defining a Server Tool

```ts
import { defineEveTool } from "@vvantol2000/nuxt-eve/server";
import { z } from "zod";

export default defineEveTool({
  name: "searchDocs",
  description: "Searches developer docs",
  parameters: z.object({ query: z.string() }),
  async execute({ query }, { event }) {
    return { status: "success", matches: ["Nuxt 4 Docs", "Eve Agent Docs"] };
  },
});
```

Switch to the **Live Runner** tab in the interactive sandbox above to execute this tool live!
