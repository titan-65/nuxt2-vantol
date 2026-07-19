# Design: "Vue Vapor Mode" tutorial series

- **Date:** 2026-07-19
- **Status:** Approved (design)
- **Author:** Vantol Bennett
- **Source docs:** https://vuejs.org/ (Vapor Mode RFC + canary docs), https://github.com/vuejs/core (Vapor Mode implementation), https://blog.vuejs.org/

## Goal

Produce an intermediate, conceptual-with-light-code tutorial series on **Vue Vapor Mode** — the experimental compilation strategy that skips the virtual DOM — published in the blog's existing `learn/` section. The reader builds a correct mental model of *what Vapor Mode is, why it exists, how it compiles, how to turn it on, and when to reach for it*, without needing to ship it to production.

## Audience

Web developers comfortable with **Vue 3 Composition API** who are **curious about Vapor Mode** but have not gone deep. They know the vdom mentally; they want to understand Vapor's model and trade-offs, not necessarily adopt it today. Conceptual explanations lead; code stays illustrative (small snippets + one runnable setup example).

## Series format (matches existing `learn/` convention)

- Folder: `apps/web/content/learn/vue-vapor/`
- `index.md` + numbered lessons `NN-slug.md`
- Each lesson frontmatter mirrors the Nuxt series:
  - `index.md`: `title`, `description`, `series`, `releaseDate`, `sourceUrl`, `difficulty`, `estMinutes`, `img`, `author`
  - lesson: `title`, `description`, `series`, `order`, `feature`, `sourcePRs` (or `sourceUrl`), `difficulty: Intermediate`, `estMinutes`
- Each lesson body follows the proven path:
  **What it is → Why you'd care → Before → After → Do it yourself → Gotchas → Recap.**
- A `::BlogAlert` intro on `index.md` notes the series covers an **experimental, version-sensitive** feature and pins the Vue version used.

## Version pinning (critical constraint)

Vapor Mode is experimental; the enablement API and supported surface shift between canary builds. The series must:

1. Pin to **one specific documented Vue version** (a canary/alpha that exposes Vapor Mode) decided during the implementation research pass.
2. State that version explicitly in lesson 4 (setup) and reference it anywhere commands appear.
3. Keep conceptual lessons (1, 2, 3, 5, 7, 8) version-agnostic where possible so they stay accurate as Vapor evolves; only the setup/port lessons tie to the pinned version.

Implementation includes a **research pass** to lock the exact enablement steps (`@vue/vapor` import surface, Vite plugin flag, or canary build) before writing lessons 4 and 6.

## Lesson plan

### `index.md`
Series landing: what Vapor Mode is in one line, how the series works, difficulty/estimate, the experimental-version note + pinned version, and "start with step one."

### `01-what-is-vapor-mode.md` — What Is Vapor Mode?
- Conceptual intro: a compile-time strategy that emits direct DOM operations instead of a vdom runtime; smaller bundle, fewer allocations, faster updates.
- The problem it attacks: framework runtime overhead on update.
- Before: "Vue = virtual DOM diffing." After: "Vue can also compile to fine-grained DOM patches."
- DIY: none (conceptual). Gotchas: Vapor is opt-in, not a replacement for the vdom yet.

### `02-virtual-dom-tax.md` — The Virtual DOM Tax
- What the vdom actually costs at runtime: vnode creation, component instances, the diff pass, tree walks on every update.
- Why this matters at scale (many small components, frequent updates).
- Before: a list of 1,000 rows re-rendered through vnodes. After: the same update conceptually bypassing vnode allocation.
- DIY: none (conceptual, maybe a tiny perf-mental-model note). Gotchas: vdom is not "slow" — the tax is per-update overhead.

