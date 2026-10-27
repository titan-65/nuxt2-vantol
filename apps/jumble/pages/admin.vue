<script setup lang="ts">
import type { Props } from "./admin.server";
import JumbleAdmin from "../src/JumbleAdmin.vue";

defineProps<Props>();
</script>

<template>
  <JumbleAdmin
    :stage="stage"
    :embed="embed"
    :authorized="authorized"
    :orders="orders"
    :flavors="flavors"
    :week-label="weekLabel"
  />
</template>
