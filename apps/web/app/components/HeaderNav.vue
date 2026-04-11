<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Github, Twitter, Command, Search } from 'lucide-vue-next'

const route = useRoute()

const primaryLinks = [
  { name: 'HOME', to: '/' },
  { name: 'BLOG', to: '/blog' },
  { name: 'PROJECTS', to: '/projects' },
  { name: 'ABOUT', to: '/about' },
]

const secondaryLinks = [
  { name: 'PUBLICATIONS', to: '/publications' },
  { name: 'GALLERY', to: '/gallery' },
  { name: 'EXPLORE', to: '/explore' },
  { name: 'STATS', to: '/stats' },
  { name: 'GUESTBOOK', to: '/guestbook' },
  { name: 'USES', to: '/uses' },
  { name: 'CONTACT', to: '/contact' },
]

const allLinks = [...primaryLinks, ...secondaryLinks]

const isOpen = ref(false)

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path.startsWith(to)
}

const openCommandPalette = () => {
  const event = new KeyboardEvent('keydown', { key: 'k', metaKey: true })
  document.dispatchEvent(event)
}

const handleLinkClick = () => {
  isOpen.value = false
}

// Close sheet on route change (handles browser back/forward)
watch(() => route.path, () => {
  isOpen.value = false
})
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-[#F3F3F3] border-b border-black/10">
    <div class="container mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

      <!-- Logo -->
      <NuxtLink to="/" class="flex items-center gap-2 shrink-0">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-black">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="font-bold text-lg tracking-wider uppercase">VANTOL</span>
      </NuxtLink>

      <!-- Desktop Nav — hidden below lg to avoid overflow with 11 links -->
      <nav class="hidden lg:flex items-center gap-6 overflow-hidden">
        <NuxtLink
          v-for="link in allLinks"
          :key="link.to"
          :to="link.to"
          class="text-xs font-medium transition-colors uppercase tracking-wide whitespace-nowrap"
          :class="isActive(link.to)
            ? 'text-black border-b border-black pb-0.5'
            : 'text-gray-500 hover:text-black'"
        >
          {{ link.name }} >
        </NuxtLink>
      </nav>

      <!-- Desktop Right Actions -->
      <div class="hidden lg:flex items-center gap-4 shrink-0">
        <button
          @click="openCommandPalette"
          class="flex items-center gap-1.5 border border-black/10 px-2.5 py-1 text-[10px] font-mono text-gray-500 hover:border-black hover:text-black transition-colors"
          title="Search (⌘K)"
          aria-label="Open command palette"
        >
          <Command class="w-3 h-3" />K
        </button>
        <a href="https://github.com/titan-65" target="_blank" rel="noopener noreferrer" class="text-black hover:text-gray-600 transition-colors" aria-label="GitHub">
          <Github class="w-5 h-5" />
        </a>
        <a href="https://twitter.com/vantolbennett" target="_blank" rel="noopener noreferrer" class="text-black hover:text-gray-600 transition-colors" aria-label="Twitter">
          <Twitter class="w-5 h-5" />
        </a>
      </div>

      <!-- Mobile: search + menu trigger (visible below lg) -->
      <div class="flex lg:hidden items-center gap-2">
        <button
          @click="openCommandPalette"
          class="p-2 text-gray-600 hover:text-black transition-colors"
          aria-label="Search"
        >
          <Search class="w-5 h-5" />
        </button>

        <Sheet v-model:open="isOpen">
          <SheetTrigger as-child>
            <button
              class="p-2 text-gray-600 hover:text-black transition-colors"
              aria-label="Open navigation menu"
              :aria-expanded="isOpen"
            >
              <Menu class="h-6 w-6" />
            </button>
          </SheetTrigger>

          <SheetContent side="right" class="w-[280px] xs:w-[320px] sm:w-[360px] bg-[#F3F3F3] flex flex-col p-0">

            <!-- Sheet Header -->
            <div class="flex items-center justify-between px-6 h-16 border-b border-black/10 shrink-0">
              <NuxtLink to="/" class="flex items-center gap-2" @click="handleLinkClick">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="font-bold tracking-wider uppercase">VANTOL</span>
              </NuxtLink>
            </div>

            <!-- Nav Links -->
            <nav class="flex-1 overflow-y-auto px-6 py-6">

              <!-- Primary links -->
              <div class="flex flex-col">
                <NuxtLink
                  v-for="link in primaryLinks"
                  :key="link.to"
                  :to="link.to"
                  class="flex items-center justify-between py-3 text-base font-semibold uppercase tracking-wide transition-colors border-b border-black/5"
                  :class="isActive(link.to) ? 'text-black' : 'text-gray-500 hover:text-black'"
                  @click="handleLinkClick"
                >
                  <span>{{ link.name }}</span>
                  <span
                    class="text-xs transition-all"
                    :class="isActive(link.to) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'"
                  >›</span>
                </NuxtLink>
              </div>

              <!-- Secondary links -->
              <div class="flex flex-col mt-4">
                <p class="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-3">More</p>
                <NuxtLink
                  v-for="link in secondaryLinks"
                  :key="link.to"
                  :to="link.to"
                  class="flex items-center justify-between py-2.5 text-sm font-medium uppercase tracking-wide transition-colors border-b border-black/5 last:border-0"
                  :class="isActive(link.to) ? 'text-black' : 'text-gray-500 hover:text-black'"
                  @click="handleLinkClick"
                >
                  <span>{{ link.name }}</span>
                  <span v-if="isActive(link.to)" class="text-xs">›</span>
                </NuxtLink>
              </div>

            </nav>

            <!-- Sheet Footer -->
            <div class="px-6 py-5 border-t border-black/10 shrink-0">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <a
                    href="https://github.com/titan-65"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-gray-600 hover:text-black transition-colors"
                    aria-label="GitHub"
                  >
                    <Github class="w-5 h-5" />
                  </a>
                  <a
                    href="https://twitter.com/vantolbennett"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-gray-600 hover:text-black transition-colors"
                    aria-label="Twitter"
                  >
                    <Twitter class="w-5 h-5" />
                  </a>
                </div>

                <button
                  @click="openCommandPalette(); isOpen = false"
                  class="flex items-center gap-1.5 border border-black/20 px-3 py-1.5 text-[11px] font-mono text-gray-500 hover:border-black hover:text-black transition-colors"
                  aria-label="Open search"
                >
                  <Command class="w-3 h-3" />
                  <span>Search</span>
                </button>
              </div>
            </div>

          </SheetContent>
        </Sheet>
      </div>

    </div>
  </header>
</template>
