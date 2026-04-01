<script setup lang="ts">
const count = ref(0)

const increment = () => {
  count.value++
}

const decrement = () => {
  count.value--
}
</script>

<template>
  <div class="my-8 border border-black p-6 bg-white flex flex-col items-center gap-4">
    <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400">Interactive Component</p>
    <div class="flex items-center gap-8">
      <button
        @click="decrement"
        class="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-xl font-bold"
      >
        -
      </button>
      <div class="text-4xl font-mono font-medium min-w-[3ch] text-center">
        {{ count }}
      </div>
      <button
        @click="increment"
        class="w-10 h-10 border border-black flex items-center justify-center hover:bg-black hover:text-white transition-colors text-xl font-bold"
      >
        +
      </button>
    </div>
    <p class="text-xs font-mono text-gray-500 italic">
      Counter: {{ count }}
    </p>
  </div>
</template>
