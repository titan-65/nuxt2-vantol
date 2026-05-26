<script setup lang="ts">
defineProps<{
  type?: 'info' | 'warning' | 'success' | 'danger'
}>()
</script>

<template>
  <div
    class="my-6 p-4 border border-white/10 bg-[#111] rounded-xl font-sans"
    :class="{
      'border-white/10': type === 'info' || !type || type === 'success',
      'border-yellow-500/30 bg-yellow-500/5': type === 'warning',
      'border-red-500/30 bg-red-500/5': type === 'danger'
    }"
  >
    <div class="flex items-start gap-3">
      <div class="flex-1 text-sm leading-relaxed text-zinc-300">
        <slot />
      </div>
    </div>
  </div>
</template>
