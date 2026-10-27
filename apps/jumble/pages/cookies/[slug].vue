<script setup lang="ts">
import type { Props } from "./[slug].server";
import JumbleCookie from "../../src/JumbleCookie.vue";

defineProps<Props>();
</script>

<template>
  <JumbleCookie
    :stage="stage"
    :embed="embed"
    :week="week"
    :flavor="flavor"
    :boxes="boxes"
    :back-href="backHref"
  />
</template>
