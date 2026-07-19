---
title: "How Vapor Compiles"
description: "Templates are statically analyzed: dynamic parts are found at compile time and emitted as direct DOM operations instead of a render function returning vnodes. A side-by-side look at the two outputs."
series: "vue-vapor"
order: 3
feature: "Compile to direct DOM operations (no vnodes)"
sourceUrl: "https://vuejs.org/guide/extras/rendering-mechanism.html"
difficulty: "Intermediate"
estMinutes: 10
img: "/vue_vapor.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

The Vapor compiler reads your template at build time and figures out, **statically**, which parts are dynamic and which are fixed. From that it generates code that:

- Creates the real DOM nodes **once** on mount.
- Holds references to the dynamic parts (a text node, an attribute, a property).
- On state change, runs the smallest possible write: `el.textContent = x`, `el.setAttribute(name, val)`, `el.style.color = c`.

There is no vnode tree produced at runtime and no diff pass. Static parts are created a single time and never touched again.

## Why you'd care

This is why the "tax" from lesson 2 disappears: the update cost is now proportional only to your *dynamic* bindings, and there's nothing to allocate or walk. The compiler did the structural analysis so the runtime doesn't have to.

## Before (virtual DOM)

A render function returns vnodes every time; the runtime diffs and patches:

```js
// conceptual vdom output
function render() {
  return h('div', { id: _ctx.id }, _ctx.message)
}
// on update: new vnode -> diff vs old -> patch text + id
```

## After (Vapor)

The compiler emits mount + targeted mutations. Logically:

```js
// conceptual Vapor output
function mount(el) {
  const root = document.createElement('div')
  const text = document.createTextNode('')
  root.appendChild(text)
  // store refs; bind effects
  effect(() => { root.id = state.id })
  effect(() => { text.nodeValue = state.message })
}
// on update: only the changed effect runs — no vnodes, no diff
```

The real compiler works on **templates**, not hand-written `h()` calls — the snippet above is the *logical* shape, not something you author.

## Do it yourself

None — conceptual. Lesson 4 sets up a real project so you can see Vapor's actual compiled output.

## Gotchas

- Vapor changes the **output of the compiler**, not how you write templates. Your `<template>` and `<script setup>` stay the same.
- Static parts are hoisted and created once. Only dynamic bindings get a tracked effect.
- This is a *different* compilation target than the vdom path — both ship from the same source template.

## Recap

Compiler finds dynamic parts → emits one-time DOM creation + per-binding effects. No vnodes, no diff. Lesson 4 turns this on for real.
