---
title: "Agent Config: Choose a Model"
description: "Add agent.ts with defineAgent to pick a model and configure the runtime. Eve uses a default model until you override it."
series: "eve-core"
order: 2
feature: "defineAgent / agent.ts"
sourceUrl: "https://eve.dev/docs/agent-config"
---

## What it is

`agent.ts` is where you configure the agent — most importantly, which model it uses. Eve picks a sensible default, so the file is optional until you want control.

## Why you'd care

Different tasks want different models (cheap vs. capable). `agent.ts` is the one place to set that, plus runtime options via the AI Gateway.

## Before

You rely on Eve's default model and can't tell which one is answering.

## After

```ts [agent/agent.ts]
import { defineAgent } from "eve";

export default defineAgent({
  model: "openai/gpt-5.4-mini",
});
```

Eve now routes calls through the chosen model. Runtime options (timeouts, retries, streaming) live here too, powered by the AI Gateway.

## Do it yourself

1. Create `agent/agent.ts` and `export default defineAgent({ model: "openai/gpt-5.4-mini" })`.
2. Run `eve dev` and confirm responses still work.
3. Swap the model string and re-run to feel the difference.

## Gotchas

- `agent.ts` is optional — only add it when you want to override the default.
- The model string format follows the AI Gateway convention (`provider/model`).

## Recap

`agent.ts` + `defineAgent` is your control panel: choose the model and tune the runtime. Next, we give the agent something to do — tools.
