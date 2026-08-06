# Vue Vapor Mode Tutorial Series — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author a 9-file, intermediate-level tutorial series on Vue Vapor Mode (8 lessons + a series landing) into the blog's existing `learn/` collection.

**Architecture:** Pure content addition. The `learn/` section auto-discovers series from the `tutorials` content collection by the `series` frontmatter field (`apps/web/app/pages/learn/index.vue` groups by `series`; `learn/[series]/[step].vue` queries by `series` + `order`). No application code changes. Each lesson follows the proven Nuxt-series body path: What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap. Vapor Mode is experimental and version-sensitive, so Task 0 pins a real Vue version and its enablement steps, which lessons 4 and 6 consume.

**Tech Stack:** Nuxt 4 + `@nuxt/content` (Markdown), Vue 3 (canary/`@vue/vapor` per Task 0), Vite.

---

## File Structure

All files are new Markdown under `apps/web/content/learn/vue-vapor/`:

- `index.md` — series landing (path resolves to `/learn/vue-vapor`)
- `01-what-is-vapor-mode.md`
- `02-virtual-dom-tax.md`
- `03-how-vapor-compiles.md`
- `04-setting-up-vapor-mode.md` — hands-on; uses pinned version from Task 0
- `05-block-tree-and-reactivity.md`
- `06-porting-a-component.md` — light hands-on; uses pinned version from Task 0
- `07-limitations.md`
- `08-roadmap-and-when-to-use.md`

Plus one research artifact produced in Task 0: `docs/superpowers/specs/2026-07-19-vue-vapor-pin.md` (pinned version + verified enablement commands).

Shared frontmatter conventions (copy exactly, swap `title`/`description`/`order`/`feature`/`estMinutes`):

```yaml
series: "vue-vapor"
difficulty: "Intermediate"
img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
```

`index.md` adds `title`, `description`, `releaseDate`, `sourceUrl`, `estMinutes` (no `order`/`feature`). Lessons add `order`, `feature`, `sourceUrl` (or `sourcePRs`), `estMinutes`.

---

## Task 0: Research pass — pin the Vue Vapor Mode version

**Files:**

- Create: `docs/superpowers/specs/2026-07-19-vue-vapor-pin.md`

- [ ] **Step 1: Confirm the current Vapor Mode enablement path**

Run a web research pass (Vue blog, `vuejs/core` repo, Vapor Mode RFC/discussions) to determine, as of today, how to enable Vapor Mode in a Vue + Vite project. Record the **exact** answers:

- The npm package + version to install (e.g. `vue@<version>` canary, or `@vue/vapor`, or a build flag).
- The exact enablement mechanism (runtime entry import such as `vue/vapor`, or a Vite/`@vitejs/plugin-vue` option).
- How to verify it compiled to Vapor (build output signal, devtools, or a runtime check per that version).
- Known supported/unsupported feature list for that version (for lessons 6 & 7).
- Authoritative source URLs (for `sourceUrl`/`sourcePRs` in lessons 4–7).

- [ ] **Step 2: Write the pinned reference file**

Create `docs/superpowers/specs/2026-07-19-vue-vapor-pin.md` with the concrete findings — package+version, install command, enablement config/snippet, verification step, support matrix, and source links. This file is the single source of truth for the version-specific parts of lessons 4 and 6.

- [ ] **Step 3: Commit the pin**

```bash
git add docs/superpowers/specs/2026-07-19-vue-vapor-pin.md
git commit -m "docs: pin Vue Vapor Mode version for tutorial series"
```

---

## Task 1: `01-what-is-vapor-mode.md`

**Files:**

- Create: `apps/web/content/learn/vue-vapor/01-what-is-vapor-mode.md`

- [ ] **Step 1: Write the lesson**

```markdown
---
title: "What Is Vapor Mode?"
description: "Vapor Mode is Vue's experimental compilation target that updates the DOM directly — skipping the virtual DOM runtime. Here's the one-line mental model and why it exists."
series: "vue-vapor"
order: 1
feature: "Vapor Mode (DOM-less compilation)"
sourceUrl: "https://vuejs.org/guide/extras/rendering-mechanism.html"
difficulty: "Intermediate"
estMinutes: 8
img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop"
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
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/content/learn/vue-vapor/01-what-is-vapor-mode.md
git commit -m "content(learn): add Vue Vapor Mode lesson 1 — what is it"
```

