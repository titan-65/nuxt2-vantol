<script setup lang="ts">
import type { Props } from "./[stage].server";
import JumbleAdmin from "../../src/JumbleAdmin.vue";
import JumbleCheckout from "../../src/JumbleCheckout.vue";
import JumbleCookie from "../../src/JumbleCookie.vue";
import JumbleLanding from "../../src/JumbleLanding.vue";
import JumbleMenu from "../../src/JumbleMenu.vue";
import JumbleOrder from "../../src/JumbleOrder.vue";

defineProps<Props>();
</script>

<template>
  <JumbleLanding v-if="stage === 1" :stage="1" :embed="true" />
  <JumbleMenu v-else-if="stage === 2" :stage="stage" :embed="embed" :week="week" :flavors="flavors" />
  <JumbleCookie
    v-else-if="stage === 3 || stage === 4"
    :stage="stage"
    :embed="embed"
    :week="week"
    :flavor="flavor"
    :boxes="boxes"
    :back-href="backHref"
  />
  <JumbleCheckout
    v-else-if="stage === 5"
    :stage="stage"
    :embed="embed"
    :locations="locations"
    :cart-token="cartToken"
    :back-href="backHref"
  />
  <JumbleOrder
    v-else-if="stage === 6 && order"
    :stage="stage"
    :embed="embed"
    :order="order"
    :back-href="backHref"
  />
  <JumbleAdmin
    v-else-if="stage === 7"
    :stage="stage"
    :embed="embed"
    :authorized="false"
    :orders="[]"
    :flavors="[]"
    :week-label="null"
  />
  <JumbleMenu
    v-else-if="stage === 8"
    :stage="stage"
    :embed="embed"
    :week="week"
    :flavors="flavors"
  />
  <JumbleCookie
    v-else
    :stage="stage"
    :embed="embed"
    :week="week"
    :flavor="flavor"
    :boxes="boxes"
    :back-href="backHref"
  />
</template>
