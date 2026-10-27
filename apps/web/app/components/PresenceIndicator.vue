<script setup lang="ts">
const props = defineProps<{
  slug: string;
}>();

const { activeReaders, init, joinPost, cleanup } = usePresence(props.slug);

onMounted(() => {
  init();
  joinPost();
});

onUnmounted(() => {
  cleanup();
});
</script>

<template>
  <div
    v-if="activeReaders > 0"
    class="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
  >
    <span class="relative flex h-1.5 w-1.5">
      <span class="absolute inline-flex h-full w-full rounded-full bg-success opacity-50" />
      <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
    </span>
    <span class="tabular-nums">
      {{ activeReaders }} {{ activeReaders === 1 ? "person" : "people" }} reading
    </span>
  </div>
</template>
