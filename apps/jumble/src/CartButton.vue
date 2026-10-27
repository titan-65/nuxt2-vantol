<script setup lang="ts">
defineProps<{
  count: number;
}>();

defineEmits<{
  open: [];
}>();
</script>

<template>
  <button
    type="button"
    class="cart-trigger"
    :aria-label="`Open your box, ${count} ${count === 1 ? 'box' : 'boxes'}`"
    @click="$emit('open')"
  >
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6.2 8.5h11.6l-1 11.1H7.2L6.2 8.5Z" stroke="currentColor" stroke-width="1.7" />
      <path
        d="M9.2 8.5V7a2.8 2.8 0 0 1 5.6 0v1.5"
        stroke="currentColor"
        stroke-width="1.7"
        stroke-linecap="round"
      />
    </svg>
    <span class="cart-trigger-label">Box</span>
    <span v-if="count > 0" class="cart-count" aria-hidden="true">{{ count }}</span>
  </button>
</template>
