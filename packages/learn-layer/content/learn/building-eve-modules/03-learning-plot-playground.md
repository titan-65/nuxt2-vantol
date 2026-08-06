---
title: "Step 3: The Learning Plot & Interactive Playground"
description: "Embed an interactive DAG execution inspector into Nuxt DevTools and Vue components."
series: "building-eve-modules"
order: 3
releaseDate: 2026-07-28
difficulty: "Intermediate"
estMinutes: 15
---

In Step 3, we add the **Learning Plot visualizer** to observe agent steps in real time.

## What we're building

- **Visual Step DAG**: A node workflow graph tracking thought loops, tool calls, and streaming output.
- **`<EveLearningPlot />`**: Vue SFC component embedded directly in your app or Nuxt DevTools tab.

::EveModulePlayground
::

## Using the Vue Component

```vue
<template>
  <div>
    <EveLearningPlot agent-id="assistant" />
    <EveChatWindow agent-id="assistant" />
  </div>
</template>
```

Open the **Learning Plot DAG** tab in the interactive sandbox above to watch step state transitions live as you run agents!
