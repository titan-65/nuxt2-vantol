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
  <div class="group relative my-8 max-w-full overflow-hidden rounded-lg border border-border bg-code">
    <div
      v-if="filename || language"
      class="flex items-center justify-between border-b border-border px-4 py-2"
    >
      <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
        {{ filename || language }}
      </span>
      <button
        type="button"
        class="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground transition-colors hover:text-foreground"
        @click="copy"
      >
        <span v-if="copied" class="text-success">Copied</span>
        <template v-else>
          Copy
          <svg
            class="h-3 w-3"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <rect x="9" y="9" width="11" height="11" />
            <path d="M5 15V5h10" />
          </svg>
        </template>
      </button>
    </div>

    <button
      v-else
      type="button"
      class="absolute right-3 top-3 z-10 border border-border bg-code px-2 py-1.5 font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground opacity-0 transition-all duration-200 hover:text-foreground group-hover:opacity-100 focus:opacity-100"
      title="Copy code"
      @click="copy"
    >
      <span v-if="copied" class="text-success">Copied</span>
      <span v-else>Copy</span>
    </button>

    <pre
      :class="props.class"
      class="overflow-x-auto bg-code p-4 font-mono text-[0.84em] leading-[1.7] text-code-foreground"
    ><slot /></pre>
  </div>
</template>

<style scoped>
pre code {
  background-color: transparent !important;
  padding: 0 !important;
  border: 0 !important;
}
</style>
