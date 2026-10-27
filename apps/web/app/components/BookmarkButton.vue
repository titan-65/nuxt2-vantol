<script setup lang="ts">
const props = defineProps<{
  slug: string;
  title: string;
}>();

const { isBookmarked, toggleBookmark } = useBookmarks();

const saved = ref(false);

onMounted(() => {
  saved.value = isBookmarked(props.slug);
});

const handleToggle = () => {
  saved.value = toggleBookmark(props.slug, props.title);
};
</script>

<template>
  <button
    type="button"
    class="group inline-flex items-center gap-1.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
    :title="saved ? 'Remove bookmark' : 'Save for later'"
    @click="handleToggle"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      :fill="saved ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="1.5"
      class="transition-colors"
      :class="saved ? 'text-blue' : 'text-faint-ink group-hover:text-foreground'"
      aria-hidden="true"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
    <span>{{ saved ? "Saved" : "Save" }}</span>
  </button>
</template>
