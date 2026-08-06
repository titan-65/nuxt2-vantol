---
title: "What Is Vapor Mode?"
description: "Vapor Mode is Vue's experimental compilation target that updates the DOM directly — skipping the virtual DOM runtime. Here's the one-line mental model and why it exists."
series: "vue-vapor"
order: 1
feature: "Vapor Mode (DOM-less compilation)"
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

Vapor Mode is an **alternative compilation target** for Vue's template compiler. Normally, a Vue template compiles to a render function that produces a virtual DOM tree, which the runtime then diffs and patches. In Vapor Mode, the compiler instead emits code that **creates real DOM nodes once and mutates them directly** when state changes — no virtual DOM tree, no diff pass, no per-update allocations.

Think of it as the same template, a different output: less JavaScript to ship and less work to do on every update.

## Why you'd care

Two wins, both about scale:

- **Smaller runtime.** Vapor components don't need the vdom renderer machinery per component, so the framework footprint drops.
- **Cheaper updates.** No vnode objects allocated and no tree walked on update — the work is proportional only to the _dynamic_ parts of your template.

If you've never felt the vdom "tax" (lesson 2), this is foreshadowing. If you have — huge lists, many tiny components, high-frequency updates — this is the lever.

## Before

"Vue renders by building a virtual DOM tree and diffing it against the previous one." That's the mental model most of us carry, and it's still the default.

## After

"Vue can also compile a template straight to a sequence of direct DOM operations." Vapor Mode is **opt-in and experimental** — the vdom path is still the default and still fully supported. You turn Vapor on for a build; nothing about how you write components changes at the syntax level.

## Do it yourself

None yet — this is the conceptual setup. Lesson 4 gets your hands on the actual setup.

## Gotchas

- Vapor Mode is **not** a replacement for the virtual DOM yet. It's an opt-in mode you enable deliberately.
- It does **not** change Vue's reactivity (Proxies). It changes what happens _after_ reactivity fires — where the DOM writes go.
- Because it's experimental, the enablement API and supported surface shift between versions. This series pins one version (see the setup lesson).

## Recap

Vapor Mode = compile templates to direct DOM ops instead of vdom diffing. Opt-in, experimental, reactivity unchanged. The next two lessons explain the "why" and the "how."