---

## Task 2: `02-virtual-dom-tax.md`

**Files:**

- Create: `apps/web/content/learn/vue-vapor/02-virtual-dom-tax.md`

- [ ] **Step 1: Write the lesson**

```markdown
---
title: "The Virtual DOM Tax"
description: "What does the virtual DOM actually cost at runtime? Walk the compile → mount → patch pipeline and see where the per-update overhead comes from — and when it compounds."
series: "vue-vapor"
order: 2
feature: "Render pipeline: compile, mount, patch"
sourceUrl: "https://vuejs.org/guide/extras/rendering-mechanism.html"
difficulty: "Intermediate"
estMinutes: 8
img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop"
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

Vue alreadyOptimizes this hard — **patch flags** (the compiler tags each dynamic node with what _kind_ of update it needs, checked with fast bitwise ops) and **tree flattening** (only dynamic descendants are tracked, static parts skipped). That's "compiler-informed virtual DOM." It's genuinely fast. But the machinery still exists: vnode objects, block arrays, an effect re-run.

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
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/content/learn/vue-vapor/02-virtual-dom-tax.md
git commit -m "content(learn): add Vue Vapor Mode lesson 2 — vdom tax"
```

---

## Task 3: `03-how-vapor-compiles.md`

**Files:**

- Create: `apps/web/content/learn/vue-vapor/03-how-vapor-compiles.md`

- [ ] **Step 1: Write the lesson**

````markdown
---
title: "How Vapor Compiles"
description: "Templates are statically analyzed: dynamic parts are found at compile time and emitted as direct DOM operations instead of a render function returning vnodes. A side-by-side look at the two outputs."
series: "vue-vapor"
order: 3
feature: "Compile to direct DOM operations (no vnodes)"
sourceUrl: "https://vuejs.org/guide/extras/rendering-mechanism.html"
difficulty: "Intermediate"
estMinutes: 10
img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop"
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

This is why the "tax" from lesson 2 disappears: the update cost is now proportional only to your _dynamic_ bindings, and there's nothing to allocate or walk. The compiler did the structural analysis so the runtime doesn't have to.

## Before (virtual DOM)

A render function returns vnodes every time; the runtime diffs and patches:

```js
// conceptual vdom output
function render() {
  return h("div", { id: _ctx.id }, _ctx.message);
}
// on update: new vnode -> diff vs old -> patch text + id
```
````

## After (Vapor)

The compiler emits mount + targeted mutations. Logically:

```js
// conceptual Vapor output
function mount(el) {
  const root = document.createElement("div");
  const text = document.createTextNode("");
  root.appendChild(text);
  // store refs; bind effects
  effect(() => {
    root.id = state.id;
  });
  effect(() => {
    text.nodeValue = state.message;
  });
}
// on update: only the changed effect runs — no vnodes, no diff
```

The real compiler works on **templates**, not hand-written `h()` calls — the snippet above is the _logical_ shape, not something you author.

## Do it yourself

None — conceptual. Lesson 4 sets up a real project so you can see Vapor's actual compiled output.

## Gotchas

- Vapor changes the **output of the compiler**, not how you write templates. Your `<template>` and `<script setup>` stay the same.
- Static parts are hoisted and created once. Only dynamic bindings get a tracked effect.
- This is a _different_ compilation target than the vdom path — both ship from the same source template.

## Recap

Compiler finds dynamic parts → emits one-time DOM creation + per-binding effects. No vnodes, no diff. Lesson 4 turns this on for real.

````

- [ ] **Step 2: Commit**

```bash
git add apps/web/content/learn/vue-vapor/03-how-vapor-compiles.md
git commit -m "content(learn): add Vue Vapor Mode lesson 3 — how it compiles"
````

---

## Task 4: `04-setting-up-vapor-mode.md` (hands-on, version-pinned)

**Files:**

- Create: `apps/web/content/learn/vue-vapor/04-setting-up-vapor-mode.md`
- Read: `docs/superpowers/specs/2026-07-19-vue-vapor-pin.md` (Task 0 output)

- [ ] **Step 1: Write the lesson using the pinned version**

Open the pinned reference from Task 0. Write the lesson so every command, package version, and config snippet comes **verbatim** from that file. Structure:

```markdown
---
title: "Setting Up Vapor Mode"
description: "The one hands-on lesson: enable Vapor Mode in a Vue + Vite project against a pinned Vue version, scaffold a minimal app, and verify it's compiling to Vapor."
series: "vue-vapor"
order: 4
feature: "Enable Vapor Mode (pinned: <VERSION FROM TASK 0>)"
sourceUrl: "<authoritative source from Task 0>"
difficulty: "Intermediate"
estMinutes: 15
img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Vapor Mode is opt-in. This lesson turns it on in a minimal Vue + Vite project using the pinned version **<VERSION>** from the research pass, so every command below is reproducible.