### `03-how-vapor-compiles.md` — How Vapor Compiles
- Templates are statically analyzed: dynamic parts identified at compile time, emitted as a **block tree** of direct DOM operations rather than a render function returning vnodes.
- Contrast the two compilation outputs side by side (conceptual diagram in prose/code).
- Before: `render() { return h('div', state.msg) }` + diff. After: a block that sets `el.textContent = state.msg` on change.
- DIY: none. Gotchas: static parts are hoisted; only dynamic bindings get patched.

### `04-setting-up-vapor-mode.md` — Setting Up Vapor Mode (hands-on)
- **The one practical lesson.** Enable Vapor in a Vue + Vite project against the pinned version: install the canary/`@vue/vapor` build, flip the enable flag in the Vite plugin, scaffold a minimal `App.vue`.
- Verify it's compiling vapor (build output / devtools signal per pinned version).
- Before: a standard vdom Vue project. After: the same app running under Vapor compilation.
- DIY: create the minimal project, enable Vapor, confirm it runs. Gotchas: tooling/version mismatch is the #1 failure; pin the version.

### `05-block-tree-and-reactivity.md` — Block Tree & Fine-Grained Reactivity
- Internals: how a block tracks its dynamic parts, how Vue's reactivity (proxies) drives targeted DOM mutations, and why leaf Vapor components avoid per-instance overhead.
- Before: every component = an instance + vnode tree. After: a block = a flat set of effect-tracked DOM ops.
- DIY: none (conceptual). Gotchas: reactivity is still Proxy-based; Vapor changes *where* effects attach, not the reactivity engine.

### `06-porting-a-component.md` — Porting a Component to Vapor (light hands-on)
- Take a small, realistic vdom component (e.g. a counter / todo row) and rewrite it for Vapor; show what stays the same (Composition API, `ref`) and what differs.
- Before: the component as a normal Vue SFC. After: the Vapor-compiled equivalent / annotated version.
- DIY: port the example component in the lesson-4 project. Gotchas: unsupported syntax fails loudly at compile time — that's the cue to check lesson 7.

### `07-limitations.md` — Limitations & What Doesn't Work Yet
- Honest caveats for the pinned version: dynamic components, certain directives/edges, SSR/hydration status, devtools, and ecosystem/library compatibility.
- Before: "it's just Vue, everything works." After: a clear map of what's supported vs. not.
- DIY: none. Gotchas: check the pinned version's support matrix before assuming parity.

### `08-roadmap-and-when-to-use.md` — Roadmap & When to Reach For It
- Current status of Vapor Mode, the roadmap signal from the Vue team, and a decision guide: workloads that benefit (many leaf nodes, frequent small updates) vs. those to wait on (heavy dynamic components, untested libs).
- Before: "should I adopt Vapor?" After: a clear personal yes/no checklist.
- DIY: none. Gotchas: experimental — don't put it in prod blind; track the pinned version's changelog.

## Conventions

- Code blocks use real Vue/Vite APIs accurate to the **pinned version**; no invented APIs. Conceptual lessons favor prose + small snippets over full apps.
- `Before`/`After` contrast makes each lesson self-contained; conceptual lessons (1, 2, 3, 5, 7, 8) may omit DIY.
- Tone: plain, curious, for devs who know Vue 3 but not Vapor. Mirror the Nuxt series voice.
- Images: Unsplash URL in frontmatter (Vue/performance themed; swap if preferred).

## Out of scope (this series)

Other experimental Vue surfaces (Reactivity Transform, Vue Macros), Vapor integration with Nuxt, building a full Vapor app, and production migration guidance — referenced in lesson 8 as "go deeper" pointers.

## Acceptance

- All 9 files (`index.md` + 8 lessons) exist under `learn/vue-vapor/`.
- Files follow the existing `learn/nuxt-4-3/` frontmatter shape and body path.
- The pinned Vue version is stated in lesson 4 and the index alert.
- Every code sample is accurate to the pinned version (verified in the research pass).
- Conceptual lessons stay version-agnostic; only setup/port lessons tie to the pin.
