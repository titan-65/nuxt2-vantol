<script setup lang="ts">
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Github, Twitter, Command, Search } from "lucide-vue-next";

const route = useRoute();

const primaryLinks = [
  { name: "HOME", to: "/" },
  { name: "BLOG", to: "/blog" },
  { name: "PROJECTS", to: "/projects" },
  { name: "ABOUT", to: "/about" },
];

const secondaryLinks = [
  { name: "PUBLICATIONS", to: "/publications" },
  { name: "GALLERY", to: "/gallery" },
  { name: "EXPLORE", to: "/explore" },
  { name: "STATS", to: "/stats" },
  { name: "GUESTBOOK", to: "/guestbook" },
  { name: "USES", to: "/uses" },
  { name: "CONTACT", to: "/contact" },
];

const allLinks = [...primaryLinks, ...secondaryLinks];

const isOpen = ref(false);

const isActive = (to: string) => {
  if (to === "/") return route.path === "/";
  return route.path.startsWith(to);
};

const openCommandPalette = () => {
  const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
  document.dispatchEvent(event);
};

const handleLinkClick = () => {
  isOpen.value = false;
};

// Close sheet on route change (handles browser back/forward)
watch(
  () => route.path,
  () => {
    isOpen.value = false;
  },
);
</script>

<template>
  <header
    class="sticky top-0 z-50 w-full bg-white/85 text-[#171717] backdrop-blur-md border-b border-black/10 dark:bg-[#0a0a0a]/80 dark:text-white dark:border-white/10"
  >
    <div class="max-w-[1088px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <!-- Logo -->
      <NuxtLink
        to="/"
        class="flex items-center gap-2 shrink-0 text-[#171717] hover:opacity-80 transition-opacity dark:text-white"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="text-[#f5c542]"
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="font-bold text-lg tracking-tight">Vantol</span>
      </NuxtLink>

      <!-- Desktop Nav -->
      <nav class="hidden lg:flex items-center gap-1">
        <NuxtLink
          v-for="link in primaryLinks"
          :key="link.to"
          :to="link.to"
          class="px-3 py-1.5 text-sm font-medium transition-colors rounded-lg"
          :class="
            isActive(link.to)
              ? 'text-[#171717] bg-black/5 dark:text-white dark:bg-white/10'
              : 'text-zinc-500 hover:text-[#171717] hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'
          "
        >
          {{ link.name }}
        </NuxtLink>
        <div class="relative group">
          <button
            class="px-3 py-1.5 text-sm font-medium text-zinc-500 hover:text-[#171717] hover:bg-black/5 rounded-lg transition-colors flex items-center gap-1 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5"
          >
            More
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>
          <div
            class="absolute top-full right-0 mt-2 w-48 bg-white border border-black/10 rounded-xl overflow-hidden shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 dark:bg-[#111] dark:border-white/10"
          >
            <NuxtLink
              v-for="link in secondaryLinks"
              :key="link.to"
              :to="link.to"
              class="block px-4 py-2.5 text-sm text-zinc-500 hover:text-[#171717] hover:bg-black/5 transition-colors dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5"
              :class="
                isActive(link.to) ? 'text-[#171717] bg-black/5 dark:text-white dark:bg-white/5' : ''
              "
            >
              {{ link.name }}
            </NuxtLink>
          </div>
        </div>
      </nav>

      <!-- Desktop Right Actions -->
      <div class="hidden lg:flex items-center gap-3 shrink-0">
        <NuxtLink
          to="/contact"
          class="text-sm font-medium text-zinc-500 hover:text-[#171717] transition-colors dark:text-zinc-400 dark:hover:text-white"
        >
          Contact
        </NuxtLink>
        <button
          @click="openCommandPalette"
          class="flex items-center gap-1.5 border border-black/10 px-2.5 py-1.5 text-xs font-mono text-zinc-500 hover:border-black/30 hover:text-[#171717] transition-colors rounded-lg dark:border-white/10 dark:hover:border-white/30 dark:hover:text-white"
          title="Search (⌘K)"
          aria-label="Open command palette"
        >
          <Search class="w-3.5 h-3.5" />
          <span class="hidden xl:inline">⌘K</span>
        </button>
        <a
          href="https://github.com/titan-65"
          target="_blank"
          rel="noopener noreferrer"
          class="text-zinc-500 hover:text-[#171717] transition-colors p-1.5 hover:bg-black/5 rounded-lg dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5"
          aria-label="GitHub"
        >
          <Github class="w-4 h-4" />
        </a>
        <a
          href="https://twitter.com/vantolbennett"
          target="_blank"
          rel="noopener noreferrer"
          class="text-zinc-500 hover:text-[#171717] transition-colors p-1.5 hover:bg-black/5 rounded-lg dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5"
          aria-label="Twitter"
        >
          <Twitter class="w-4 h-4" />
        </a>
        <DarkModeToggle />
      </div>

      <!-- Mobile -->
      <div class="flex lg:hidden items-center gap-2">
        <button
          @click="openCommandPalette"
          class="p-2 text-zinc-500 hover:text-[#171717] transition-colors dark:text-zinc-400 dark:hover:text-white"
          aria-label="Search"
        >
          <Search class="w-5 h-5" />
        </button>

        <Sheet v-model:open="isOpen">
          <SheetTrigger as-child>
            <button
              class="p-2 text-zinc-500 hover:text-[#171717] transition-colors dark:text-zinc-400 dark:hover:text-white"
              aria-label="Open navigation menu"
              :aria-expanded="isOpen"
            >
              <Menu class="h-5 w-5" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            class="w-[300px] bg-white text-[#171717] border-l border-black/10 flex flex-col p-0 dark:bg-[#0a0a0a] dark:text-white dark:border-white/10"
          >
            <!-- Sheet Header -->
            <div
              class="flex items-center justify-between px-6 h-16 border-b border-black/10 shrink-0 dark:border-white/10"
            >
              <NuxtLink
                to="/"
                class="flex items-center gap-2 text-[#171717] dark:text-white"
                @click="handleLinkClick"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  class="text-[#f5c542]"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
                <span class="font-bold tracking-tight">Vantol</span>
              </NuxtLink>
            </div>

            <!-- Nav Links -->
            <nav class="flex-1 overflow-y-auto px-6 py-6">
              <div class="flex flex-col gap-1">
                <NuxtLink
                  v-for="link in allLinks"
                  :key="link.to"
                  :to="link.to"
                  class="flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  :class="
                    isActive(link.to)
                      ? 'text-[#171717] bg-black/5 dark:text-white dark:bg-white/10'
                      : 'text-zinc-500 hover:text-[#171717] hover:bg-black/5 dark:text-zinc-400 dark:hover:text-white dark:hover:bg-white/5'
                  "
                  @click="handleLinkClick"
                >
                  <span>{{ link.name }}</span>
                  <svg
                    v-if="isActive(link.to)"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </NuxtLink>
              </div>
            </nav>

            <!-- Sheet Footer -->
            <div class="px-6 py-5 border-t border-black/10 shrink-0 dark:border-white/10">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-4">
                  <a
                    href="https://github.com/titan-65"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-zinc-500 hover:text-[#171717] transition-colors dark:text-zinc-400 dark:hover:text-white"
                    aria-label="GitHub"
                  >
                    <Github class="w-5 h-5" />
                  </a>
                  <a
                    href="https://twitter.com/vantolbennett"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="text-zinc-500 hover:text-[#171717] transition-colors dark:text-zinc-400 dark:hover:text-white"
                    aria-label="Twitter"
                  >
                    <Twitter class="w-5 h-5" />
                  </a>
                </div>
                <button
                  @click="
                    openCommandPalette();
                    isOpen = false;
                  "
                  class="flex items-center gap-1.5 border border-black/10 px-3 py-1.5 text-xs font-mono text-zinc-500 hover:border-black/30 hover:text-[#171717] transition-colors rounded-lg dark:border-white/10 dark:hover:border-white/30 dark:hover:text-white"
                  aria-label="Open search"
                >
                  <Command class="w-3 h-3" />
                  <span>Search</span>
                </button>
              </div>
              <div class="mt-5">
                <DarkModeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  </header>
</template>
