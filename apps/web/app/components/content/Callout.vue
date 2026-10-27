<script setup lang="ts">
defineProps<{
  icon?: string;
  title?: string;
}>();
</script>

<template>
  <aside class="my-8 border-y border-border bg-surface px-5 py-5">
    <p v-if="title" class="label flex items-center gap-2 text-foreground">
      <span v-if="icon" aria-hidden="true">{{ icon }}</span>
      {{ title }}
    </p>
    <div
      class="mt-3 font-serif text-[15px] leading-[1.7] text-muted-foreground [&_a]:text-blue [&_a]:underline [&_p]:m-0 [&_p+p]:mt-3"
    >
      <slot />
    </div>
  </aside>
</template>
