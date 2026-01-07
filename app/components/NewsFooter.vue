<script setup lang="ts">
import AdminLink from '@/components/AdminLink.vue'

const footerEmail = ref('')
const footerStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const footerMessage = ref('')

const { subscribe } = useNewsletter()

const handleFooterSubscribe = async () => {
  if (!footerEmail.value || !footerEmail.value.includes('@')) {
    footerStatus.value = 'error'
    footerMessage.value = 'Invalid email'
    return
  }
  
  footerStatus.value = 'loading'
  
  const result = await subscribe(footerEmail.value, 'footer')
  
  if (result.success) {
    footerStatus.value = 'success'
    footerMessage.value = result.message
    footerEmail.value = ''
  } else {
    footerStatus.value = 'error'
    footerMessage.value = result.message
  }
  
  setTimeout(() => {
    footerStatus.value = 'idle'
    footerMessage.value = ''
  }, 3000)
}
</script>

<template>
  <footer class="bg-[#F3F3F3] text-black border-t border-black/10 font-sans">
    <div class="container mx-auto px-6 py-12 md:py-16">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <!-- Chill Spot -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-widest border-b border-black/10 pb-2">Navigation</h3>
          <ul class="space-y-2 text-sm font-mono text-gray-600">
            <li>
              <NuxtLink to="/" class="hover:text-black hover:underline transition-colors uppercase">Home</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/blog" class="hover:text-black hover:underline transition-colors uppercase">Blog</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/projects" class="hover:text-black hover:underline transition-colors uppercase">Projects</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/gallery" class="hover:text-black hover:underline transition-colors uppercase">Gallery</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/explore" class="hover:text-black hover:underline transition-colors uppercase">Explore</NuxtLink>
            </li>
            <AdminLink />
          </ul>
        </div>

        <!-- Socials -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-widest border-b border-black/10 pb-2">Socials</h3>
          <ul class="space-y-2 text-sm font-mono text-gray-600">
            <li>
              <a href="https://twitter.com/vantolbennett" target="_blank" rel="noopener noreferrer" class="hover:text-black hover:underline transition-colors uppercase">Twitter</a>
            </li>
            <li>
              <a href="https://github.com/titan-65" target="_blank" rel="noopener noreferrer" class="hover:text-black hover:underline transition-colors uppercase">Github</a>
            </li>
            <li>
              <a href="https://www.youtube.com/user/teckcare2011" target="_blank" rel="noopener noreferrer" class="hover:text-black hover:underline transition-colors uppercase">Youtube</a>
            </li>
          </ul>
        </div>

        <!-- Resources -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-widest border-b border-black/10 pb-2">Resources</h3>
          <ul class="space-y-2 text-sm font-mono text-gray-600">
            <li>
              <a href="/rss.xml" target="_blank" class="hover:text-black hover:underline transition-colors uppercase">RSS Feed</a>
            </li>
          </ul>
        </div>

        <!-- Subscribe -->
        <div class="space-y-4">
          <h3 class="text-xs font-bold uppercase tracking-widest border-b border-black/10 pb-2">Stay Updated</h3>
          <p class="text-xs font-mono text-gray-500">Subscribe for the latest updates.</p>
          <ClientOnly>
            <form @submit.prevent="handleFooterSubscribe" class="flex border border-black/20 bg-white">
              <input 
                v-model="footerEmail" 
                type="email" 
                placeholder="EMAIL" 
                class="flex-1 px-3 py-2 text-xs font-mono focus:outline-none"
                :disabled="footerStatus === 'loading' || footerStatus === 'success'"
              />
              <button 
                type="submit" 
                class="px-3 py-2 bg-black text-white text-xs font-bold uppercase hover:bg-gray-800 transition-colors disabled:opacity-50"
                :disabled="footerStatus === 'loading' || footerStatus === 'success'"
              >
                <span v-if="footerStatus === 'loading'">...</span>
                <span v-else-if="footerStatus === 'success'">✓</span>
                <span v-else>-></span>
              </button>
            </form>
            <p v-if="footerMessage" class="text-[10px] font-mono" :class="footerStatus === 'error' ? 'text-red-500' : 'text-green-600'">
              {{ footerMessage }}
            </p>
            <template #fallback>
              <div class="flex border border-black/20 bg-white">
                <input type="email" placeholder="EMAIL" class="flex-1 px-3 py-2 text-xs font-mono focus:outline-none" disabled />
                <button class="px-3 py-2 bg-black text-white text-xs font-bold uppercase">-></button>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <div class="pt-8 border-t border-black/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm tracking-tight">VantolBennett</span>
          <span class="text-xs text-gray-500">© {{ new Date().getFullYear() }}</span>
        </div>
        
        <div class="flex items-center gap-2 text-xs font-mono text-gray-500">
           <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>ONLINE / WORKING</span>
        </div>
      </div>
    </div>
  </footer>
</template>
