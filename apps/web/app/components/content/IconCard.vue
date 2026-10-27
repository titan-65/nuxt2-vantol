<script setup lang="ts">
defineProps({
  title: {
    type: String,
    default: "Default title",
  },
  description: {
    type: String,
    default: "Default description",
  },
  icon: {
    type: String,
    default: "i-lucide-box",
  },
});
</script>

<template>
  <div
    class="p-6 border border-border bg-card hover:border-border-strong transition-colors group my-6 rounded-xl"
  >
    <div
      class="w-12 h-12 flex items-center justify-center bg-background border border-border rounded-lg mb-4 group-hover:border-border-strong transition-colors"
    >
      <div :class="icon" class="w-6 h-6 text-blue" />
    </div>
    <h2 class="text-xl font-semibold mb-2 tracking-tight">
      {{ title }}
    </h2>
    <p class="text-sm text-muted-foreground font-light leading-relaxed">
      {{ description }}
    </p>
    <div
      v-if="$slots.default"
      class="mt-4 pt-4 border-t border-border prose  prose-sm max-w-none"
    >
      <slot />
    </div>
  </div>
</template>
