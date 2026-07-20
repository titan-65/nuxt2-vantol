---
title: "The useAnnouncer Composable"
description: "Announce dynamic in-page changes — form results, loading states, search updates — to screen readers, with polite and assertive channels."
series: "nuxt-4-4"
order: 3
feature: "useAnnouncer + <NuxtAnnouncer>"
sourcePRs: ["https://github.com/nuxt/nuxt/pull/34318"]
---

## What's new

Nuxt 4.4 adds the `useAnnouncer` composable and a `<NuxtAnnouncer>` component for announcing **dynamic in-page changes** to assistive technology — distinct from `useRouteAnnouncer`, which only covers navigation.

## Why you'd care

Plenty happens without a page change: a form submits, a search returns results, a background save completes. Screen-reader users miss all of it unless you announce it. `useAnnouncer` gives you a proper, ARIA-live-backed way to do that.

## Before

You wired up your own ARIA live region and pushed text into it by hand:

```vue
<template>
  <p aria-live="polite" class="sr-only">{{ liveMessage }}</p>
</template>

<script setup lang="ts">
const liveMessage = ref('')
async function submit() {
  await $fetch('/api/contact', { method: 'POST', body: form })
  liveMessage.value = 'Message sent successfully'
}
</script>
```

Every component reinvented the same region and its quirks.

## After

Mount the announcer once, then call `polite` / `assertive` anywhere:

```vue [app.vue]
<template>
  <NuxtAnnouncer />
  <NuxtRouteAnnouncer />
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
```

```vue [components/ContactForm.vue]
<script setup lang="ts">
const { polite, assertive } = useAnnouncer()

async function submitForm() {
  try {
    await $fetch('/api/contact', { method: 'POST', body: formData })
    polite('Message sent successfully')
  }
  catch (error) {
    assertive('Error: Failed to send message')
  }
}
</script>
```

## Do it yourself

1. Add `<NuxtAnnouncer />` to `app.vue` alongside `<NuxtRouteAnnouncer />`.
2. In a form component, grab `const { polite, assertive } = useAnnouncer()`.
3. On success call `polite(...)`; on error call `assertive(...)`.
4. Turn on a screen reader (VoiceOver on macOS: ⌘+F5) and submit the form.
5. Confirm success is announced calmly and errors interrupt immediately.

## Gotchas

- `polite` waits for the reader to finish; `assertive` interrupts. Reserve `assertive` for genuine errors — overusing it is hostile to screen-reader users.
- You don't need it everywhere. If an interaction moves focus to new content, that already announces itself. `useAnnouncer` is for changes with **no** matching focus change.

## Recap

`useAnnouncer` (`polite`/`assertive`) plus `<NuxtAnnouncer>` announce dynamic content changes to assistive tech. Reach for it when content updates without a focus move.
