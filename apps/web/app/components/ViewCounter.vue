<script setup lang="ts">
const props = defineProps<{
  slug: string;
}>();

const { views, loading, init, trackView } = useRealtimeViews(props.slug);

const mounted = ref(false);

onMounted(async () => {
  mounted.value = true;
  init();
  await trackView();
});
</script>

<template>
  <div
    v-if="mounted && !loading"
    class="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
    <span class="tabular-nums"
      >{{ views.toLocaleString() }} {{ views === 1 ? "view" : "views" }}</span
    >
  </div>
</template>
