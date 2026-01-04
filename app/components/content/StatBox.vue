<script setup lang="ts">
defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  }
})
</script>

<template>
  <div class="inline-flex flex-col border border-black/20 p-4 bg-white min-w-[120px]">
    <span class="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{{ label }}</span>
    <span class="text-2xl font-mono font-medium">{{ value }}</span>
  </div>
</template>