## Why you'd care

Seeing it run is what makes lessons 5–8 land. You'll have a known-good Vapor project to experiment in.

## Before

A standard Vue project renders through the virtual DOM runtime. Nothing is wrong — it's the default.

## After

The same app compiles through Vapor Mode. Replace the snippets below with the **exact** commands/config from the pinned reference.

### 1. Scaffold

\`\`\`bash

# from the pinned reference: scaffold or init a Vue + Vite project

<paste pinned scaffold/create command>
\`\`\`

### 2. Install the pinned Vue build

\`\`\`bash

# exact package + version from docs/superpowers/specs/2026-07-19-vue-vapor-pin.md

<paste pinned install command>
\`\`\`

### 3. Enable Vapor

\`\`\`ts
// <config file from pinned reference, e.g. vite.config.ts or main entry>
<paste pinned enablement config verbatim>
\`\`\`

### 4. Minimal App

\`\`\`vue [App.vue]

<script setup lang="ts">
import { ref } from 'vue'   // or the vapor entry per pinned reference
const count = ref(0)
</script>

<template>
  <button @click="count++">Clicked {{ count }} times</button>
</template>
\`\`\`

### 5. Verify

\`\`\`bash
<paste pinned verify command — build output signal / devtools / runtime check>
\`\`\`

If you see <pinned success signal>, Vapor Mode is compiling your templates.

## Do it yourself

Run steps 1–5 in an empty folder. Confirm the <pinned success signal> appears. Keep this project — lesson 6 ports a component into it.

## Gotchas

- **Version mismatch is the #1 failure.** Use exactly the pinned version; a newer/older build may not expose the enablement API.
- Not every feature is supported yet (lesson 7). If compilation errors on a feature, that's the cue — not a mistake in your code.

## Recap

Enable Vapor via the pinned build + config, scaffold a minimal app, verify the success signal. You now have a Vapor playground.
```

Replace every `<...>` token with the concrete value from the Task 0 pinned file. Do **not** leave placeholder brackets in the committed file.

- [ ] **Step 2: Commit**

```bash
git add apps/web/content/learn/vue-vapor/04-setting-up-vapor-mode.md
git commit -m "content(learn): add Vue Vapor Mode lesson 4 — setup (pinned)"
```

---

## Task 5: `05-block-tree-and-reactivity.md`

**Files:**

- Create: `apps/web/content/learn/vue-vapor/05-block-tree-and-reactivity.md`

- [ ] **Step 1: Write the lesson**

````markdown
---
title: "Block Tree & Fine-Grained Reactivity"
description: "Inside Vapor: how a block tracks its dynamic parts, how Vue's Proxy reactivity drives targeted DOM mutations, and why leaf Vapor components shed per-instance overhead."
series: "vue-vapor"
order: 5
feature: "Blocks + fine-grained DOM effects"
sourceUrl: "https://vuejs.org/guide/extras/reactivity-in-depth.html"
difficulty: "Intermediate"
estMinutes: 12
img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

A **block** is a unit of template with a stable inner structure — the same "block" idea from tree flattening (lesson 2), taken further. In Vapor, a block is compiled once into: the real DOM creation, plus an array of **effects**, one per dynamic part.

## Why you'd care

This is where the performance comes from. Each dynamic binding is its own reactive effect bound straight to a DOM write. When the underlying `ref` or reactive property changes, _only that one effect runs_ — no parent re-render, no sibling involvement.

## Reactivity is unchanged

Vapor does **not** replace Vue's reactivity. It's still Proxy-based `@vue/reactivity`:

```js
import { ref, effect } from "@vue/reactivity"; // conceptual
const count = ref(0);
effect(() => {
  button.textContent = `Clicked ${count.value} times`;
});
count.value++; // only this effect re-runs
```
````

