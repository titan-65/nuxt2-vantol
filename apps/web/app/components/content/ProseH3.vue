<script setup lang="ts">
defineProps<{ id: string }>();
</script>

<template>
  <h3
    :id="id"
    class="group flex scroll-mt-28 items-baseline gap-3 text-balance text-[clamp(1.2rem,1.7vw,1.4rem)] font-medium leading-[1.2] tracking-[-0.02em]"
  >
    <slot />
    <a
      :href="`#${id}`"
      class="font-mono text-[10px] font-normal text-faint-ink opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
      aria-label="Link to this section"
      >#</a
    >
  </h3>
</template>
