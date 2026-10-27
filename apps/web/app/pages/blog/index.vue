<script setup lang="ts">
const { data: posts } = await useAsyncData("blog-posts", async () => {
  const items = (await queryCollection("blog").order("date", "DESC").all()) as any[];
  return items.map((p: any) => ({ ...p, _path: p.path, slug: p.path.split("/").pop() }));
});

const route = useRoute();
const router = useRouter();

const uniqueAuthors = computed(() => {
  const authors = new Map<string, any>();
  posts.value?.forEach((post: any) => {
    if (post.author?.name && !authors.has(post.author.name)) {
      authors.set(post.author.name, post.author);
    }
  });
  return Array.from(authors.values());
});

const normalizeTag = (tag: string | undefined) =>
  (tag || "").replace(/^["'“”\s]+|["'“”\s]+$/g, "").trim();

const allTags = computed(() => {
  const tags = new Map<string, string>();
  posts.value?.forEach((post: any) => {
    const tag = normalizeTag(post.tag);
    if (tag && !tags.has(tag.toLowerCase())) tags.set(tag.toLowerCase(), tag);
  });
  return Array.from(tags.values()).sort((a, b) => a.localeCompare(b));
});

const selectedTag = ref<string | null>(null);
const sortOrder = ref<"latest" | "oldest">("latest");
const searchQuery = ref("");
const currentPage = ref(1);
const postsPerPage = 8;

watch(
  () => route.query.tag,
  (tag) => {
    selectedTag.value = typeof tag === "string" && tag.length ? normalizeTag(tag) : null;
    currentPage.value = 1;
  },
  { immediate: true },
);

watch(selectedTag, (tag) => {
  router.replace({
    query: {
      ...route.query,
      tag: tag || undefined,
    },
  });
});

const filteredPosts = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  let result = posts.value || [];

  if (selectedTag.value) {
    result = result.filter((post: any) => normalizeTag(post.tag) === selectedTag.value);
  }

  if (query) {
    result = result.filter((post: any) => {
      const titleMatch = post.title?.toLowerCase().includes(query);
      const descMatch = post.description?.toLowerCase().includes(query);
      const tagMatch = post.tag?.toLowerCase().includes(query);
      const keywordsMatch = post.keywords?.some((k: string) => k.toLowerCase().includes(query));
      return titleMatch || descMatch || tagMatch || keywordsMatch;
    });
  }

  return result.sort((a: any, b: any) => {
    const dateA = new Date(a.date || a.createdAt).getTime();
    const dateB = new Date(b.date || b.createdAt).getTime();
    return sortOrder.value === "latest" ? dateB - dateA : dateA - dateB;
  });
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredPosts.value.length / postsPerPage)),
);

const paginatedPosts = computed(() => {
  const start = (currentPage.value - 1) * postsPerPage;
  return filteredPosts.value.slice(start, start + postsPerPage);
});

watch([searchQuery, sortOrder, selectedTag], () => {
  currentPage.value = 1;
});

const clearFilter = () => {
  selectedTag.value = null;
};

const goToPage = (page: number) => {
  const nextPage = Math.min(Math.max(1, page), totalPages.value);
  currentPage.value = nextPage;
};

function formatDate(date: string | Date | undefined) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function isoDate(date: string | Date | undefined) {
  if (!date) return "";
  return new Date(date).toISOString().slice(0, 10);
}

function readingTime(post: any) {
  if (post?.readTime) return post.readTime;
  if (post?.body) {
    const text = JSON.stringify(post.body);
    const words = text.match(/\w+/g)?.length || 0;
    return Math.max(1, Math.ceil(words / 200));
  }
  return 1;
}
</script>

