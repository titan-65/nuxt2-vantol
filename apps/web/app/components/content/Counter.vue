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
  <div class="my-8 border border-white/10 p-6 bg-[#111] rounded-xl flex flex-col items-center gap-4">
    <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Interactive Component</p>
    <div class="flex items-center gap-8">
      <button
        @click="decrement"
        class="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-colors text-xl font-bold rounded-lg text-zinc-300"
      >
        -
      </button>
      <div class="text-4xl font-mono font-medium min-w-[3ch] text-center">
        {{ count }}
      </div>
      <button
        @click="increment"
        class="w-10 h-10 border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-white/20 transition-colors text-xl font-bold rounded-lg text-zinc-300"
      >
        +
      </button>
    </div>
    <p class="text-xs font-mono text-zinc-600 italic">
      Counter: {{ count }}
    </p>
  </div>
</template>