<script setup lang="ts">
import { computed } from "vue";
import { usePresenceWall } from "../composables/usePresenceWall";

const props = defineProps<{ open: boolean }>();
const emit = defineEmits<{ (e: "update:open", value: boolean): void }>();

const wall = usePresenceWall();
wall.isOpen.value = props.open;

const isVisible = computed(() => props.open);

function close() {
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
    <div class="presence-wall__canvas">
      <div
        v-for="sig in wall.signatures.value"
        :key="sig.id"
        class="presence-wall__signature"
        :style="{
          left: sig.x + '%',
          top: sig.y + '%',
          color: sig.color,
          transform: `rotate(${sig.rotation}deg)`,
        }"
      >
        {{ sig.text }}
      </div>
    </div>
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
}
.presence-wall__signature {
  position: absolute;
  font-size: 1.5rem;
  font-family: "Caveat", cursive;
  pointer-events: none;
}
</style>
