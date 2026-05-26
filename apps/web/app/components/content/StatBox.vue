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
  <div class="inline-flex flex-col border border-white/10 p-4 bg-[#111] min-w-[120px] rounded-xl">
    <span class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">{{ label }}</span>
    <span class="text-2xl font-mono font-medium text-white">{{ value }}</span>
  </div>
</template>
