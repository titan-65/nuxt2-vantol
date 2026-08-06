---
title: "The Virtual DOM Tax"
description: "What does the virtual DOM actually cost at runtime? Walk the compile → mount → patch pipeline and see where the per-update overhead comes from — and when it compounds."
series: "vue-vapor"
order: 2
feature: "Render pipeline: compile, mount, patch"
sourceUrl: "https://vuejs.org/guide/extras/rendering-mechanism.html"
difficulty: "Intermediate"
estMinutes: 8
img: "/vue_vapor.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Every Vue component renders through the same three-stage pipeline:

1. **Compile** — the template becomes a render function that returns a virtual DOM tree.
2. **Mount** — the renderer calls that function, walks the returned vnode tree, and builds real DOM. This runs as a reactive effect, so it remembers every piece of state it touched.
3. **Patch** — when touched state changes, the effect re-runs, a _new_ vnode tree is built, diffed against the old one, and only the differences are applied to the DOM.

The virtual DOM is the in-memory tree of plain objects (`{ type, props, children }`) standing in for the real UI.

## Why you'd care

The vdom buys you declarativeness: you describe UI as a function of state and never touch the DOM by hand. The cost shows up on **every update**:

- New vnode objects are allocated for the parts that re-render.
- The render function runs again.
- The new tree is diffed against the old one.
- Patches are applied.

Vue already optimizes this hard — **patch flags** (the compiler tags each dynamic node with what _kind_ of update it needs, checked with fast bitwise ops) and **tree flattening** (only dynamic descendants are tracked, static parts skipped). That's "compiler-informed virtual DOM." It's genuinely fast. But the machinery still exists: vnode objects, block arrays, an effect re-run.

## Before

A list of 1,000 rows re-renders. Even with patch flags, the update allocates vnodes for the dynamic rows, re-runs their render effects, and walks the flattened dynamic tree. At 1,000 rows × frequent updates, that's a steady stream of allocations and GC pressure.

## After

Conceptually, the same update could skip the vnode layer entirely: the dynamic text node already has a reference, so a state change just sets `textContent`. No allocation, no diff, no walk. (Vapor Mode makes this real — lesson 3 shows how.) The point of this lesson is just to _see_ the tax so the savings are legible.

## Do it yourself

None — conceptual. If you want to feel it, open the [Template Explorer](https://template-explorer.vuejs.org/) and watch the generated render function allocate `createElementVNode` calls; those are the objects Vapor Mode aims to eliminate at runtime.

## Gotchas

- The vdom is **not "slow."** For most apps the tax is invisible. It compounds with _scale and frequency_: many leaf components, high update rates.
- Patch flags and tree flattening already remove most of the cost for typical apps. Vapor Mode is the next step, not a fix for a broken default.

## Recap

Compile → mount → patch. The per-update tax is vnode allocation + effect re-run + diff. Vue minimizes it; Vapor Mode removes the layer. Next: how Vapor compiles.
