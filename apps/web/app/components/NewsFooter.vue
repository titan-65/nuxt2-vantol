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
  <footer class="bg-[#0a0a0a] text-white border-t border-white/10">
    <div class="max-w-5xl mx-auto px-6 py-12 md:py-16">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
        <!-- Navigation -->
        <div class="space-y-4">
          <h3 class="text-[11px] font-bold uppercase tracking-widest text-zinc-500 pb-2">Navigation</h3>
          <ul class="space-y-2.5 text-sm text-zinc-400">
            <li><NuxtLink to="/" class="hover:text-white transition-colors">Home</NuxtLink></li>
            <li><NuxtLink to="/blog" class="hover:text-white transition-colors">Blog</NuxtLink></li>
            <li><NuxtLink to="/projects" class="hover:text-white transition-colors">Projects</NuxtLink></li>
            <li><NuxtLink to="/about" class="hover:text-white transition-colors">About</NuxtLink></li>
            <li><AdminLink /></li>
          </ul>
        </div>

        <!-- Socials -->
        <div class="space-y-4">
          <h3 class="text-[11px] font-bold uppercase tracking-widest text-zinc-500 pb-2">Socials</h3>
          <ul class="space-y-2.5 text-sm text-zinc-400">
            <li><a href="https://twitter.com/vantolbennett" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">Twitter</a></li>
            <li><a href="https://github.com/titan-65" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">Github</a></li>
            <li><a href="https://www.youtube.com/user/teckcare2011" target="_blank" rel="noopener noreferrer" class="hover:text-white transition-colors">Youtube</a></li>
          </ul>
        </div>

        <!-- Resources -->
        <div class="space-y-4">
          <h3 class="text-[11px] font-bold uppercase tracking-widest text-zinc-500 pb-2">Resources</h3>
          <ul class="space-y-2.5 text-sm text-zinc-400">
            <li><a href="/rss.xml" target="_blank" class="hover:text-white transition-colors">RSS Feed</a></li>
            <li><NuxtLink to="/guestbook" class="hover:text-white transition-colors">Guestbook</NuxtLink></li>
            <li><NuxtLink to="/uses" class="hover:text-white transition-colors">Uses</NuxtLink></li>
          </ul>
        </div>

        <!-- Subscribe -->
        <div class="space-y-4 col-span-2 md:col-span-1">
          <h3 class="text-[11px] font-bold uppercase tracking-widest text-zinc-500 pb-2">Stay Updated</h3>
          <p class="text-xs text-zinc-600">Subscribe for the latest updates.</p>
          <ClientOnly>
            <form @submit.prevent="handleFooterSubscribe" class="flex rounded-lg overflow-hidden border border-white/10 bg-[#111] focus-within:border-white/30 transition-colors">
              <input
                v-model="footerEmail"
                type="email"
                placeholder="Email"
                class="flex-1 px-3 py-2 text-xs bg-transparent focus:outline-none text-white placeholder:text-zinc-600"
                :disabled="footerStatus === 'loading' || footerStatus === 'success'"
              />
              <button
                type="submit"
                class="px-3 py-2 bg-[#f5c542] text-black text-xs font-bold hover:bg-[#e0b13a] transition-colors disabled:opacity-50"
                :disabled="footerStatus === 'loading' || footerStatus === 'success'"
              >
                <span v-if="footerStatus === 'loading'">...</span>
                <span v-else-if="footerStatus === 'success'">✓</span>
                <span v-else>→</span>
              </button>
            </form>
            <p v-if="footerMessage" class="text-[11px]" :class="footerStatus === 'error' ? 'text-red-400' : 'text-green-400'">
              {{ footerMessage }}
            </p>
            <template #fallback>
              <div class="flex rounded-lg overflow-hidden border border-white/10 bg-[#111]">
                <input type="email" placeholder="Email" class="flex-1 px-3 py-2 text-xs bg-transparent text-white placeholder:text-zinc-600" disabled />
                <button class="px-3 py-2 bg-[#f5c542] text-black text-xs font-bold">→</button>
              </div>
            </template>
          </ClientOnly>
        </div>
      </div>

      <div class="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
        <div class="flex items-center gap-2">
          <span class="font-bold text-sm tracking-tight">VantolBennett</span>
          <span class="text-xs text-zinc-600">© {{ new Date().getFullYear() }}</span>
        </div>

        <div class="flex items-center gap-2 text-xs text-zinc-600">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>Online</span>
        </div>
      </div>
    </div>
  </footer>
</template>
