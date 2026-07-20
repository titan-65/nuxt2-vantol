# Vue Vapor Mode — Pinned Version Reference

**Date pinned:** 2026-07-19
**Purpose:** Single source of truth for every command/config in the Vue Vapor Mode tutorial series. All lessons MUST use exactly these versions.

## Pinned version / package string

Vapor Mode became **feature-complete in Vue 3.6**, which entered the RC phase on 2026-07-18. The stable `latest` tag is still `3.5.x` (no Vapor), so the tutorial pins the RC:

- `vue@3.6.0-rc.1` (published 2026-07-18; Vapor Mode feature-complete, `createVaporApp` + `vaporInteropPlugin` shipped in the main `vue` package — no separate `@vue/vapor` install required)
- `@vitejs/plugin-vue@6.0.8` (latest; compiles the SFC `vapor` marker via `vue/compiler-sfc`)

### Literal install command

```bash
npm install vue@3.6.0-rc.1 && npm install -D @vitejs/plugin-vue@6.0.8 vite
```

pnpm equivalent:

```bash
pnpm add vue@3.6.0-rc.1 && pnpm add -D @vitejs/plugin-vue@6.0.8 vite
```

Pin these exactly in `package.json` (no `^`/`~`) so the whole series is reproducible:

```json
{
  "dependencies": {
    "vue": "3.6.0-rc.1"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "6.0.8",
    "vite": "^7.0.0"
  }
}
```

## Enablement — literal snippets

Vapor Mode is **100% opt-in at the SFC level** via a `vapor` marker. There is NO Vite build flag or `plugin-vue` option to flip; the standard plugin already understands the marker.

### 1. Mark an SFC as Vapor

Any one of these forms opts a single-file component into Vapor compilation:

```vue
<script setup vapor>
// ...
</script>
```

`<script vapor>` is shorthand for `<script setup vapor>`. The marker may also go on the template to Vapor-compile the whole SFC:

```vue
<template vapor>
  <!-- ... -->
</template>
```

Only template-only SFCs and `<script setup>` SFCs are supported. The Options API is NOT supported in Vapor.

### 2. `vite.config.ts` (unchanged — standard plugin)

```ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
})
```

### 3. App entry — choose ONE

**Pure Vapor app** (avoids pulling in the VDOM runtime → smallest bundle):

```ts
// src/main.ts
import { createVaporApp } from 'vue'
import App from './App.vue'

createVaporApp(App).mount('#app')
```

**VDOM app that also hosts Vapor components** (interop):

```ts
// src/main.ts
import { createApp, vaporInteropPlugin } from 'vue'
import App from './App.vue'

createApp(App).use(vaporInteropPlugin).mount('#app')
```

Recommendation from the core team: keep distinct regions using one rendering mode; avoid deep mixed nesting.

## Verify it compiled to Vapor

Vapor components have a documented, observable runtime difference: **`getCurrentInstance()` returns `null` inside a Vapor component** (VDOM components return a non-null instance). Use this as the reproducible success signal.

Add a temporary check to the Vapor SFC:

```vue
<script setup vapor>
import { getCurrentInstance } from 'vue'
console.log('vapor?', getCurrentInstance() === null)
</script>
```

### Verify command + expected signal

```bash
npm run dev
```

Expected success signal in the browser console:

```
vapor? true
```

`true` ⇒ compiled as Vapor. `false` (non-null instance) ⇒ still VDOM (the `vapor` marker was dropped/missing).

Secondary bundle-level signal — for a **pure `createVaporApp`** build, the VDOM runtime is tree-shaken out:

```bash
npm run build
```

Expected: the production chunk does not contain VDOM-only symbols such as `createElementVNode` / `createBlock`. Confirm with:

```bash
grep -rc "createElementVNode" dist/assets/*.js
```

Expected: `0` for a pure-Vapor app.

## Support matrix (vue@3.6.0-rc.1)

| Area | Status |
| --- | --- |
| `<script setup vapor>` / `<template vapor>` | ✅ Supported (opt-in per SFC) |
| Options API | ❌ Not supported |
| `v-if` / `v-for` / `v-show` | ✅ Supported |
| Dynamic components `<component :is>` | ✅ Supported (dynamic-component hydration fixes landed in rc.1) |
| Slots / scoped slots | ✅ Supported — but `slots.default()` is NOT a side-effect-free dry run; let the template render slots |
| SSR / hydration | ✅ Supported; feature-complete in rc.1 (active hydration bug-fixing during RC) |
| Custom directives | ⚠️ Different `VaporDirective` interface (reactive getter `value`, returns cleanup fn) |
| Event handling | ⚠️ Events delegated to `document`; ancestor `stopPropagation()` breaks delegated handlers. Use `@[event]`, `v-bind="{ onClick }"`, or `v-on="{}"` to attach directly |
| Template refs on components | ⚠️ Do not expose `$el`, `$props`, `$attrs`, `$slots`, `$refs` |
| `getCurrentInstance()` | ❌ Returns `null` in Vapor components (by design) |
| `app.config.globalProperties` | ❌ Not available |
| `@vue:xxx` per-element lifecycle events | ❌ Not supported |
| `v-memo` | ❌ Not supported |
| VDOM ⇄ Vapor interop | ⚠️ Via `vaporInteropPlugin`; props/events/slots covered, edge cases remain |
| Third-party (VDOM) component libraries | ⚠️ Work only through interop; "rough edges" expected in Vapor Mode |
| Devtools maturity | ⚠️ Immature — Vapor is RC; devtools support for Vapor internals still stabilizing |
| Performance | ✅ On par with Solid / Svelte 5 in js-framework-benchmark |

## Source URLs

- Vue 3.6.0-rc.1 release notes (Vapor "About / Opting In / Feature Compatibility"): https://github.com/vuejs/core/releases/tag/v3.6.0-rc.1
- vuejs/core releases index: https://github.com/vuejs/core/releases
- `vue` on npm (version/tags: `rc` → 3.6.0-rc.1, `latest` → 3.5.40): https://www.npmjs.com/package/vue?activeTab=versions
- `@vitejs/plugin-vue` on npm (6.0.8) + options reference: https://www.npmjs.com/package/@vitejs/plugin-vue
- Vue compile-time flags reference: https://vuejs.org/api/compile-time-flags.html
- vuejs/core repository: https://github.com/vuejs/core

## Uncertainty / risk

- **Pre-release, not stable.** `3.6.0-rc.1` is an RC; APIs are feature-complete but bugs (esp. hydration/slots) are still being fixed. A later `3.6.0-rc.N` or `3.6.0` final may change minor behavior — re-verify before publishing lessons if a newer 3.6 tag ships.
- **No dedicated Vapor page in stable vuejs.org docs yet.** Enablement details here come from the authoritative RC release notes, not the stable docs site. Watch for a `vuejs.org` Vapor guide + a Vue 3.6 blog post at https://blog.vuejs.org for canonical wording.
- **Devtools + third-party libs are the weakest links.** Expect breakage when using VDOM component libraries inside Vapor regions; keep tutorial examples first-party.
- **`getCurrentInstance() === null` verify** is documented behavior but is a runtime (not build-time) check; the `dist` grep for `createElementVNode` only proves Vapor for a *pure* `createVaporApp` build, not for interop builds.
