<script setup lang="ts">
import DotField from '~/components/backgrounds/DotField.vue'
import ColorBends from '~/components/backgrounds/ColorBends.vue'
</script>

<template>
  <div class="relative min-h-screen">
    <!-- Global animated backgrounds (fixed, behind everything) -->
    <div class="fixed inset-0 z-0 pointer-events-none">
      <ClientOnly>
        <ColorBends
          :colors="['#f5c542', '#8a5cff', '#00d4ff']"
          :rotation="90"
          :speed="0.2"
          :scale="1"
          :frequency="1"
          :warp-strength="1"
          :mouse-influence="0.6"
          :noise="0.1"
          :parallax="0.5"
          :iterations="1"
          :intensity="1.1"
          :band-width="6"
          transparent
        />
      </ClientOnly>
    </div>
    <div class="fixed inset-0 z-0 pointer-events-none">
      <ClientOnly>
        <DotField
          :dot-radius="1.5"
          :dot-spacing="14"
          :bulge-strength="50"
          :glow-radius="140"
          :sparkle="false"
          :wave-amplitude="0"
          :cursor-radius="450"
          :cursor-force="0.1"
          bulge-only
          gradient-from="rgba(245, 197, 66, 0.35)"
          gradient-to="rgba(245, 197, 66, 0.1)"
          glow-color="#1a1a1a"
        />
      </ClientOnly>
    </div>

    <!-- Content -->
    <main
      class="relative z-10 font-sans min-h-screen text-[#171717] selection:bg-[#f5c542] selection:text-black dark:text-white"
    >
      <div
        class="min-h-screen max-w-[1088px] mx-auto bg-white border-x border-black/10 dark:bg-[#0a0a0a] dark:border-white/10"
      >
        <HeaderNav />
        <slot />
        <NewsFooter />
      </div>
      <BackToTop />
    </main>
  </div>
</template>
