<script setup lang="ts">
import type { Props } from "./index.server";
import JumbleMenu from "../src/JumbleMenu.vue";

defineProps<Props>();
</script>

<template>
  <JumbleMenu :stage="stage" :embed="embed" :week="week" :flavors="flavors" />
</template>
