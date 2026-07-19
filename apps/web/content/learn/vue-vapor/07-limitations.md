---
title: "Limitations & What Doesn't Work Yet"
description: "An honest map of Vapor Mode's current edges in Vue 3.6.0-rc.1: Options API, dynamic components, slots, SSR, custom directives, event handling, devtools, and ecosystem compatibility."
series: "vue-vapor"
order: 7
feature: "Vapor Mode support matrix (pinned: vue@3.6.0-rc.1)"
sourceUrl: "https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1"
difficulty: "Intermediate"
estMinutes: 10
img: "/vue_vapor.png"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Vapor Mode is experimental. Vue 3.6.0-rc.1 supports a large but **not complete** subset of Vue's template features. This lesson is the honest map.

## Why you'd care

Knowing the edges keeps you from fighting the compiler. If a feature isn't supported, Vapor fails loudly at compile time — that's the signal, not your code.

## Before

"It's just Vue — everything works." That's the vdom default today.

## After

For the pinned version **vue@3.6.0-rc.1**, the support picture is:

| Area | Status in Vue 3.6.0-rc.1 |
| --- | --- |
| `<script setup vapor>` / `<template vapor>` | ✅ Supported (opt-in per SFC) |
| Options API | ❌ Not supported |
| `v-if` / `v-for` / `v-show` | ✅ Supported |
| Dynamic components `<component :is>` | ✅ Supported (hydration fixes in rc.1) |
| Slots / scoped slots | ✅ Supported — `slots.default()` is not a side-effect-free dry run |
| SSR / hydration | ✅ Supported, feature-complete in rc.1 (active bug-fixing during RC) |
| Custom directives | ⚠️ Different `VaporDirective` interface (reactive getter `value`, returns cleanup fn) |
| Event handling | ⚠️ Delegated to `document`; ancestor `stopPropagation()` breaks handlers — use `@[event]`, `v-bind="{ onClick }"`, or `v-on="{}"` |
| Template refs on components | ⚠️ Do not expose `$el`/`$props`/`$attrs`/`$slots`/`$refs` |
| `getCurrentInstance()` | ❌ Returns `null` in Vapor (by design) |
| `app.config.globalProperties` | ❌ Not available |
| `@vue:xxx` lifecycle events | ❌ Not supported |
| `v-memo` | ❌ Not supported |
| VDOM ⇄ Vapor interop | ⚠️ Via `vaporInteropPlugin`; edge cases remain |
| Third-party (VDOM) libraries | ⚠️ Only through interop; rough edges expected |
| Devtools | ⚠️ Immature (Vapor is RC) |
| Performance | ✅ On par with Solid / Svelte 5 |

## Do it yourself

None — read the matrix, then check it against anything you'd want to build.

## Gotchas

- Unsupported syntax fails at **compile time**, not runtime — easy to tell apart from a logic bug.
- Vapor and the vdom can coexist in one app via `vaporInteropPlugin`, so unsupported parts can stay on the VDOM path while the rest goes Vapor.

## Recap

Vapor covers most templates but not all features yet. Compile-time failures are the tell. Coexistence means you can adopt incrementally.
