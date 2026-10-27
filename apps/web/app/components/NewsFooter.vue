<script setup lang="ts">
import AdminLink from "@/components/AdminLink.vue";

const footerEmail = ref("");
const footerStatus = ref<"idle" | "loading" | "success" | "error">("idle");
const footerMessage = ref("");

const { subscribe } = useNewsletter();

const year = useState("copyright-year", () => new Date().getFullYear());

const handleFooterSubscribe = async () => {
  if (!footerEmail.value || !footerEmail.value.includes("@")) {
    footerStatus.value = "error";
    footerMessage.value = "Enter a valid email address.";
    return;
  }

  footerStatus.value = "loading";

  const result = await subscribe(footerEmail.value, "footer");

  if (result.success) {
    footerStatus.value = "success";
    footerMessage.value = result.message;
    footerEmail.value = "";
  } else {
    footerStatus.value = "error";
    footerMessage.value = result.message;
  }

  setTimeout(() => {
    footerStatus.value = "idle";
    footerMessage.value = "";
  }, 4000);
};
</script>

<template>
  <footer class="border-t border-border">
    <div class="container-page py-16 md:py-20">
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_1fr]">
        <div>
          <NuxtLink
            to="/"
            class="inline-flex items-center gap-2.5 text-foreground"
            aria-label="Vantol Bennett — home"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M3 4.25 10 16.25 17 4.25"
                stroke="currentColor"
                stroke-width="1.7"
                class="text-fg-strong"
              />
            </svg>
            <span class="text-[15px] font-medium tracking-[-0.02em]">Vantol Bennett</span>
          </NuxtLink>
          <p class="mt-4 max-w-xs text-[14px] leading-relaxed text-muted-foreground">
            Jamaican educator turned full-stack developer. Notes from the work: Vue, Nuxt,
            TypeScript, Nitro, and the lessons that survive production.
          </p>
          <div class="mt-5 flex items-center gap-2 text-[12px] text-muted-foreground">
            <span class="relative flex h-1.5 w-1.5">
              <span class="absolute inline-flex h-full w-full rounded-full bg-success opacity-60" />
              <span class="relative inline-flex h-1.5 w-1.5 rounded-full bg-success" />
            </span>
            Online in Jamaica
          </div>
        </div>

        <div>
          <p class="label mb-4">Writing</p>
          <ul class="space-y-2.5 text-[13px]">
            <li>
              <NuxtLink to="/blog" class="text-muted-foreground hover:text-foreground"
                >All essays</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/learn" class="text-muted-foreground hover:text-foreground"
                >Tutorials</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/projects" class="text-muted-foreground hover:text-foreground"
                >Projects</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/publications" class="text-muted-foreground hover:text-foreground"
                >Publications</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/gallery" class="text-muted-foreground hover:text-foreground"
                >Gallery</NuxtLink
              >
            </li>
          </ul>
        </div>

        <div>
          <p class="label mb-4">Elsewhere</p>
          <ul class="space-y-2.5 text-[13px]">
            <li>
              <a
                href="https://github.com/titan-65"
                target="_blank"
                rel="noopener noreferrer"
                class="text-muted-foreground hover:text-foreground"
                >GitHub</a
              >
            </li>
            <li>
              <a
                href="https://twitter.com/vantolbennett"
                target="_blank"
                rel="noopener noreferrer"
                class="text-muted-foreground hover:text-foreground"
                >Twitter</a
              >
            </li>
            <li>
              <a
                href="https://www.youtube.com/user/teckcare2011"
                target="_blank"
                rel="noopener noreferrer"
                class="text-muted-foreground hover:text-foreground"
                >YouTube</a
              >
            </li>
            <li>
              <a href="/rss.xml" class="text-muted-foreground hover:text-foreground">RSS</a>
            </li>
            <AdminLink />
          </ul>
        </div>

        <div>
          <p class="label mb-4">Explore</p>
          <ul class="space-y-2.5 text-[13px]">
            <li>
              <NuxtLink to="/about" class="text-muted-foreground hover:text-foreground"
                >About</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/guestbook" class="text-muted-foreground hover:text-foreground"
                >Guestbook</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/uses" class="text-muted-foreground hover:text-foreground"
                >Uses</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/stats" class="text-muted-foreground hover:text-foreground"
                >Stats</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/contact" class="text-muted-foreground hover:text-foreground"
                >Contact</NuxtLink
              >
            </li>
          </ul>
        </div>

        <div>
          <p class="label mb-4">Letters</p>
          <p class="mb-4 text-[13px] leading-relaxed text-muted-foreground">
            New essays and build notes, sent when there is something worth saying.
          </p>
          <form class="flex gap-2" @submit.prevent="handleFooterSubscribe">
            <label for="footer-email" class="sr-only">Email address</label>
            <input
              id="footer-email"
              v-model="footerEmail"
              type="email"
              placeholder="you@example.com"
              class="field"
              :disabled="footerStatus === 'loading' || footerStatus === 'success'"
            />
            <button
              type="submit"
              class="btn btn-primary shrink-0 px-3"
              :disabled="footerStatus === 'loading' || footerStatus === 'success'"
            >
              <span v-if="footerStatus === 'loading'">…</span>
              <span v-else-if="footerStatus === 'success'">Sent</span>
              <span v-else>Join</span>
            </button>
          </form>
          <p
            v-if="footerMessage"
            class="mt-3 text-[12px]"
            :class="footerStatus === 'error' ? 'text-danger' : 'text-success'"
            role="status"
          >
            {{ footerMessage }}
          </p>
        </div>
      </div>

      <div
        class="mt-14 flex flex-col justify-between gap-4 border-t border-border pt-6 text-[12px] text-muted-foreground sm:flex-row sm:items-center"
      >
        <p>© {{ year }} Vantol Bennett. Built with Nuxt.</p>
        <div class="flex items-center gap-4">
          <a href="/rss.xml" class="hover:text-foreground">RSS</a>
          <span aria-hidden="true">·</span>
          <NuxtLink to="/about" class="hover:text-foreground">Colophon</NuxtLink>
          <span aria-hidden="true">·</span>
          <DarkModeToggle />
        </div>
      </div>
    </div>
  </footer>
</template>
