<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Menu, Github, Twitter } from 'lucide-vue-next'

const links = [
  { name: 'HOME', to: '/' },
  { name: 'BLOG', to: '/blog' },
  { name: 'PROJECTS', to: '/projects' },
  { name: 'GALLERY', to: '/gallery' },
  { name: 'EXPLORE', to: '/explore' },
  { name: 'ABOUT', to: '/about' },
  { name: 'USES', to: '/uses' },
  { name: 'CONTACT', to: '/contact' },
]

const isOpen = ref(false)
</script>

<template>
  <header class="sticky top-0 z-50 w-full bg-[#F3F3F3] border-b border-black/10">
    <div class="container mx-auto px-6 h-16 flex items-center justify-between">
      <!-- Logo Area -->
      <NuxtLink to="/" class="flex items-center gap-2">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-black">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="font-bold text-lg tracking-wider uppercase">VANTOL</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="hidden md:flex items-center gap-8">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-xs font-medium text-gray-600 hover:text-black transition-colors uppercase tracking-wide"
        >
          {{ link.name }} >
        </NuxtLink>
      </nav>

      <!-- Right Actions -->
      <div class="hidden md:flex items-center gap-4">
        <a href="https://github.com/titan-65" target="_blank" rel="noopener noreferrer" class="text-black hover:text-gray-600 transition-colors">
          <Github class="w-5 h-5" />
        </a>
        <a href="https://twitter.com/vantolbennett" target="_blank" rel="noopener noreferrer" class="text-black hover:text-gray-600 transition-colors">
          <Twitter class="w-5 h-5" />
        </a>
      </div>

      <!-- Mobile Menu Trigger -->
      <Sheet v-model:open="isOpen">
        <SheetTrigger as-child>
          <button class="md:hidden p-2">
            <Menu class="h-6 w-6" />
          </button>
        </SheetTrigger>
        <SheetContent side="right" class="w-[300px] sm:w-[400px] bg-[#F3F3F3]">
          <nav class="flex flex-col gap-4 mt-8">
            <NuxtLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="text-lg font-medium uppercase"
              @click="isOpen = false"
            >
              {{ link.name }}
            </NuxtLink>
            <div class="h-px bg-black/10 my-4"></div>
            <div class="flex gap-4">
              <a href="https://github.com/titan-65" target="_blank" rel="noopener noreferrer" class="text-black hover:text-gray-600 transition-colors">
                <Github class="w-6 h-6" />
              </a>
              <a href="https://twitter.com/vantolbennett" target="_blank" rel="noopener noreferrer" class="text-black hover:text-gray-600 transition-colors">
                <Twitter class="w-6 h-6" />
              </a>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  </header>
</template>
