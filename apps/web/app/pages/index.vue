<script setup lang="ts">
const { data: posts } = await useAsyncData('posts', async () => {
  const items = await queryCollection('blog')
    .order('date', 'DESC')
    .limit(3)
    .all() as any[]

  return items.map(p => ({ ...p, _path: p.path, slug: p.path.split('/').pop() }))
})

const { data: allPosts } = await useAsyncData('all-posts', async () => {
  const items = await queryCollection('blog')
    .order('date', 'DESC')
    .limit(6)
    .all() as any[]
  return items.map(p => ({ ...p, _path: p.path, slug: p.path.split('/').pop() }))
})

const { data: projects } = await useAsyncData('projects', async () => {
  const items = await queryCollection('projects').all() as any[]
  return items.map(p => ({ ...p, _path: p.path, slug: p.path.split('/').pop() }))
})
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <!-- Hero Section -->
    <section class="border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-0 items-stretch min-h-[70vh]">
          <!-- Left: Text -->
          <div class="flex flex-col justify-center py-16 lg:py-24 lg:pr-12">
            <h1 class="text-5xl md:text-7xl font-semibold tracking-tight mb-6 leading-[1.05]">
              Vantol<br>Bennett
            </h1>
            <p class="text-lg md:text-xl text-zinc-400 mb-2 font-light">
              Jamaican Educator & Developer
            </p>
            <p class="text-zinc-500 mb-10">
              Founder of Zhyjenae · Building at MPS
            </p>

            <div class="flex flex-wrap gap-3">
              <NuxtLink to="/projects" class="hero-btn inline-flex items-center gap-2">
                View Projects
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
              <NuxtLink to="/contact" class="hero-btn-outline">
                Contact Me
              </NuxtLink>
            </div>
          </div>

          <!-- Right: Image -->
          <div class="relative hidden lg:flex items-center justify-center py-12">
            <div class="relative w-full aspect-[4/3] rounded-2xl overflow-hidden">
              <NuxtImg
                provider="cloudinary"
                src="v1767533048/PXL_20251010_202726442_2_hhudfr.jpg"
                alt="Vantol Bennett"
                class="w-full h-full object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-[#0a0a0a]/60 to-transparent"/>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Posts Row -->
    <section v-if="posts?.length" class="border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6 py-12">
        <div class="flex items-center gap-3 mb-8">
          <span class="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/10 rounded text-zinc-300">Latest</span>
          <span class="text-[10px] font-mono uppercase tracking-wider text-zinc-500">From the blog</span>
        </div>

        <div class="space-y-0">
          <NuxtLink
            v-for="(post, i) in posts"
            :key="post._path"
            :to="`/blog/${post.slug}`"
            class="group flex items-center gap-6 py-6 border-t border-white/10 first:border-t-0 hover:bg-white/[0.02] transition-colors -mx-3 px-3 rounded-lg"
          >
            <div class="hidden sm:block w-24 h-16 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
              <NuxtImg
                v-if="post.img"
                :src="post.img"
                :alt="post.title"
                class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                width="96"
                height="64"
              />
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-semibold mb-1 group-hover:text-[#f5c542] transition-colors truncate">
                {{ post.title }}
              </h3>
              <p class="text-sm text-zinc-500 line-clamp-1">
                {{ post.description }}
              </p>
            </div>
            <div class="shrink-0 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#f5c542] group-hover:bg-[#f5c542]/10 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-500 group-hover:text-[#f5c542] transition-colors">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Editorial Section -->
    <section class="border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6 py-24">
        <div class="grid md:grid-cols-2 gap-12 md:gap-20">
          <div>
            <h2 class="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
              Building real things teaches you more than any tutorial.
            </h2>
          </div>
          <div class="space-y-6 text-zinc-400 leading-relaxed">
            <p>
              I spent over a decade teaching Mathematics and Science at Eltham High School. What I learned is this: the best way to master anything is to teach it — and the best way to learn code is to ship it.
            </p>
            <p>
              Today I'm a full-stack developer building with Vue.js, Nuxt, TypeScript, and Node.js. I write about the tools I'm using, the mistakes I'm making, and the patterns that actually hold up in production.
            </p>
            <p>
              This blog isn't about hot takes or hype cycles. It's about real engineering — the kind that survives contact with messy requirements, legacy code, and tight deadlines.
            </p>
            <p class="text-zinc-300">
              "The best way to write code all day is by doing it! Evolve with innovation."
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Level Up Heading -->
    <section class="border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6 py-20 text-center">
        <h2 class="text-3xl md:text-5xl font-semibold tracking-tight">
          Learn. Build. Ship. Repeat.
        </h2>
      </div>
    </section>

    <!-- Featured Resources -->
    <section class="border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6 py-16">
        <div class="space-y-4">
          <NuxtLink
            v-for="project in projects?.slice(0, 4)"
            :key="project._path"
            :to="`/projects/${project.slug}`"
            class="group flex items-center gap-5 p-4 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all"
          >
            <div class="w-16 h-16 rounded-lg overflow-hidden bg-zinc-900 shrink-0">
              <img
                v-if="project.image"
                :src="project.image"
                :alt="project.title"
                class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                width="64"
                height="64"
              />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-white/10 rounded text-zinc-400">Project</span>
                <span class="text-[10px] font-mono text-zinc-600 uppercase tracking-wider">{{ project.tag }}</span>
              </div>
              <h3 class="text-base font-semibold group-hover:text-[#f5c542] transition-colors">
                {{ project.title }}
              </h3>
              <p class="text-sm text-zinc-500 line-clamp-1">
                {{ project.preview }}
              </p>
            </div>
            <div class="shrink-0 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#f5c542] transition-colors">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-zinc-500 group-hover:text-[#f5c542] transition-colors">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Latest Posts Grid -->
    <section class="border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6 py-20">
        <h2 class="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-12">
          My latest posts
        </h2>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PostCard v-for="post in allPosts" :key="post._path" :item="post" />
        </div>

        <div class="mt-12 text-center">
          <NuxtLink to="/blog" class="hero-btn-outline inline-flex items-center gap-2">
            View All Posts
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Testimonial -->
    <section class="border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6 py-24">
        <div class="max-w-3xl mx-auto text-center">
          <div class="flex justify-center gap-1 mb-6">
            <svg v-for="i in 5" :key="i" width="20" height="20" viewBox="0 0 24 24" fill="#f5c542" class="text-[#f5c542]">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <blockquote class="text-2xl md:text-3xl font-medium leading-tight mb-8 text-zinc-200">
            "The best way to write code all day is by doing it! Evolve with innovation."
          </blockquote>
          <div class="flex items-center justify-center gap-3">
            <div class="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
              <img src="https://res.cloudinary.com/ddszyeplg/image/upload/v1656478354/IMG_1412_orxemy.jpg" alt="Vantol Bennett" class="w-full h-full object-cover" />
            </div>
            <div class="text-left">
              <div class="font-semibold text-sm">Vantol Bennett</div>
              <div class="text-xs text-zinc-500">Founder, Zhyjenae</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- About / Bio Section -->
    <section class="border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6 py-24">
        <div class="grid md:grid-cols-2 gap-12 items-center">
          <div class="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900">
            <NuxtImg
              provider="cloudinary"
              src="v1767533048/PXL_20251010_202726442_2_hhudfr.jpg"
              alt="Vantol Bennett"
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <h2 class="text-3xl font-semibold tracking-tight mb-6">
              Hi, I'm Vantol Bennett
            </h2>
            <div class="space-y-4 text-zinc-400 leading-relaxed">
              <p>
                Before creating Zhyjenae, I spent over a decade teaching Mathematics and Science at Eltham High School — where I learned that the best way to master anything is to teach it.
              </p>
              <p>
                Today, I'm a full-stack developer building with Vue.js, Nuxt, TypeScript, and Node.js. I'm passionate about creating tools that help developers and educators level up.
              </p>
              <p>
                I'm building in public — sharing everything I learn about modern web development, AI-assisted coding, and software architecture.
              </p>
            </div>
            <div class="mt-8">
              <NuxtLink to="/about" class="hero-btn inline-flex items-center gap-2">
                More About Me
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Newsletter CTA -->
    <section class="border-b border-white/10">
      <div class="max-w-5xl mx-auto px-6 py-24">
        <div class="max-w-2xl mx-auto text-center">
          <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Stay Updated</p>
          <h2 class="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Get practical engineering notes.
          </h2>
          <p class="text-zinc-400 mb-8">
            Short updates on skills, frameworks, code review, and the parts of software engineering that survive contact with real code.
          </p>
          <Newsletter />
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section>
      <div class="max-w-5xl mx-auto px-6 py-24">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">Latest Work</p>
            <h2 class="text-3xl md:text-4xl font-semibold tracking-tight">Projects</h2>
          </div>
          <p class="text-zinc-500 text-sm max-w-md">
            Various frameworks including React.js, Nuxt.js, Vue.js & TypeScript
          </p>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCard v-for="project in projects" :key="project._path" :item="project" />
        </div>
      </div>
    </section>
  </div>
</template>
