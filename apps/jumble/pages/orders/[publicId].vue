<script setup lang="ts">
import type { Props } from "./[publicId].server";
import JumbleOrder from "../../src/JumbleOrder.vue";

defineProps<Props>();
</script>

<template>
  <JumbleOrder
    v-if="order"
    :stage="stage"
    :embed="embed"
    :order="order"
    :back-href="backHref"
  />
  <div v-else class="jumble">
    <div class="shell">
      <main class="menu-empty" style="padding: 100px 0">
        <p>That order code does not exist.</p>
        <a class="menu-footnote-link" href="/menu">Back to the menu →</a>
      </main>
    </div>
  </div>
</template>
