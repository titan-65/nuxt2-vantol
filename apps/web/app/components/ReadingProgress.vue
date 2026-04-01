<script setup lang="ts">
const progress = ref(0)

const updateProgress = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  progress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
}

onMounted(() => {
  window.addEventListener('scroll', updateProgress, { passive: true })
  updateProgress()
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateProgress)
})
</script>

<template>
  <div class="fixed top-0 left-0 right-0 z-50 h-1 bg-gray-200 dark:bg-gray-700">
    <div
      class="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-150"
      :style="{ width: `${progress}%` }"
    />
  </div>
</template>
