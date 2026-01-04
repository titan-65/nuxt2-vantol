<template>
  <div class="my-8 border border-black/10 bg-white p-6 md:p-8 relative overflow-hidden group hover:border-black transition-colors">
    <div class="relative z-10">
      <div class="prose prose-neutral max-w-none font-light">
        <slot />
      </div>
    </div>
    <!-- Decorative element -->
    <div class="absolute top-0 right-0 w-16 h-16 bg-[#F3F3F3] -mr-8 -mt-8 rotate-45 group-hover:bg-black/5 transition-colors"></div>
  </div>
</template>
