<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <div class="inline-flex min-w-[120px] flex-col border-t border-border pt-3">
    <span class="label">{{ label }}</span>
    <span class="mt-1 font-mono text-2xl font-medium tabular-nums text-foreground">{{
      value
    }}</span>
  </div>
</template>
