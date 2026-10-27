<script setup lang="ts">
import type { Props } from "./checkout.server";
import JumbleCheckout from "../src/JumbleCheckout.vue";

defineProps<Props>();
</script>

<template>
  <JumbleCheckout
    :stage="stage"
    :embed="embed"
    :locations="locations"
    :cart-token="cartToken"
    :back-href="backHref"
  />
</template>
