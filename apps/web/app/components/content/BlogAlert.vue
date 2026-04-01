<script setup lang="ts">
defineProps<{
  type?: 'info' | 'warning' | 'success' | 'danger'
}>()
</script>

<template>
  <div
    class="my-6 p-4 border border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-sans"
    :class="{
      'border-black': type === 'info' || !type || type === 'success',
      'border-black bg-gray-50': type === 'warning',
      'border-black bg-black text-white': type === 'danger'
    }"
  >
    <div class="flex items-start gap-3">
      <div class="flex-1 text-sm leading-relaxed">
        <slot />
      </div>
    </div>
  </div>
</template>
