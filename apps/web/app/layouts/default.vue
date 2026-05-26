<template>
  <main
    class="font-sans min-h-screen bg-[#f6f6f4] text-[#171717] selection:bg-[#f5c542] selection:text-black dark:bg-black dark:text-white"
  >
    <div
      class="min-h-screen max-w-5xl mx-auto bg-white border-x border-black/10 dark:bg-[#0a0a0a] dark:border-white/10"
    >
      <HeaderNav />
      <slot />
      <NewsFooter />
    </div>
    <BackToTop />
  </main>
</template>
