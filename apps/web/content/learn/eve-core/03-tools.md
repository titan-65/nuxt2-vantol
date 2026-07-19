---
title: "Tools: Give Your Agent Hands"
description: "Define a typed tool in tools/ with defineTool and Zod. The filename becomes the tool name — no registry to maintain."
series: "eve-core"
order: 3
feature: "defineTool / tools/"
sourceUrl: "https://eve.dev/docs/tools"
---

## What it is

Tools are typed functions the model can call. Drop a TypeScript file in `tools/` and Eve discovers it; the filename becomes the tool name.

## Why you'd care

This is how an agent does things — fetch live data, hit an API, compute a result. No manual registration; the filesystem is the interface.

## Before

The agent can only talk. Ask for the weather and it guesses.

## After

```ts [agent/tools/get_weather.ts]
import { defineTool } from "eve/tools";
import { z } from "zod";

export default defineTool({
  description: "Get the current weather for a city.",
  inputSchema: z.object({ cityName: z.string() }),
  async execute(input) {
    const res = await fetch(
      `${process.env.WEATHER_API_URL}/current?city=${input.cityName}`
    );
    const data = await res.json();
    return data.current_condition[0];
  },
});
```

Name the file `get_weather.ts` and the tool is `get_weather`. The Zod `inputSchema` types the arguments the model must provide.

## Do it yourself

1. Create `agent/tools/get_weather.ts` with the code above.
2. Run `eve dev` and ask *"What's the weather in Lisbon?"*
3. Confirm the model called the tool and returned typed data.
4. Add a second tool (e.g. a calculator) and call it.

## Gotchas

- The `inputSchema` (Zod) is what the model sees — make descriptions precise.
- The return value is what the model receives back; shape it for clarity.

## Recap

`tools/` turns a talking agent into a doing agent. Filename = tool name, Zod = typed input. Next, reusable playbooks via skills.
