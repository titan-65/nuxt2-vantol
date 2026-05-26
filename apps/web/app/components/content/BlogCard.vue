<template>
  <div class="my-8 border border-white/10 bg-[#111] rounded-xl p-6 md:p-8 relative overflow-hidden group hover:border-white/20 transition-colors">
    <div class="relative z-10">
      <div class="prose prose-invert max-w-none font-light">
        <slot />
      </div>
    </div>
    <!-- Decorative element -->
    <div class="absolute top-0 right-0 w-16 h-16 bg-[#0a0a0a] -mr-8 -mt-8 rotate-45 group-hover:bg-white/5 transition-colors"></div>
  </div>
</template>
