<script setup lang="ts">
defineProps<{ id: string }>();
</script>

<template>
  <h1
    :id="id"
    class="scroll-mt-28 text-balance text-[clamp(2rem,4vw,3rem)] font-medium leading-[1.05] tracking-[-0.03em]"
  >
    <slot />
  </h1>
</template>
