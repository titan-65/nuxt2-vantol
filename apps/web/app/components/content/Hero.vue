<script setup lang="ts">
defineProps<{
  title?: string
  description?: string
}>()
</script>

<template>
  <section class="py-12 px-8 my-8 bg-black text-white border border-white/10 relative overflow-hidden">
    <div class="relative z-10 max-w-2xl">
      <h1 class="text-4xl md:text-6xl font-medium tracking-tight mb-4 leading-tight">
        <slot />
      </h1>
      <div v-if="$slots.description" class="text-gray-400 font-mono text-sm leading-relaxed italic">
        <slot name="description" />
      </div>
      <p v-else-if="description" class="text-gray-400 font-mono text-sm leading-relaxed italic">
        {{ description }}
      </p>
    </div>
    
    <!-- Decorative background elements -->
    <div class="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
    <div class="absolute bottom-0 left-0 w-32 h-32 bg-[#FF4F4F]/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
  </section>
</template>
