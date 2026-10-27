<script setup lang="ts">
import { Menu, Search, X } from "lucide-vue-next";
import { authClient } from "../../utils/auth-client";

const route = useRoute();

const primaryLinks = [
  { name: "Writing", to: "/blog" },
  { name: "Learn", to: "/learn" },
  { name: "Projects", to: "/projects" },
  { name: "About", to: "/about" },
];

const secondaryLinks = [
  { name: "Publications", to: "/publications" },
  { name: "Gallery", to: "/gallery" },
  { name: "Explore", to: "/explore" },
  { name: "Stats", to: "/stats" },
  { name: "Guestbook", to: "/guestbook" },
  { name: "Uses", to: "/uses" },
  { name: "Contact", to: "/contact" },
  { name: "Sign in", to: "/login" },
];

const allLinks = [...primaryLinks, ...secondaryLinks];

const isOpen = ref(false);
const menuButton = ref<HTMLButtonElement | null>(null);
const closeButton = ref<HTMLButtonElement | null>(null);
const menuPanel = ref<HTMLElement | null>(null);
const { data: session } = await authClient.useSession(useFetch);
const authUser = computed(() => session.value?.user ?? null);

async function handleSignOut() {
  await authClient.signOut();
  isOpen.value = false;
}

const isActive = (to: string) => {
  if (to === "/") return route.path === "/";
  return route.path.startsWith(to);
};

const openCommandPalette = () => {
  const event = new KeyboardEvent("keydown", { key: "k", metaKey: true });
  document.dispatchEvent(event);
};

const closeMenus = () => {
  isOpen.value = false;
};

const closeDetails = (event: MouseEvent) => {
  const details = (event.currentTarget as HTMLElement)?.closest("details");
  details?.removeAttribute("open");
};

watch(
  () => route.path,
  () => {
    isOpen.value = false;
  },
);

watch(isOpen, async (open) => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = open ? "hidden" : "";
  await nextTick();
  if (open) closeButton.value?.focus();
  else menuButton.value?.focus();
});

onBeforeUnmount(() => {
  if (typeof document !== "undefined") document.body.style.overflow = "";
});

const handleMenuKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    isOpen.value = false;
    return;
  }

  if (event.key !== "Tab" || !menuPanel.value) return;

  const focusable = Array.from(
    menuPanel.value.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.offsetParent !== null);

  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};
</script>

