---
title: "Porting a Component to Vapor"
description: "Take a small vdom component and run it under Vapor. What stays the same (Composition API, ref), what compiles differently, and which syntax to avoid in Vue 3.6.0-rc.1."
series: "vue-vapor"
order: 6
feature: "Author a Vapor-compiled component (pinned: vue@3.6.0-rc.1)"
sourceUrl: "https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1"
difficulty: "Intermediate"
estMinutes: 12
img: "/vue_vapor.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Porting to Vapor is mostly *not porting* — you write the same SFC and add the `vapor` marker. The difference is the compilation target, enabled in lesson 4.

## Why you'd care

Confirms the big promise: your existing component authoring barely changes. The win is in the output, not your source.

## Before (standard vdom SFC)

```vue
<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">Count: {{ count }}</button>
</template>
```

## After (same source, plus the marker)

Same component — just add the marker. `import { ref } from 'vue'` stays identical, Composition API unchanged:

```vue
<script setup vapor>
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">Count: {{ count }}</button>
</template>
```

Note: in 3.6.0-rc.1 the Options API is NOT supported in Vapor, so an Options-API SFC would need converting to `<script setup>` first.

## Do it yourself

In your lesson-4 playground, create `Counter.vue` with the After code, import it into `App.vue` (or make it the root), run dev, and confirm `vapor? true` from the verify step still appears. The component now renders through Vapor.

## Gotchas

- If compilation fails on some syntax, that feature isn't supported in rc.1 (lesson 7) — not a bug in your component.
- Don't rewrite working logic to "help" Vapor. Standard Composition API is the point.

## Recap

Porting = adding the Vapor marker; your SFC source stays the same. The payoff is in the compiled output. Next: what doesn't work yet.
