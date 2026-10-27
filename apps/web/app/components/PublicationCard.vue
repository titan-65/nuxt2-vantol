<script setup lang="ts">
defineProps<{
  item: {
    title: string;
    subtitle?: string;
    cover: string;
    publisher?: string;
    isbn?: string;
    format?: string;
    pages?: number;
    date?: string;
    description: string;
    amazonUrl: string;
    previewUrl?: string | null;
    reviews?: Array<{ quote: string; author: string; source: string }>;
    toc?: string[];
    relatedPosts?: string[];
  };
}>();

const formatDate = (dateStr?: string) => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { year: "numeric", month: "long" });
};
</script>

<template>
  <div class="space-y-16">
    <!-- Book Feature -->
    <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
      <!-- Cover Image -->
      <div class="relative">
        <div class="relative z-10 rounded-xl overflow-hidden bg-muted shadow-lg">
          <div class="aspect-[3/4] overflow-hidden">
            <img :src="item.cover" :alt="item.title" class="w-full h-full object-cover" />
          </div>
        </div>
      </div>

      <!-- Details -->
      <div>
        <h2 class="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
          {{ item.title }}
        </h2>
        <p v-if="item.subtitle" class="text-lg text-muted-foreground font-light mb-6">
          {{ item.subtitle }}
        </p>

        <!-- Metadata Badges -->
        <div class="flex flex-wrap gap-3 mb-8">
          <span
            v-if="item.format"
            class="inline-block px-2.5 py-1 text-xs font-mono bg-brand text-brand-foreground rounded-md uppercase font-bold"
          >
            {{ item.format }}
          </span>
          <span
            v-if="item.pages"
            class="inline-block px-2.5 py-1 text-xs font-mono border border-border text-muted-foreground rounded-md uppercase"
          >
            {{ item.pages }} pages
          </span>
          <span
            v-if="item.date"
            class="inline-block px-2.5 py-1 text-xs font-mono border border-border text-muted-foreground rounded-md uppercase"
          >
            {{ formatDate(item.date) }}
          </span>
          <span
            v-if="item.publisher"
            class="inline-block px-2.5 py-1 text-xs font-mono border border-border text-muted-foreground rounded-md uppercase"
          >
            {{ item.publisher }}
          </span>
        </div>

        <!-- Description -->
        <p class="text-muted-foreground font-light leading-relaxed mb-8">
          {{ item.description }}
        </p>

        <!-- CTA Buttons -->
        <div class="flex flex-wrap gap-4">
          <a
            :href="item.amazonUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 bg-brand text-brand-foreground px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-brand-hover transition-colors rounded-lg"
          >
            Buy on Amazon
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
          <a
            v-if="item.previewUrl"
            :href="item.previewUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 border border-border bg-transparent text-foreground px-6 py-3 text-sm font-medium uppercase tracking-widest hover:bg-accent transition-colors rounded-lg"
          >
            Preview
          </a>
        </div>
      </div>
    </div>

    <!-- Reviews Section -->
    <div v-if="item.reviews && item.reviews.length > 0">
      <div class="flex items-center gap-2 mb-8">
        <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Reviews</span>
      </div>
      <div class="grid md:grid-cols-2 gap-6">
        <ReviewCard
          v-for="(review, index) in item.reviews"
          :key="index"
          :quote="review.quote"
          :author="review.author"
          :source="review.source"
        />
      </div>
    </div>

    <!-- Table of Contents -->
    <div v-if="item.toc && item.toc.length > 0">
      <div class="flex items-center gap-2 mb-8">
        <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Table of Contents</span
        >
      </div>
      <div class="bg-card border border-border rounded-xl p-8">
        <ol class="space-y-3">
          <li
            v-for="(chapter, index) in item.toc"
            :key="index"
            class="flex items-start gap-4 text-muted-foreground text-sm"
          >
            <span class="text-xs font-bold text-muted-foreground mt-0.5 w-6 text-right">{{
              String(index + 1).padStart(2, "0")
            }}</span>
            <span class="font-light">{{ chapter }}</span>
          </li>
        </ol>
      </div>
    </div>

    <!-- Related Posts -->
    <div v-if="item.relatedPosts && item.relatedPosts.length > 0">
      <div class="flex items-center gap-2 mb-8">
        <span class="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
          >Related Posts</span
        >
      </div>
      <div class="flex flex-wrap gap-3">
        <NuxtLink
          v-for="slug in item.relatedPosts"
          :key="slug"
          :to="`/blog/${slug}`"
          class="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono border border-border hover:bg-accent hover:border-border-strong transition-colors uppercase rounded-lg text-muted-foreground"
        >
          {{ slug }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
