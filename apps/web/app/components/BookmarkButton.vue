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
    @click="handleToggle"
    class="group flex items-center gap-1 text-xs font-mono text-zinc-500 hover:text-white transition-colors uppercase"
    :title="saved ? 'Remove bookmark' : 'Save for later'"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      :fill="saved ? 'currentColor' : 'none'"
      stroke="currentColor"
      stroke-width="2"
      class="transition-colors"
      :class="saved ? 'text-[#f5c542]' : 'text-zinc-600 group-hover:text-white'"
    >
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
    <span class="hidden sm:inline">{{ saved ? "Saved" : "Save" }}</span>
  </button>
</template>
