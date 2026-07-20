<script setup lang="ts">
const { data: allPosts } = await useAsyncData('all-posts', async () => {
	const items = await queryCollection('blog')
		.order('date', 'DESC')
		.limit(6)
		.all() as any[]
	return items.map(p => ({ ...p, _path: p.path, slug: p.path.split('/').pop() }))
})

const { data: series } = await useAsyncData('home-series', async () => {
	const items = await queryCollection('tutorials').all() as any[]
	return items
		.filter((doc: any) => !doc.order && doc.path?.split('/').filter(Boolean).length === 2)
		.map((doc: any) => ({ ...doc, slug: doc.path?.split('/').pop() }))
		.sort((a: any, b: any) => new Date(b.releaseDate || 0).getTime() - new Date(a.releaseDate || 0).getTime())
})
</script>

<template>
	<div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
		<!-- Hero Section -->
		<section class="relative border-b border-white/10 min-h-[70vh] flex items-center overflow-hidden">
			<!-- Background Image -->
			<NuxtImg provider="cloudinary" src="v1784462779/vantol_hero_orrfjn.jpg" alt="Vantol Bennett"
				class="absolute inset-0 w-full h-full object-cover" />
			<div class="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/85 to-[#0a0a0a]/40" />

			<!-- Text -->
			<div class="relative max-w-[1200px] mx-auto px-6 py-16 lg:py-24 w-full">
				<h1 class="text-5xl md:text-7xl font-medium tracking-tight mb-6 leading-[1.05] text-[#fff]">
					Vantol<br>Bennett
				</h1>
				<p class="text-lg md:text-xl text-zinc-400 mb-2 font-light">
					Jamaican Educator & Developer
				</p>
				<p class="text-zinc-500 mb-10">
					Founder of Zhyjenae · Building at MPS
				</p>

				<div class="flex flex-wrap gap-3">
					<NuxtLink to="/learn" class="hero-btn inline-flex items-center gap-2">
						Start Learning
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
							stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</NuxtLink>
					<NuxtLink to="/contact" class="hero-btn-outline">
						Contact Me
					</NuxtLink>
				</div>
			</div>
		</section>

		<!-- Editorial Section -->
		<section class="border-b border-white/10">
			<div class="max-w-[1200px] mx-auto px-6 py-24">
				<div class="grid md:grid-cols-2 gap-12 md:gap-20">
					<div>
						<h2 class="text-3xl md:text-4xl font-semibold tracking-tight leading-tight">
							Building real things teaches you more than any tutorial.
						</h2>
					</div>
					<div class="space-y-6 text-zinc-400 leading-relaxed">
						<p>
							I spent over a decade teaching Mathematics and Science at Eltham High School. What I learned
							is this: the best way to master anything is to teach it — and the best way to learn code is
							to ship it.
						</p>
						<p>
							Today I'm a full-stack developer building with Vue.js, Nuxt, TypeScript, and Node.js. I
							write about the tools I'm using, the mistakes I'm making, and the patterns that actually
							hold up in production.
						</p>
						<p>
							This blog isn't about hot takes or hype cycles. It's about real engineering — the kind that
							survives contact with messy requirements, legacy code, and tight deadlines.
						</p>
						<p class="text-zinc-300">
							"The best way to write code all day is by doing it! Evolve with innovation."
						</p>
					</div>
				</div>
			</div>
		</section>

		<!-- Learn Section -->
		<section class="relative overflow-hidden">
			<div class="absolute inset-0 bg-gradient-to-br from-[#f5c542]/10 via-transparent to-transparent" />
			<div class="relative max-w-[1200px] mx-auto px-6 py-24">
				<div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
					<div>
						<p
							class="text-[10px] font-bold uppercase tracking-widest text-[#f5c542] mb-3 flex items-center gap-2">
							<span class="inline-block w-2 h-2 rounded-full bg-[#f5c542] animate-pulse" />
							Now Learning
						</p>
						<h2 class="text-3xl md:text-5xl font-semibold tracking-tight">
							Learn
							<ClientOnly>
								<RotatingText :texts="['Nuxt', 'Vue', 'React', 'EVE-framework']" class="text-[#f5c542]"
									element-level-class-name="inline-block" :rotation-interval="2200"
									:stagger-duration="0.02" />
								<template #fallback>
									<span class="text-[#f5c542]">Nuxt</span>
								</template>
							</ClientOnly>
							<span class="block text-2xl md:text-4xl text-zinc-400 mt-2">one release at a time</span>
						</h2>
					</div>
					<p class="text-zinc-400 text-sm max-w-md">
						Hands-on tutorials where we learn the new framework features together — straight from the
						release notes, step by
						step.
					</p>
				</div>

				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					<NuxtLink v-for="s in series" :key="s.slug" :to="`/learn/${s.slug}`"
						class="group relative flex flex-col bg-[#111] border border-white/10 hover:border-[#f5c542] rounded-2xl overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_0_40px_-12px_rgba(245,197,66,0.35)]">
						<div v-if="s.img" class="aspect-[16/9] overflow-hidden bg-zinc-900">
							<NuxtImg :src="s.img" :alt="s.title"
								class="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
								sizes="500px" />
						</div>
						<div class="p-6 flex flex-col flex-1">
							<div class="flex items-center gap-2 mb-3">
								<span
									class="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[#f5c542] text-black rounded">v{{
										s.nuxtVersion }}</span>
								<span v-if="s.difficulty"
									class="text-[10px] font-mono uppercase tracking-wider text-zinc-500">{{
										s.difficulty }}</span>
								<span v-if="s.releaseDate" class="text-[10px] text-zinc-600 ml-auto">{{ new
									Date(s.releaseDate).toLocaleDateString('en', { month: 'short', year: 'numeric' })
									}}</span>
							</div>
							<h3 class="text-lg font-semibold group-hover:text-[#f5c542] transition-colors mb-2">{{
								s.title }}</h3>
							<p class="text-sm text-zinc-500 line-clamp-2 flex-1">{{ s.description }}</p>
							<span
								class="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#f5c542] transition-colors">
								Start learning
								<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
									stroke-width="2" class="group-hover:translate-x-1 transition-transform">
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
							</span>
						</div>
					</NuxtLink>
				</div>

				<div class="mt-12 text-center">
					<NuxtLink to="/learn" class="hero-btn inline-flex items-center gap-2">
						Browse All Tutorials
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
							stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</NuxtLink>
				</div>
			</div>
		</section>

		<!-- Testimonial -->
		<section class="border-b border-white/10">
			<div class="max-w-[1200px] mx-auto px-6 py-24">
				<div class="max-w-3xl mx-auto text-center">
					<div class="flex justify-center gap-1 mb-6">
						<svg v-for="i in 5" :key="i" width="20" height="20" viewBox="0 0 24 24" fill="#f5c542"
							class="text-[#f5c542]">
							<path
								d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
						</svg>
					</div>
					<blockquote class="text-2xl md:text-3xl font-medium leading-tight mb-8 text-zinc-200">
						"The best way to write code all day is by doing it! Evolve with innovation."
					</blockquote>
					<div class="flex items-center justify-center gap-3">
						<div class="w-10 h-10 rounded-full overflow-hidden bg-zinc-800">
							<img src="https://res.cloudinary.com/ddszyeplg/image/upload/v1656478354/IMG_1412_orxemy.jpg"
								alt="Vantol Bennett" class="w-full h-full object-cover" />
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
			<div class="max-w-[1200px] mx-auto px-6 py-24">
				<div class="grid md:grid-cols-2 gap-12 items-center">
					<div class="relative aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-900">
						<video src="/about-loop.mp4" class="w-full h-full object-cover" autoplay loop muted playsinline />
					</div>
					<div>
						<h2 class="text-3xl font-semibold tracking-tight mb-6">
							Hi, I'm Vantol Bennett
						</h2>
						<div class="space-y-4 text-zinc-400 leading-relaxed">
							<p>
								Before creating Zhyjenae, I spent over a decade teaching Mathematics and Science at
								Eltham High
								School — where I learned that the best way to master anything is to teach it.
							</p>
							<p>
								Today, I'm a full-stack developer building with Vue.js, Nuxt, TypeScript, and Node.js.
								I'm
								passionate about creating tools that help developers and educators level up.
							</p>
							<p>
								I'm building in public — sharing everything I learn about modern web development,
								AI-assisted
								coding, and software architecture.
							</p>
						</div>
						<div class="mt-8">
							<NuxtLink to="/about" class="hero-btn inline-flex items-center gap-2">
								More About Me
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
									stroke-width="2">
									<path d="M5 12h14M12 5l7 7-7 7" />
								</svg>
							</NuxtLink>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Newsletter CTA -->
		<section class="border-b border-white/10">
			<div class="max-w-[1200px] mx-auto px-6 py-24">
				<div class="max-w-2xl mx-auto text-center">
					<p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">Stay Updated</p>
					<h2 class="text-3xl md:text-4xl font-semibold tracking-tight mb-4">
						Code that ships.
					</h2>
					<p class="text-zinc-400 mb-8">
						Notes on the tools, patterns, and hard-won lessons from building real software — no fluff, no
						hype
						cycles.
					</p>
					<Newsletter />
				</div>
			</div>
		</section>

		<!-- Latest Posts Grid -->
		<section class="border-b border-white/10">
			<div class="max-w-[1200px] mx-auto px-6 py-20">
				<h2 class="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-12">
					My latest posts
				</h2>

				<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
					<PostCard v-for="post in allPosts" :key="post._path" :item="post" />
				</div>

				<div class="mt-12 text-center">
					<NuxtLink to="/blog" class="hero-btn-outline inline-flex items-center gap-2">
						View All Posts
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
							stroke-width="2">
							<path d="M5 12h14M12 5l7 7-7 7" />
						</svg>
					</NuxtLink>
				</div>
			</div>
		</section>
	</div>
</template>