<template>
  <header
    class="sticky top-0 z-50 border-b border-border/70 bg-background/75 backdrop-blur-xl backdrop-saturate-150"
  >
    <div class="container-page flex h-[var(--header-height)] items-center gap-3">
      <NuxtLink
        to="/"
        class="flex shrink-0 items-center gap-2.5 text-foreground"
        aria-label="Vantol Bennett — home"
        @click="closeMenus"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
          class="text-fg-strong"
        >
          <path d="M3 4.25 10 16.25 17 4.25" stroke="currentColor" stroke-width="1.7" />
        </svg>
        <span class="text-[15px] font-medium tracking-[-0.02em]">Vantol Bennett</span>
      </NuxtLink>

      <nav class="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
        <NuxtLink
          v-for="link in primaryLinks"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          :aria-current="isActive(link.to) ? 'page' : undefined"
        >
          {{ link.name }}
        </NuxtLink>

        <details class="relative">
          <summary class="nav-link cursor-pointer list-none [&::-webkit-details-marker]:hidden">
            More
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </summary>
          <div
            class="absolute left-0 top-full mt-2 w-56 border border-border bg-popover p-1.5 shadow-[var(--shadow-menu)]"
            style="border-radius: var(--radius-md)"
          >
            <NuxtLink
              v-for="link in secondaryLinks"
              :key="link.to"
              :to="link.to"
              class="flex items-center justify-between rounded-[4px] px-2.5 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
              :class="isActive(link.to) ? 'text-foreground' : ''"
              @click="closeDetails"
            >
              {{ link.name }}
              <span class="font-mono text-[10px] text-faint-ink" aria-hidden="true">↗</span>
            </NuxtLink>
          </div>
        </details>
      </nav>

      <div class="ml-auto hidden items-center gap-2 lg:flex">
        <button
          type="button"
          class="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
          title="Search (⌘K)"
          aria-label="Open command palette"
          @click="openCommandPalette"
        >
          <Search class="h-4 w-4" />
        </button>

        <a
          href="/rss.xml"
          class="hidden h-8 items-center rounded-md border border-border bg-surface px-3 text-[13px] font-medium text-foreground transition-colors hover:border-border-strong xl:inline-flex"
        >
          RSS
        </a>

        <NuxtLink
          to="/blog"
          class="btn btn-primary h-8 min-h-8 rounded-md px-3 text-[13px]"
        >
          Start reading
        </NuxtLink>

        <DarkModeToggle />

        <button
          v-if="authUser"
          type="button"
          class="flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          :title="`Signed in as ${authUser.name}. Click to sign out.`"
          @click="handleSignOut"
        >
          <img
            v-if="authUser.image"
            :src="authUser.image"
            :alt="authUser.name"
            class="h-5 w-5 rounded-sm object-cover"
          />
          <span v-else class="grid h-5 w-5 place-items-center rounded-sm bg-surface-2 text-[10px]">
            {{ authUser.name?.charAt(0) }}
          </span>
          <span class="hidden xl:inline">Sign out</span>
        </button>
      </div>

      <div class="ml-auto flex items-center gap-1 lg:hidden">
          <button
            type="button"
            class="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label="Search"
            @click="openCommandPalette"
          >
            <Search class="h-4 w-4" />
          </button>

          <button
            ref="menuButton"
            type="button"
            class="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
            aria-label="Open navigation menu"
            aria-controls="mobile-navigation"
            :aria-expanded="isOpen"
            @click="isOpen = true"
          >
            <Menu class="h-4 w-4" />
          </button>

          <Teleport to="body">
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0"
              enter-to-class="opacity-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100"
              leave-to-class="opacity-0"
            >
              <div v-if="isOpen" class="fixed inset-0 z-[60] lg:hidden">
                <button
                  type="button"
                  class="absolute inset-0 h-full w-full cursor-default bg-black/70"
                  aria-label="Close navigation menu"
                  tabindex="-1"
                  @click="closeMenus"
                />
                <aside
                  id="mobile-navigation"
                  ref="menuPanel"
                  role="dialog"
                  aria-modal="true"
                  aria-label="Site navigation"
                  tabindex="-1"
                  class="absolute inset-y-0 right-0 flex w-[min(92vw,380px)] flex-col border-l border-border bg-background text-foreground"
                  @keydown="handleMenuKeydown"
                >
                  <div
                    class="flex h-[var(--header-height)] items-center justify-between border-b border-border px-6"
                  >
                    <NuxtLink to="/" class="flex items-center gap-2.5" @click="closeMenus">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                        class="text-fg-strong"
                      >
                        <path
                          d="M3 4.25 10 16.25 17 4.25"
                          stroke="currentColor"
                          stroke-width="1.7"
                        />
                      </svg>
                      <span class="text-[15px] font-medium tracking-[-0.02em]"
                        >Vantol Bennett</span
                      >
                    </NuxtLink>
                    <button
                      ref="closeButton"
                      type="button"
                      class="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-2 hover:text-foreground"
                      aria-label="Close navigation menu"
                      @click="closeMenus"
                    >
                      <X class="h-4 w-4" />
                    </button>
                  </div>

                  <nav class="flex-1 overflow-y-auto px-6 py-6" aria-label="Mobile">
                    <p class="label mb-3">Sections</p>
                    <div class="mb-8 border-t border-border">
                      <NuxtLink
                        v-for="link in primaryLinks"
                        :key="link.to"
                        :to="link.to"
                        class="flex items-center justify-between border-b border-border py-3 text-[15px] text-muted-foreground transition-colors hover:text-foreground"
                        :class="isActive(link.to) ? 'text-foreground' : ''"
                        @click="closeMenus"
                      >
                        {{ link.name }}
                        <span
                          v-if="isActive(link.to)"
                          class="h-1.5 w-1.5 rounded-full bg-blue"
                          aria-hidden="true"
                        />
                      </NuxtLink>
                    </div>

                    <p class="label mb-3">Elsewhere</p>
                    <div class="border-t border-border">
                      <NuxtLink
                        v-for="link in secondaryLinks"
                        :key="link.to"
                        :to="link.to"
                        class="flex items-center justify-between border-b border-border py-2.5 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
                        @click="closeMenus"
                      >
                        {{ link.name }}
                        <span class="font-mono text-[10px] text-faint-ink" aria-hidden="true"
                          >↗</span
                        >
                      </NuxtLink>
                    </div>
                  </nav>

                  <div class="border-t border-border px-6 py-5">
                    <div class="flex items-center justify-between">
                      <a
                        href="/rss.xml"
                        class="text-[13px] text-muted-foreground hover:text-foreground"
                      >
                        RSS
                      </a>
                      <DarkModeToggle />
                    </div>
                  </div>
                </aside>
              </div>
            </Transition>
          </Teleport>
      </div>
    </div>
  </header>
</template>
