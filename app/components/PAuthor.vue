<script setup lang="ts">
defineProps<{
  author: {
    name: string
    img: string
  }
}>()
</script>

<template>
  <li class="flex items-center py-2 border-b border-black/10 last:border-0">
    <img
      :src="author?.img"
      alt="avatar"
      class="object-cover w-8 h-8 mx-3 rounded-full grayscale"
    />
    <p>
      <NuxtLink
        :to="`/blog/author/${author?.name}`"
        class="font-mono text-sm text-gray-600 hover:text-black hover:underline uppercase tracking-wide"
      >
        {{ author?.name }}
      </NuxtLink>
    </p>
  </li>
</template>
