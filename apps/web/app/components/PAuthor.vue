<script setup lang="ts">
defineProps<{
  author: {
    name: string
    img: string
  }
}>()
</script>

<template>
  <li class="flex items-center py-2 border-b border-white/10 last:border-0">
    <NuxtImg
      :src="author?.img"
      alt="avatar"
      width="32"
      height="32"
      class="object-cover w-8 h-8 mx-3 rounded-full border border-white/10"
    />
    <p>
      <NuxtLink
        :to="`/blog/author/${author?.name}`"
        class="text-sm text-zinc-400 hover:text-white transition-colors"
      >
        {{ author?.name }}
      </NuxtLink>
    </p>
  </li>
</template>
