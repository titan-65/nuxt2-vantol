<script setup lang="ts">
defineProps<{ id: string }>();
</script>

<template>
  <h2
    :id="id"
    class="group flex scroll-mt-28 items-baseline gap-3 text-balance text-[clamp(1.5rem,2.4vw,1.9rem)] font-medium leading-[1.15] tracking-[-0.025em]"
  >
    <slot />
    <a
      :href="`#${id}`"
      class="font-mono text-[11px] font-normal text-faint-ink opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
      aria-label="Link to this section"
      >#</a
    >
  </h2>
</template>
