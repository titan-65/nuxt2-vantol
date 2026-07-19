---
title: "Block Tree & Fine-Grained Reactivity"
description: "Inside Vapor: how a block tracks its dynamic parts, how Vue's Proxy reactivity drives targeted DOM mutations, and why leaf Vapor components shed per-instance overhead."
series: "vue-vapor"
order: 5
feature: "Blocks + fine-grained DOM effects"
sourceUrl: "https://vuejs.org/guide/extras/reactivity-in-depth.html"
difficulty: "Intermediate"
estMinutes: 12
img: "/vue_vapor.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

A **block** is a unit of template with a stable inner structure — the same "block" idea from tree flattening (lesson 2), taken further. In Vapor, a block is compiled once into: the real DOM creation, plus an array of **effects**, one per dynamic part.

## Why you'd care

This is where the performance comes from. Each dynamic binding is its own reactive effect bound straight to a DOM write. When the underlying `ref` or reactive property changes, *only that one effect runs* — no parent re-render, no sibling involvement.

## Reactivity is unchanged

Vapor does **not** replace Vue's reactivity. It's still Proxy-based `@vue/reactivity`:

```js
import { ref, effect } from '@vue/reactivity' // conceptual
const count = ref(0)
effect(() => { button.textContent = `Clicked ${count.value} times` })
count.value++ // only this effect re-runs
```

Real Vapor emits effects like these **from your templates** — you don't hand-write them. What Vapor changes is **where the effects attach** — to individual DOM operations instead of to a whole-component render-function re-run. The engine is the same; the granularity is finer. (Note: `getCurrentInstance()` returns `null` inside a Vapor component — that's expected, not an error.)

## Before

In the vdom model, a state change re-runs the component's render effect, producing a fresh vnode tree that gets diffed. Even with patch flags, the effect boundary is the component.

## After

In Vapor, the effect boundary is the **dynamic binding**. The component instance overhead shrinks: a leaf Vapor component can avoid allocating a full component instance and vnode tree — it's just DOM nodes plus a handful of effects. (The exact instance behavior depends on the pinned version; treat "no per-leaf instance overhead" as the design goal, not a guarantee for every component shape.)

## Do it yourself

None — conceptual. Lesson 6 makes this concrete by porting a component.

## Gotchas

- The reactivity engine is identical. If you know `ref`/`reactive`/`computed`, you already know Vapor's reactivity.
- "Fewer instances" is the goal; components with significant logic may still allocate an instance in the pinned version. Check the support notes.

## Recap

Blocks = one-time DOM + per-binding effects. Reactivity unchanged, just finer-grained. That's the mechanism behind the vdom-tax disappearing.
