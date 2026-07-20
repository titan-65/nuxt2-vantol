---
title: "Custom useFetch & useAsyncData Factories"
description: "Build your own useFetch/useAsyncData instances with baked-in defaults — baseURL, headers, server-only — fully typed and SSR-safe."
series: "nuxt-4-4"
order: 1
feature: "createUseFetch / createUseAsyncData"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/32300"]
---

## What's new

Nuxt 4.4 adds `createUseFetch` and `createUseAsyncData` — factories that produce **custom instances** of the data composables with your own default options.

## Why you'd care

Almost every app ends up wrapping `useFetch` to inject a `baseURL`, auth headers, or `server: false`. Those wrappers were always a little awkward — they lost typing, or broke SSR key injection. The factories give you a first-class, fully-typed, SSR-safe instance instead.

## Before

You hand-rolled a wrapper and hoped the types survived:

```ts [composables/useApiFetch.ts]
export function useApiFetch<T>(url: string, opts = {}) {
  const config = useRuntimeConfig()
  return useFetch<T>(url, { baseURL: config.public.baseApiUrl, ...opts })
}
```

Workable, but the generics and option merging got fragile fast.

## After

Create a typed instance once and use it like `useFetch`:

```ts [composables/api.ts]
// Simple defaults
export const useClientFetch = createUseFetch({
  server: false,
})

// Dynamic defaults with full control over merging
export const useApiFetch = createUseFetch((currentOptions) => {
  const runtimeConfig = useRuntimeConfig()
  return {
    ...currentOptions,
    baseURL: currentOptions.baseURL ?? runtimeConfig.public.baseApiUrl,
  }
})
```

```vue [pages/dashboard.vue]
<script setup lang="ts">
// Uses your baseURL from runtimeConfig automatically
const { data: users } = await useApiFetch('/users')
</script>
```

Pass a plain object and your call-site options override the defaults. Pass a function and you control exactly how options merge.

## Do it yourself

1. Add `runtimeConfig.public.baseApiUrl` in `nuxt.config.ts`.
2. Create `composables/api.ts` and export `useApiFetch = createUseFetch(...)` with the function form above.
3. In a page, call `useApiFetch('/some-endpoint')` — no `baseURL` needed.
4. Confirm the request hits your configured base URL and that types flow through (`data` is typed).
5. Add a `useClientFetch` instance with `server: false` and confirm it only runs on the client.

## Gotchas

- The factory works by scanning your `composables/` directory to register instances for SSR key injection — keep your custom instances in `composables/` so they're picked up.
- Prefer the **function form** when a default depends on runtime state (like `useRuntimeConfig`), since the object form is evaluated too eagerly for that.

## Recap

`createUseFetch` / `createUseAsyncData` replace hand-rolled wrappers with typed, SSR-safe instances carrying your defaults. Define them once in `composables/`, use them everywhere.