What Vapor changes is **where the effects attach** — to individual DOM operations instead of to a whole-component render-function re-run. The engine is the same; the granularity is finer.

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

````

- [ ] **Step 2: Commit**

```bash
git add apps/web/content/learn/vue-vapor/05-block-tree-and-reactivity.md
git commit -m "content(learn): add Vue Vapor Mode lesson 5 — blocks & reactivity"
````

---

## Task 6: `06-porting-a-component.md` (light hands-on, version-pinned)

**Files:**

- Create: `apps/web/content/learn/vue-vapor/06-porting-a-component.md`
- Read: `docs/superpowers/specs/2026-07-19-vue-vapor-pin.md`

- [ ] **Step 1: Write the port lesson using the pinned version**

Take the minimal counter app from lesson 4's playground and make the port explicit. Keep Composition API identical; show the template is unchanged and that Vapor compiles it. Use the pinned entry import where the version differs from standard `vue`.

```markdown
---
title: "Porting a Component to Vapor"
description: "Take a small vdom component and run it under Vapor. What stays the same (Composition API, ref), what compiles differently, and which syntax to avoid in the pinned version."
series: "vue-vapor"
order: 6
feature: "Author a Vapor-compiled component (pinned: <VERSION>)"
sourceUrl: "<authoritative source from Task 0>"
difficulty: "Intermediate"
estMinutes: 12
img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Porting to Vapor is mostly _not porting_ — you write the same SFC. The difference is the compilation target, enabled in lesson 4.

## Why you'd care

Confirms the big promise: your existing component authoring barely changes. The win is in the output, not your source.

## Before (standard vdom SFC)

\`\`\`vue [Counter.vue]

<script setup lang="ts">
import { ref } from 'vue'
const count = ref(0)
</script>

<template>
  <button @click="count++">Count: {{ count }}</button>
</template>
\`\`\`

## After (same source, Vapor-compiled)

The component file is **unchanged**. Under the pinned Vapor build from lesson 4, the `<template>` compiles to direct DOM operations instead of a render function. If the pinned version requires a different entry import, show it here verbatim from the pinned reference:

\`\`\`ts
// only if the pinned version requires it — paste exact import from Task 0
<paste pinned vapor entry import, else state "no change needed">
\`\`\`

## Do it yourself

In your lesson-4 playground: create `Counter.vue` with the Before code, import it into `App.vue`, run dev, and confirm the <pinned success signal> from lesson 4 still appears. The component now renders through Vapor.

## Gotchas

- If compilation fails on some syntax, that feature isn't supported in the pinned version yet (lesson 7) — not a bug in your component.
- Don't rewrite working logic to "help" Vapor. Standard Composition API is the point.

## Recap

Porting = enabling the Vapor target; your SFC stays the same. The payoff is in the compiled output. Next: what doesn't work yet.
```

Replace `<VERSION>` and any `<...>` tokens with the Task 0 pinned values. No placeholder brackets in the committed file.

- [ ] **Step 2: Commit**

```bash
git add apps/web/content/learn/vue-vapor/06-porting-a-component.md
git commit -m "content(learn): add Vue Vapor Mode lesson 6 — porting a component"
```

---

## Task 7: `07-limitations.md`

**Files:**

- Create: `apps/web/content/learn/vue-vapor/07-limitations.md`
- Read: `docs/superpowers/specs/2026-07-19-vue-vapor-pin.md` (support matrix)

- [ ] **Step 1: Write the lesson using the pinned support matrix**

Pull the supported/unsupported list from the Task 0 pinned reference and present it honestly. Frame as "what doesn't work yet" in the pinned version.

