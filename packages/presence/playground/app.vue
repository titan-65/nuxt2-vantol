<script setup lang="ts">
const open = ref(false);
</script>

<template>
  <div>
    <h1>presence playground</h1>
    <button type="button" @click="open = true">Open wall</button>
    <PresenceWall v-model:open="open" />
    <p>Press the combo (&uarr;&uarr;&darr;&darr;) or use the button.</p>
  </div>
</template>
