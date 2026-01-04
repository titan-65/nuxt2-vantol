<script setup lang="ts">
useHead({
  title: 'Admin - VantolBennett'
})
</script>

<template>
  <div class="min-h-screen bg-[#F3F3F3] font-sans">
    <div class="container mx-auto px-6 py-20">
      <div class="max-w-3xl mx-auto text-center mb-16">
        <div class="flex items-center justify-center gap-2 mb-4">
          <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
          <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">ADMINISTRATION</span>
        </div>
        <h1 class="text-4xl md:text-5xl font-medium tracking-tight mb-6">Content Management</h1>
        <p class="text-xl text-gray-600 font-light leading-relaxed">
           Manage your blog posts and site content using Nuxt Studio.
        </p>
      </div>

      <div class="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
        <!-- Nuxt Studio Card -->
        <div class="bg-white border border-black/20 p-8 hover:border-black transition-colors flex flex-col">
          <h2 class="text-xl font-bold mb-3 uppercase tracking-wide">Nuxt Studio</h2>
          <p class="text-sm font-mono text-gray-500 mb-6 grow">
            The official visual editor for Nuxt Content. Edit your site in real-time with live preview.
          </p>
          <div class="mt-auto">
             <a 
                href="/_studio" 
                class="block w-full py-3 bg-black text-white text-center text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
              >
                Open Studio
              </a>
          </div>
        </div>

        <!-- Local Content Card -->
        <div class="bg-white border border-black/20 p-8 hover:border-black transition-colors flex flex-col">
          <h2 class="text-xl font-bold mb-3 uppercase tracking-wide">Local Content</h2>
          <p class="text-sm font-mono text-gray-500 mb-6 flex-grow">
             Edit markdown files directly in your local environment. Changes in <code>content/</code> are reflected immediately.
          </p>
          <div class="mt-auto">
            <a 
              href="https://github.com/titan-65/nuxt2-vantol" 
              target="_blank"
              class="block w-full py-3 border border-black/20 text-center text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
            >
              View Repository
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
