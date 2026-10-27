<script setup lang="ts">
withDefaults(
  defineProps<{
    color?: string;
    accent?: string;
    label?: string;
  }>(),
  {
    color: "#D9A45B",
    accent: "#5A3322",
    label: "Jumble cookie",
  },
);
</script>

<template>
  <svg
    viewBox="0 0 200 200"
    fill="none"
    role="img"
    :aria-label="label"
    class="h-full w-full"
  >
    <circle cx="100" cy="100" r="90" :fill="color" opacity="0.28" />
    <circle cx="100" cy="96" r="86" :fill="color" />
    <circle cx="71" cy="63" r="9" :fill="accent" />
    <circle cx="128" cy="54" r="6" :fill="accent" />
    <circle cx="143" cy="101" r="9" :fill="accent" />
    <circle cx="108" cy="113" r="6" :fill="accent" />
    <circle cx="68" cy="132" r="7" :fill="accent" />
    <circle cx="96" cy="153" r="9" :fill="accent" />
    <circle cx="138" cy="146" r="5" :fill="accent" />
    <circle cx="50" cy="97" r="5" :fill="accent" />
    <circle cx="116" cy="83" r="4" :fill="accent" />
    <path
      d="M75 121c8 9 21 13 33 10"
      :stroke="accent"
      stroke-opacity="0.35"
      stroke-width="4"
      stroke-linecap="round"
    />
  </svg>
</template>