```markdown
---
title: "Limitations & What Doesn't Work Yet"
description: "An honest map of Vapor Mode's current edges in the pinned version: dynamic components, structural edge cases, SSR/hydration status, devtools maturity, and ecosystem compatibility."
series: "vue-vapor"
order: 7
feature: "Vapor Mode support matrix (pinned: <VERSION>)"
sourceUrl: "<authoritative source from Task 0>"
difficulty: "Intermediate"
estMinutes: 10
img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Vapor Mode is experimental. The pinned version supports a large but **not complete** subset of Vue's template features. This lesson is the honest map.

## Why you'd care

Knowing the edges keeps you from fighting the compiler. If a feature isn't supported, Vapor fails loudly at compile time — that's the signal, not your code.

## Before

"It's just Vue — everything works." That's the vdom default today.

## After

For the pinned version **<VERSION>**, the support picture is (fill from the Task 0 pinned reference — representative shape below):

| Area                                        | Status in pinned version |
| ------------------------------------------- | ------------------------ |
| Basic bindings (`{{ }}`, `:prop`, `@event`) | Supported                |
| `v-if` / `v-for` / `v-show`                 | <from pinned reference>  |
| `<component :is>` (dynamic components)      | <from pinned reference>  |
| Slots / scoped slots                        | <from pinned reference>  |
| SSR / hydration                             | <from pinned reference>  |
| Devtools                                    | <from pinned reference>  |
| Third-party component libs                  | <from pinned reference>  |

Replace every `<from pinned reference>` cell with the actual status from `docs/superpowers/specs/2026-07-19-vue-vapor-pin.md`.

## Do it yourself

None — read the matrix, then check it against anything you'd want to build.

## Gotchas

- Unsupported syntax fails at **compile time**, not runtime — easy to tell apart from a logic bug.
- Vapor and the vdom can coexist in one app (you opt in per build). Unsupported parts can stay on the vdom path while the rest goes Vapor.

## Recap

Vapor covers most templates but not all features yet. Compile-time failures are the tell. Coexistence means you can adopt incrementally.
```

Replace `<VERSION>` and all `<from pinned reference>` cells with concrete values from Task 0. No placeholder brackets in the committed file.

- [ ] **Step 2: Commit**

```bash
git add apps/web/content/learn/vue-vapor/07-limitations.md
git commit -m "content(learn): add Vue Vapor Mode lesson 7 — limitations"
```

---

## Task 8: `08-roadmap-and-when-to-use.md`

**Files:**

- Create: `apps/web/content/learn/vue-vapor/08-roadmap-and-when-to-use.md`

- [ ] **Step 1: Write the lesson**

```markdown
---
title: "Roadmap & When to Reach For It"
description: "Where Vapor Mode stands today, the signal from the Vue team, and a personal decision guide: workloads that benefit vs. ones to wait on."
series: "vue-vapor"
order: 8
feature: "Vapor Mode status & adoption guidance"
sourceUrl: "https://blog.vuejs.org/"
difficulty: "Intermediate"
estMinutes: 8
img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

## What it is

Vapor Mode is **experimental and not yet generally available**. The Vue team is actively developing it; the APIs and supported surface in this series are pinned to one version on purpose.

## Why you'd care

So you can make a calm, informed call instead of either ignoring Vapor or prematurely shipping it to production.

## Current status & roadmap

<1–2 sentences on status from the pinned reference / Vue blog — e.g. "Still behind an experimental flag; the team is expanding template coverage and improving coexistence with the vdom before GA.">

## When Vapor helps

- UIs with **many leaf components** (dashboards, data grids, design systems).
- **High-frequency, small updates** (counters, live values, tickers).
- Bundle-size-sensitive targets where dropping vdom runtime matters.

## When to wait

- Heavy use of **dynamic components** or features not yet supported (lesson 7).
- Dependence on **third-party libs** unverified against Vapor.
- Need for **SSR/hydration parity** if the pinned version doesn't cover it.
- Anything production-critical you can't easily roll back.

## Decision checklist

- [ ] My hot path is many-leaf / high-frequency?
- [ ] The features I use are in the pinned support matrix?
- [ ] My libs are Vapor-compatible (or I can keep them on vdom)?
- [ ] I'm okay tracking a pinned experimental version?

If yes across the board, a Vapor branch is worth a spin. Otherwise, wait for GA — the mental model from this series already pays off.

## Do it yourself

None. Track the pinned version's changelog and the Vue blog for GA.

## Gotchas

- Experimental ≠ abandoned. It's moving, which is exactly why we pinned a version.
- You don't have to choose all-or-nothing; coexistence lets you opt in surgically.

## Recap

Vapor is experimental and improving. Reach for it on leaf-heavy, update-heavy UIs once your features and libs clear the matrix. Go deeper: Vue Macros and Reactivity Transform are adjacent experimental surfaces we deliberately left for another series.
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/content/learn/vue-vapor/08-roadmap-and-when-to-use.md
git commit -m "content(learn): add Vue Vapor Mode lesson 8 — roadmap & when to use"
```

---

## Task 9: `index.md` (series landing)

**Files:**

