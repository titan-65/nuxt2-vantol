---
title: "Vue Vapor & my-bad Errors: Render Less, Debug Faster"
description: "Opt components into Vue 3.6 Vapor with a script-setup attribute, and meet the my-bad dev overlay — mapped SSR stacks, code frames, and copy-as-agent-prompt."
series: "nuxt-4-6"
order: 5
feature: "vue.vapor + my-bad error overlay"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/35759", "https://github.com/nuxt/nuxt/pull/36258"]
---

## What's new

Two DX upgrades that pair well: **Vue Vapor support** (interop mode — app root stays on the virtual DOM, individual components/pages opt into Vapor) and the **my-bad error pipeline** replacing the Youch iframe (mapped SSR stacks + code frames in your own error page, copy-as-agent-prompt, single CLI-level error channel).

## Why you'd care

Vapor is the pay-as-you-go performance story: keep the whole app working exactly as today, compile the hot components without the virtual DOM. And the error pipeline attacks the most expensive minutes of the day — "where did this SSR error actually come from" — by mapping traces before anything reads them.

## Before

Vapor didn't exist in Nuxt; SSR errors gave you a bare message with no position:

```text
ReferenceError: foo is not defined
    at Object.<anonymous> (/_nuxt/app/pages/index.vue:1:1)
```

## After

Enable Vapor, opt in per component:

```ts [nuxt.config.ts]
export default defineNuxtConfig({
  vue: {
    vapor: true,
  },
});
```

```vue [app/pages/index.vue]
<script setup vapor lang="ts">
const count = ref(0);
</script>

<template>
  <button @click="count++">count is {{ count }}</button>
</template>
```

Routing, `useAsyncData`, layouts, and most built-ins work unchanged. Meanwhile every dev SSR error now renders through my-bad: mapped stack + source code frame in your app's error page (standalone page when the app can't render one), a **Copy error** button with Markdown / agent-prompt / JSON formats, the same report in the terminal, and fatal startup errors (e.g. `nuxt.config.ts` syntax) served as a page that reloads once fixed. One error rendered once — not re-rendered at every layer it passes through.

## Do it yourself

1. Set `vue: { vapor: true }` (needs Vue `^3.6.0-rc.2+`) in a scratch project first — not your production app.
2. Add `vapor` to one leaf component; confirm routing/`useAsyncData` around it behave.
3. Throw a reference error in a page's SSR path; read the mapped stack + code frame.
4. Use Copy error → agent prompt; paste it to your agent and judge the diagnosis quality.
5. Break `nuxt.config.ts`; watch the fatal page, fix it, watch the reload.

## Gotchas

Vapor in Nuxt is early: interop mode only, known limitations documented upstream, fresh-project trial recommended. Requires Vue `^3.6.0-rc.2` — check what version your lockfile actually resolved. On the error side, `experimental.inlineErrorRendering` changes failure semantics (error rendered in-request via try/catch instead of an internal `/__nuxt_error` request — headers/cookies already set are kept); it's part of the `compatibilityVersion: 5` set, so try it deliberately rather than discovering it.

## Recap

`vapor` attribute opts hot components out of the vDOM while the app stays put; my-bad turns SSR errors into mapped, framed, copyable reports with agent-prompt export. Vapor = scratch project first; error pipeline = free the moment you upgrade.
