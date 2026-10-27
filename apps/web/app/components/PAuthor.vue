<script setup lang="ts">
defineProps<{
  author: {
    name: string;
    img: string;
  };
}>();
</script>

<template>
  <li class="flex items-center border-b border-border py-2 last:border-0">
    <NuxtImg
      :src="author?.img"
      alt=""
      width="28"
      height="28"
      class="mr-3 h-7 w-7 border border-border object-cover grayscale"
    />
    <NuxtLink
      :to="`/blog/author/${author?.name}`"
      class="text-[13px] text-muted-foreground transition-colors hover:text-foreground"
    >
      {{ author?.name }}
    </NuxtLink>
  </li>
</template>
