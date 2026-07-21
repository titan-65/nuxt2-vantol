<script setup lang="ts">
import { computed, nextTick, ref, useTemplateRef, watch } from "vue";
import { usePresenceWall } from "../composables/usePresenceWall";
import { signatureStyle } from "../utils/renderStyle";
import type { RenderStyle } from "../../options";

// Both props are optional. When the module mounts this itself there is no
// parent to pass them, and visibility comes from the shared wall instead.
const props = defineProps<{ open?: boolean; renderStyle?: RenderStyle }>();
const emit = defineEmits<{ (e: "update:open", value: boolean): void }>();

const wall = usePresenceWall();

// v-model:open drives the shared wall, and the shared wall drives visibility —
// so the plugin's key combo and $presence.open() reach this component too.
watch(
  () => props.open,
  (open) => {
    // Ignore the absent prop, or a self-mounted wall would clobber the shared state.
    if (typeof open === "boolean") wall.isOpen.value = open;
  },
  { immediate: true },
);

const isVisible = computed(() => props.open || wall.isOpen.value);

const styled = computed(() =>
  wall.signatures.value.map((sig) => ({ sig, style: signatureStyle(sig, props.renderStyle) })),
);

/** Where the caret sits, in percent, or null when nobody is typing. */
const caret = ref<{ x: number; y: number } | null>(null);
const draft = ref("");
const input = useTemplateRef<HTMLInputElement>("input");

const MAX_TEXT_LENGTH = 200;

async function placeCaret(event: MouseEvent) {
  const box = (event.currentTarget as HTMLElement).getBoundingClientRect();

  caret.value = {
    x: ((event.clientX - box.left) / box.width) * 100,
    y: ((event.clientY - box.top) / box.height) * 100,
  };
  draft.value = "";

  // The input only exists once the caret does, so focus after it renders.
  await nextTick();
  input.value?.focus();
}

function commit() {
  const text = draft.value.trim();
  if (text && caret.value) wall.add({ text, x: caret.value.x, y: caret.value.y });

  cancel();
}

function cancel() {
  caret.value = null;
  draft.value = "";
}

function close() {
  cancel();
  wall.close();
  emit("update:open", false);
}

defineExpose(wall);
</script>

<template>
  <div
    v-if="isVisible"
    data-presence-wall
    class="presence-wall"
    role="dialog"
    aria-label="Presence wall"
  >
    <button
      type="button"
      data-presence-close
      class="presence-wall__close"
      aria-label="Close wall"
      @click="close"
    >
      ×
    </button>
    <div class="presence-wall__canvas" data-presence-canvas @click="placeCaret">
      <div
        v-for="{ sig, style } in styled"
        :key="sig.id"
        class="presence-wall__signature"
        :style="{
          left: sig.x + '%',
          top: sig.y + '%',
          color: sig.color,
          transform: `rotate(${sig.rotation}deg)`,
          fontFamily: style.fontFamily,
        }"
      >
        {{ style.text }}
      </div>

      <input
        v-if="caret"
        ref="input"
        v-model="draft"
        data-presence-input
        class="presence-wall__input"
        :maxlength="MAX_TEXT_LENGTH"
        :style="{ left: caret.x + '%', top: caret.y + '%' }"
        placeholder="type…"
        aria-label="Your signature"
        @keydown.enter.prevent="commit"
        @keydown.esc.prevent="cancel"
        @blur="commit"
        @click.stop
      />
    </div>

    <p class="presence-wall__hint">
      {{ caret ? "enter to sign · esc to cancel" : "click anywhere to leave your mark" }}
    </p>
  </div>
</template>

<style scoped>
.presence-wall {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.92);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: inherit;
}
.presence-wall__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  cursor: pointer;
}
.presence-wall__canvas {
  position: relative;
  width: 100%;
  height: 100%;
  cursor: text;
}
.presence-wall__input {
  position: absolute;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.5);
  color: white;
  font-family: "Caveat", cursive;
  font-size: 1.5rem;
  padding: 0 0 0.15rem;
  min-width: 8rem;
  outline: none;
}
.presence-wall__input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}
.presence-wall__hint {
  position: absolute;
  bottom: 1.25rem;
  left: 0;
  right: 0;
  margin: 0;
  text-align: center;
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.4);
  pointer-events: none;
}
.presence-wall__signature {
  position: absolute;
  font-size: 1.5rem;
  pointer-events: none;
}
</style>
