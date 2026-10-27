<script setup lang="ts">
// The journal shell is intentionally quiet: type, rules, and a single paper ground.
</script>

<template>
  <div class="min-h-screen bg-background text-foreground">
    <a href="#main-content" class="skip-link">Skip to content</a>
    <HeaderNav />
    <main id="main-content" class="min-h-[60vh]">
      <slot />
    </main>
    <NewsFooter />
    <BackToTop />
  </div>
</template>
