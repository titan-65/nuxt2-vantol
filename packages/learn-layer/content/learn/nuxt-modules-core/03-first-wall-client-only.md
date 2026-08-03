---
title: "First Wall — Client-Only"
description: "Register an auto-imported component and a client plugin, wire a key combo and a window.$presence console API, and get a working scratch board with no server involved."
series: "nuxt-modules-core"
order: 3
feature: "addComponent, addPlugin, client-only state"
sourceUrl: "https://nuxt.com/docs/4.x/api/kit/components"
difficulty: "Beginner"
estMinutes: 14
img: "/nuxt_learn.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

The wall is an overlay that opens on a key combo, holds signatures in memory, and renders them scattered across the screen. Three registered pieces: a component, a composable, a client plugin.

## Why you'd care

This is the whole "register a path, don't import it" idea made concrete. It's also the first thing a visitor can touch.

## Before

Nothing on screen. The module loads and does nothing.

## After

Press <kbd>↑</kbd> <kbd>↑</kbd> <kbd>↓</kbd> <kbd>↓</kbd>, or type `$presence.open()` in devtools, and the wall appears.

## Do it yourself

### 1. The composable — state, no framework magic

```ts
// src/runtime/composables/usePresenceWall.ts
import { ref, type Ref } from "vue";

export function createWall(): WallHandle {
  const isOpen = ref(false);
  const signatures = ref<Signature[]>([]);

  function add(input: { text: string; x: number; y: number }): Signature {
    const now = Date.now();
    const sig: Signature = {
      id: makeId(),
      ...input,
      rotation: Math.floor(Math.random() * 30) - 15,
      color: randomColor(),
      createdAt: now,
      expiresAt: now + 3600_000,
    };
    signatures.value = [...signatures.value, sig];
    return sig;
  }

  return { isOpen, signatures, open, close, add, clear };
}
```

Note `createWall()` is a plain factory, exported separately from the `usePresenceWall()` that the app consumes. That split costs one line and buys you a composable you can unit-test without mounting anything.

`usePresenceWall()` then has one job — return **the same wall every time**:

```ts
let shared: WallHandle | undefined;

export function usePresenceWall(): WallHandle {
  if (import.meta.server) return createWall();

  shared ??= createWall();
  return shared;
}
```

::BlogAlert{type="warning"}
Get this wrong — return `createWall()` and let each caller have its own — and every piece still works in isolation while the feature is dead. The plugin's combo opens _its_ wall; the component renders _its own_, which nothing ever opens. Unit tests pass, component tests pass, and pressing the combo does nothing. State two pieces share needs exactly one owner. The server branch matters too: a module-scoped singleton on the server is shared across every request.
::

### 2. Register both pieces

```ts
// src/module.ts
setup(options, nuxt) {
  const { resolve } = createResolver(import.meta.url);

  addPlugin({
    src: resolve("./runtime/plugins/presence.client"),
    mode: "client",
  });

  addComponent({
    name: "PresenceWall",
    filePath: resolve("./runtime/components/PresenceWall.vue"),
  });
}
```

`mode: "client"` matters — the plugin touches `window`, and without it Nuxt would also run this during SSR.

### 3. The combo listener

```ts
// src/runtime/plugins/presence.client.ts
export function createPresencePlugin(opts: PresencePluginOptions): () => void {
  let buffer: BufferedKey[] = [];
  let lastTs = 0;

  function onKeydown(e: KeyboardEvent) {
    const now = Date.now();
    if (now - lastTs > 1500) buffer = [];
    lastTs = now;
    buffer.push({ key: e.key, code: e.code });
    if (buffer.length > opts.combo.length) buffer = buffer.slice(-opts.combo.length);

    // Match against either the logical key ("ArrowUp") or the physical code
    // ("KeyK"), since callers may configure a combo using either style.
    if (
      buffer.length === opts.combo.length &&
      buffer.every((k, i) => k.key === opts.combo[i] || k.code === opts.combo[i])
    ) {
      opts.wall.open();
      buffer = [];
    }
  }

  window.addEventListener("keydown", onKeydown);
  return () => window.removeEventListener("keydown", onKeydown);
}
```

Two decisions worth stealing. The 1.5-second idle reset keeps a stray keypress from poisoning the buffer forever. Returning a teardown function makes the listener testable — and tests that don't clean up their listeners leak into each other.

### 4. The console API

```ts
window.$presence = {
  open: () => opts.wall.open(),
  close: () => opts.wall.close(),
  sign: (text: string) => opts.wall.add({ text, x: 50, y: 50 }),
};
```

### 5. Use it

```vue
<script setup lang="ts">
const open = ref(false);
</script>

<template>
  <PresenceWall v-model:open="open" />
</template>
```

## Gotchas

- **The default plugin export takes `nuxtApp`, not nothing.** Nuxt's loader accepts a plain function — `defineNuxtPlugin(fn)` just returns `fn` when handed a function, so wrapping it adds nothing here.
- **Don't import `nuxt/app` in a plugin you want to unit-test.** It transitively pulls in `#build/*` virtual modules that only exist inside a real Nuxt build. Type the two properties you actually touch instead.
- **Scope your component's styles.** A module that leaks CSS into the consuming app is a module people uninstall. Scoped styles and CSS variables only, no global selectors.
- **State is per-page-load.** Reload and the wall is empty. That's the next step.

## Recap

`addComponent` and `addPlugin` register paths; the plugin owns the DOM listener and the console API; the composable owns state and stays testable. You have a working module — that's the end of the beginner series.

Next: **[Building a Nuxt Module: Going Further](/learn/nuxt-modules-advanced)**, where the signatures outlive a refresh.
