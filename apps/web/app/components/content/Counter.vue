<script setup lang="ts">
const count = ref(0);

const increment = () => {
  count.value++;
};

const decrement = () => {
  count.value--;
};
</script>

<template>
  <div
    class="my-8 border border-border p-6 bg-card rounded-xl flex flex-col items-center gap-4"
  >
    <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
      Interactive Component
    </p>
    <div class="flex items-center gap-8">
      <button
        @click="decrement"
        class="w-10 h-10 border border-border flex items-center justify-center hover:bg-accent hover:border-border-strong transition-colors text-xl font-bold rounded-lg text-foreground"
      >
        -
      </button>
      <div class="text-4xl font-mono font-medium min-w-[3ch] text-center">
        {{ count }}
      </div>
      <button
        @click="increment"
        class="w-10 h-10 border border-border flex items-center justify-center hover:bg-accent hover:border-border-strong transition-colors text-xl font-bold rounded-lg text-foreground"
      >
        +
      </button>
    </div>
    <p class="text-xs font-mono text-muted-foreground italic">Counter: {{ count }}</p>
  </div>
</template>
