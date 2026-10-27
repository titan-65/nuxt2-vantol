<script setup lang="ts">
defineProps<{
  prev: {
    title: string;
    path: string;
  } | null;
  next: {
    title: string;
    path: string;
  } | null;
}>();

const getSlug = (path: string | undefined) => path?.split("/").pop() || "";
</script>

<template>
  <div class="grid gap-6 sm:grid-cols-2">
    <NuxtLink
      v-if="prev"
      :to="`/blog/${getSlug(prev.path)}`"
      class="group block border-t border-border pt-3"
    >
      <p class="label">Previous</p>
      <p
        class="mt-2 text-[15px] font-medium leading-snug transition-colors group-hover:text-blue"
      >
        ← {{ prev.title }}
      </p>
    </NuxtLink>
    <span v-else />

    <NuxtLink
      v-if="next"
      :to="`/blog/${getSlug(next.path)}`"
      class="group block border-t border-border pt-3 sm:text-right"
    >
      <p class="label">Next</p>
      <p
        class="mt-2 text-[15px] font-medium leading-snug transition-colors group-hover:text-blue"
      >
        {{ next.title }} →
      </p>
    </NuxtLink>
    <span v-else />
  </div>
</template>
