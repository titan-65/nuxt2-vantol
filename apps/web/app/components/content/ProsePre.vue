<script setup lang="ts">
const props = defineProps({
  code: {
    type: String,
    default: "",
  },
  language: {
    type: String,
    default: null,
  },
  filename: {
    type: String,
    default: null,
  },
  highlights: {
    type: Array as () => number[],
    default: () => [],
  },
  meta: {
    type: String,
    default: null,
  },
  class: {
    type: String,
    default: null,
  },
});

const copied = ref(false);

const copy = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
};
</script>

<template>
  <div class="relative group my-6 overflow-hidden border border-white/10 rounded-xl">
    <!-- Header/Filename -->
    <div
      v-if="filename || language"
      class="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-zinc-900"
    >
      <span class="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
        {{ filename || language }}
      </span>
      <button
        @click="copy"
        class="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-500 hover:text-white transition-colors"
      >
        <span v-if="copied" class="text-green-400">Copied!</span>
        <template v-else>
          Copy
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
            />
          </svg>
        </template>
      </button>
    </div>

    <!-- Copy button for blocks without filename -->
    <button
      v-else
      @click="copy"
      class="absolute top-3 right-3 z-10 p-2 rounded bg-white/5 hover:bg-white/10 text-zinc-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all duration-200"
      title="Copy code"
    >
      <svg v-if="!copied" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
        />
      </svg>
      <svg
        v-else
        class="w-4 h-4 text-green-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
      </svg>
    </button>

    <pre
      :class="props.class"
      class="p-4 overflow-x-auto font-mono text-sm leading-relaxed bg-zinc-900"
    ><slot /></pre>
  </div>
</template>

<style scoped>
/* Shiki highlighting adjustments */
pre code {
  background-color: transparent !important;
  padding: 0 !important;
}
</style>