- Create: `apps/web/content/learn/vue-vapor/index.md`

- [ ] **Step 1: Write the landing**

```markdown
---
title: "Learning Vue Vapor Mode"
description: "Vue's experimental compilation target skips the virtual DOM and writes to the DOM directly. We learn what it is, why it exists, how it compiles, how to turn it on, and when to reach for it — one step at a time."
series: "vue-vapor"
releaseDate: 2026-07-19
sourceUrl: "https://vuejs.org/guide/extras/rendering-mechanism.html"
difficulty: "Intermediate"
estMinutes: 83
img: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2000&auto=format&fit=crop"
author:
  name: "Vantol Bennett"
  img: "https://res.cloudinary.com/ddszyeplg/image/upload/v1636919468/DSC_0988_zsfhgy.jpg"
  website: "https://vantolbennett.com"
---

Here's the honest setup: if you write Vue, you know the virtual DOM — templates compile to render functions, the runtime diffs and patches. Vapor Mode is Vue's experimental bet that, for a lot of UIs, you can skip that layer entirely and write to the DOM directly. Smaller runtime, cheaper updates.

So this series is me learning it properly, and you're coming with me. We know Vue 3; we just haven't gone deep on _this_ feature yet.

::BlogAlert{type="warning"}
Vapor Mode is **experimental** and version-sensitive. This series pins one specific Vue version (see the setup lesson) so every command stays reproducible. Treat other versions' APIs as potentially different.
::

## What we cover

1. **What Is Vapor Mode?** — the one-line mental model.
2. **The Virtual DOM Tax** — what the vdom costs per update.
3. **How Vapor Compiles** — templates to direct DOM ops.
4. **Setting Up Vapor Mode** — hands-on, pinned version.
5. **Block Tree & Fine-Grained Reactivity** — the internals.
6. **Porting a Component** — light hands-on.
7. **Limitations** — what doesn't work yet.
8. **Roadmap & When to Use** — the adoption call.

## How this series works

Each step takes one idea through the same path: **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**

Mark each step complete as you go — your progress is saved in your browser. Ready? Start with step one.
```

- [ ] **Step 2: Commit**

```bash
git add apps/web/content/learn/vue-vapor/index.md
git commit -m "content(learn): add Vue Vapor Mode series landing"
```

---

## Task 10: Verify the series builds and renders

**Files:**

- Verify: `apps/web/content/learn/vue-vapor/*.md`

- [ ] **Step 1: Generate the site and check for content/schema errors**

```bash
vp run generate
```

Expected: the static build completes. Watch specifically for:

- No `@nuxt/content` schema validation errors referencing the `tutorials` collection (would indicate a bad frontmatter field).
- No errors mentioning `learn/vue-vapor`.

If the full generate is slow or fails for unrelated reasons, fall back to a dev-server smoke test:

```bash
vp run dev
# then open http://localhost:3000/learn/vue-vapor and /learn/vue-vapor/1
```

Expected: the series landing lists 8 steps; step 1 renders with the BlogAlert and the lesson body.

- [ ] **Step 2: Spot-check frontmatter parity**

Confirm every lesson file has `series: "vue-vapor"` and a unique `order` 1–8, and that `index.md` has no `order`/`feature`. A mismatch breaks series discovery or step ordering.

- [ ] **Step 3: Final commit (if any fixes were needed)**

```bash
git add apps/web/content/learn/vue-vapor/
git commit -m "content(learn): fix Vue Vapor series build/schema issues"
```

(Only if Step 1/2 required changes. Otherwise no commit needed.)

---

## Self-Review Notes

- **Spec coverage:** All 8 lessons + index present (Tasks 1–9); version-pinning constraint satisfied by Task 0 feeding Tasks 4/6/7; "light code / conceptual" discipline held (only lessons 4 & 6 are hands-on). Out-of-scope items (Reactivity Transform, Vue Macros, Nuxt integration) are explicitly referenced in lesson 8.
- **Placeholder scan:** Lessons 4, 6, 7 intentionally carry `<...>` tokens in the _plan_ but the task instructions require replacing them verbatim from the Task 0 pinned file before committing — no placeholder brackets may remain in committed files.
- **Type/name consistency:** `series: "vue-vapor"` is identical across all 9 files; `difficulty: "Intermediate"` consistent; author block copied verbatim; `order` 1–8 unique.
