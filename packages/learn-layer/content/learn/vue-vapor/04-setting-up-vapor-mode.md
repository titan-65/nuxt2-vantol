---
title: "Setting Up Vapor Mode"
description: "The one hands-on lesson: enable Vapor Mode in a Vue + Vite project against the pinned Vue 3.6.0-rc.1, scaffold a minimal app, and verify it's compiling to Vapor."
series: "vue-vapor"
order: 4
feature: "Enable Vapor Mode (pinned: vue@3.6.0-rc.1)"
sourceUrl: "https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1"
difficulty: "Intermediate"
estMinutes: 15
img: "/vue_vapor.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Vapor Mode is opt-in per component, not a global switch. In Vue 3.6.0-rc.1 you mark a single-file component with a `vapor` marker — `<script setup vapor>` or `<template vapor>` — and the standard `@vitejs/plugin-vue` compiles it to direct DOM operations. No Vite build flag, no separate package.

## Why you'd care

Seeing it run is what makes the internals lessons land. You'll have a known-good Vapor playground to experiment in.

## Before

A normal Vue project renders through the virtual DOM runtime. Nothing is wrong — it's the default.

## After

The same app, with one SFC marked `vapor`, compiles without the VDOM per-component path.

## Do it yourself

### 1. Scaffold a Vite + Vue project

In an empty folder:

```bash
npm create vite@latest my-vapor-app -- --template vue
cd my-vapor-app
```

### 2. Install the pinned build

Replace `npm create`'s Vue with the pinned version in `package.json`:

```bash
npm install vue@3.6.0-rc.1 && npm install -D @vitejs/plugin-vue@6.0.8 vite
```

### 3. Keep `vite.config.ts` standard

No Vapor flag is needed:

```ts
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({ plugins: [vue()] });
```

### 4. Minimal `App.vue`, marked Vapor

```vue
<script setup vapor>
import { ref } from "vue";
const count = ref(0);
</script>

<template>
  <button @click="count++">Clicked {{ count }} times</button>
</template>
```

### 5. Pure-Vapor entry `src/main.ts`

```ts
import { createVaporApp } from "vue";
import App from "./App.vue";

createVaporApp(App).mount("#app");
```

### 6. Verify

Add these two lines **inside the existing `<script setup vapor>` block** of `App.vue`:

```vue
<script setup vapor>
import { ref, getCurrentInstance } from "vue";
const count = ref(0);
console.log("vapor?", getCurrentInstance() === null);
</script>
```

Run `npm run dev`; the browser console should print `vapor? true`. (`true` ⇒ Vapor; `false` ⇒ the marker was dropped.) Remove the temp `console.log` after.

## Gotchas

- **Version mismatch is the #1 failure** — pin exactly `3.6.0-rc.1`.
- The **Options API is NOT supported** in Vapor.
- If compilation errors on a feature, that's the support-matrix cue (lesson 7), not a bug in your code.

## Recap

Mark an SFC `vapor`, use `createVaporApp` for a pure build, verify with `getCurrentInstance() === null`. You now have a Vapor playground — keep this project, lesson 6 reuses it.
