<script setup lang="ts">
defineProps<{
  type?: "info" | "warning" | "success" | "danger";
}>();
</script>

<template>
  <div
    class="my-6 border-y px-5 py-4 font-sans text-[14px] leading-[1.7]"
    :class="{
      'border-border bg-surface text-foreground': type === 'info' || !type,
      'border-success/30 bg-success/5 text-foreground': type === 'success',
      'border-warning/40 bg-warning/5 text-foreground': type === 'warning',
      'border-danger/30 bg-danger/5 text-foreground': type === 'danger',
    }"
    role="note"
  >
    <slot />
  </div>
</template>