<template>
  <div class="reading-page container-page pt-16 md:pt-24">
    <header class="grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div class="lg:col-span-8">
        <h1 class="display text-[clamp(3rem,5.4vw,4rem)]">
          Writing
        </h1>
        <p
          class="mt-5 max-w-2xl text-[clamp(1.05rem,1.5vw,1.25rem)] leading-[1.65] text-muted-foreground"
        >
          Essays and field notes on Nuxt, Vue, TypeScript, Nitro, and the work of building software
          that survives contact with production.
        </p>
      </div>
      <div class="lg:col-span-4 lg:pl-10">
        <p class="ledger-meta">
          {{ filteredPosts.length }} {{ filteredPosts.length === 1 ? "essay" : "essays" }}
          <span v-if="selectedTag"> in {{ selectedTag }}</span>
          <span v-if="searchQuery"> matching “{{ searchQuery }}”</span>
        </p>
        <p class="mt-4 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
          Long-form notes, not hot takes. Every piece starts from something that was actually
          shipped.
        </p>
        <a href="/rss.xml" class="link mt-4 inline-flex text-[12px] font-medium">
          Subscribe via RSS →
        </a>
      </div>
    </header>

    <div class="mt-10 border-y border-border py-4">
      <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div class="relative w-full max-w-xs">
            <label for="writing-search" class="sr-only">Search writing</label>
            <svg
              class="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-faint-ink"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              id="writing-search"
              v-model="searchQuery"
              type="search"
              placeholder="Search the archive"
              class="field pl-9"
            />
          </div>

          <div class="flex items-center gap-2">
            <label for="sort-order" class="label whitespace-nowrap">Sort</label>
            <select id="sort-order" v-model="sortOrder" class="field max-w-[9rem] py-2 text-[12px]">
              <option value="latest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </div>

        <button
          v-if="selectedTag"
          type="button"
          class="link self-start text-left text-[12px] text-muted-foreground lg:self-auto"
          @click="clearFilter"
        >
          Clear tag: {{ selectedTag }} ×
        </button>
      </div>

      <div class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <span class="label">Tags</span>
        <button
          v-for="tag in allTags"
          :key="tag"
          type="button"
          class="text-[12px] transition-colors"
          :class="selectedTag === tag ? 'font-semibold text-blue' : 'text-muted-foreground hover:text-foreground'"
          :aria-pressed="selectedTag === tag"
          @click="selectedTag = selectedTag === tag ? null : tag"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <div class="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-16">
      <div class="lg:col-span-8">
        <div v-if="filteredPosts.length === 0" class="border-t border-border py-16">
          <p class="text-lg text-muted-foreground">No essays match that search.</p>
          <button
            type="button"
            class="link mt-3 text-[13px] font-medium"
            @click="
              searchQuery = '';
              selectedTag = null;
            "
          >
            Clear filters
          </button>
        </div>

        <div v-else>
          <NuxtLink
            v-for="post in paginatedPosts"
            :key="post.slug"
            :to="`/blog/${post.slug}`"
            class="ledger-row"
          >
            <time class="ledger-date ledger-meta" :datetime="isoDate(post.date)">
              {{ formatDate(post.date) }}
            </time>
            <span class="min-w-0">
              <span class="ledger-title block">{{ post.title }}</span>
              <span
                class="mt-1 hidden max-w-2xl text-[14px] leading-relaxed text-muted-foreground sm:line-clamp-2 sm:block"
              >
                {{ post.description }}
              </span>
            </span>
            <span
              class="ledger-tag font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground"
            >
              {{ normalizeTag(post.tag) }}
            </span>
            <span class="ledger-time ledger-meta text-right">{{ readingTime(post) }} min</span>
          </NuxtLink>
          <div class="border-t border-border" />
        </div>

        <div
          v-if="filteredPosts.length > postsPerPage"
          class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <p class="ledger-meta">Page {{ currentPage }} of {{ totalPages }}</p>
          <div class="flex items-center gap-4">
            <button
              type="button"
              class="link text-[12px] font-medium disabled:pointer-events-none disabled:opacity-40"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              ← Previous
            </button>
            <div class="flex items-center gap-3">
              <button
                v-for="page in totalPages"
                :key="page"
                type="button"
                class="grid h-8 min-w-8 place-items-center rounded-md border px-2 font-mono text-[11px] transition-colors"
                :class="
                  page === currentPage
                    ? 'border-foreground bg-foreground text-background'
                    : 'border-border text-muted-foreground hover:border-border-strong hover:text-foreground'
                "
                :aria-current="page === currentPage ? 'page' : undefined"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
            <button
              type="button"
              class="link text-[12px] font-medium disabled:pointer-events-none disabled:opacity-40"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              Next →
            </button>
          </div>
        </div>

      </div>

      <aside class="lg:col-span-4">
        <div class="border-t border-border pt-4">
          <h2 class="label">About the author</h2>
          <div v-for="author in uniqueAuthors" :key="author.name" class="mt-4 flex items-start gap-3">
            <NuxtImg
              :src="author.img"
              :alt="author.name"
              width="44"
              height="44"
              class="h-11 w-11 border border-border object-cover grayscale"
            />
            <div>
              <p class="text-[13px] font-semibold">{{ author.name }}</p>
              <p class="mt-1 text-[13px] leading-relaxed text-muted-foreground">
                Educator and full-stack developer in Jamaica. Writes about the work, not the hype.
              </p>
            </div>
          </div>
          <NuxtLink to="/about" class="link mt-4 inline-flex text-[12px] font-medium"
            >More about Vantol →</NuxtLink
          >
        </div>

        <div class="mt-10 border-t border-border pt-4">
          <h2 class="label">Elsewhere</h2>
          <ul class="mt-4 space-y-2.5 text-[13px]">
            <li>
              <NuxtLink to="/learn" class="link text-muted-foreground hover:text-foreground"
                >Tutorial series</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/projects" class="link text-muted-foreground hover:text-foreground"
                >Projects</NuxtLink
              >
            </li>
            <li>
              <NuxtLink to="/publications" class="link text-muted-foreground hover:text-foreground"
                >Publications</NuxtLink
              >
            </li>
            <li>
              <a href="/rss.xml" class="link text-muted-foreground hover:text-foreground"
                >RSS feed</a
              >
            </li>
          </ul>
        </div>

      </aside>
    </div>

    <div class="mt-20">
      <Newsletter />
    </div>
  </div>
</template>
