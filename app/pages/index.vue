<script setup lang="ts">
const { data: posts } = await useAsyncData('posts', async () => {
  const items = await queryCollection('blog')
    .order('date', 'DESC')
    .limit(3)
    .all() as any[]
  
  return items.map(p => ({ ...p, _path: p.path, slug: p.path.split('/').pop() }))
})

const { data: projects } = await useAsyncData('projects', async () => {
  const items = await queryCollection('projects').all() as any[]
  return items.map(p => ({ ...p, _path: p.path, slug: p.path.split('/').pop() }))
})
</script>

<template>
  <div class="min-h-screen bg-[#F3F3F3] text-black font-sans selection:bg-black selection:text-white">
    <!-- Hero Section -->
    <section class="pt-12 pb-12 md:pt-24 md:pb-20 border-b border-black/10">
      <div class="container mx-auto px-6">
        <!-- Badge -->
        <div class="flex items-center gap-2 mb-8">
          <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
          <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">PORTFOLIO & BLOG</span>
        </div>

        <div class="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div class="order-2 lg:order-1">
            <!-- Headline -->
            <h1 class="text-4xl md:text-6xl font-medium tracking-tight mb-6 leading-[1.1]">
              Vantol R. Bennett
            </h1>

            <!-- Subtext -->
            <p class="text-lg md:text-xl text-gray-600 mb-8 font-light leading-relaxed">
              Jamaican Educator & Developer at (MPS), Founder of Zhyjenae
            </p>

            <div class="border-l-2 border-black/10 pl-6 mb-10">
              <h2 class="text-2xl md:text-3xl font-medium mb-2">
                The best way to write code all day...
              </h2>
              <p class="text-lg text-gray-500 font-light italic">
                is by doing it! Evolve with innovation
              </p>
            </div>

            <!-- CTA -->
            <div class="flex flex-wrap gap-4">
              <NuxtLink to="/projects" class="bg-black text-white px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center gap-2">
                View Projects <span class="text-gray-400">-></span>
              </NuxtLink>
              <NuxtLink to="/contact" class="border border-black/20 bg-transparent text-black px-8 py-4 text-sm font-medium uppercase tracking-widest hover:bg-black/5 transition-colors">
                Contact Me
              </NuxtLink>
            </div>
          </div>

          <div class="order-1 lg:order-2 relative">
            <!-- Image with Wireframe decoration -->
            <div class="relative z-10 border border-black/20 bg-white p-2 shadow-sm transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div class="aspect-square overflow-hidden bg-gray-100 border border-black/10">
                <img
                  src="https://res.cloudinary.com/ddszyeplg/image/upload/v1656478354/IMG_1412_orxemy.jpg"
                  class="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500"
                  alt="Vantol Bennett"
                />
              </div>
              <div class="mt-2 flex justify-between items-center px-1">
                <div class="flex gap-1">
                  <div class="w-2 h-2 rounded-full bg-red-400/20"></div>
                  <div class="w-2 h-2 rounded-full bg-yellow-400/20"></div>
                  <div class="w-2 h-2 rounded-full bg-green-400/20"></div>
                </div>
                <span class="text-[10px] font-mono text-gray-400">IMG_1412.JPG</span>
              </div>
            </div>
            
            <!-- Background decorative elements -->
            <div class="absolute -top-4 -right-4 w-full h-full border border-dashed border-black/20 z-0"></div>
            <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgNDBMMDQwIDBaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIuMSIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNhKSIvPjwvc3ZnPg==')] opacity-20"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Key Features Section -->
    <section class="border-b border-black/10 bg-[#F3F3F3] relative overflow-hidden">
      <!-- Background Pattern -->
      <div class="absolute inset-0 opacity-[0.03]" style="background-image: repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 10px);"></div>
      
      <div class="container mx-auto px-6 py-24 relative z-10">
        <div class="flex items-center gap-2 mb-16">
          <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
          <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">KEY FEATURES</span>
        </div>

        <div class="space-y-24">
          <!-- Feature 1 -->
          <div class="max-w-4xl">
            <div class="mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-black mb-4">
                <path d="M16 18L22 12L16 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M8 6L2 12L8 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <h3 class="text-2xl font-medium mb-4">Modern Tech Stack</h3>
              <p class="text-gray-600 font-light leading-relaxed max-w-2xl font-mono text-sm">
                Leveraging the latest in web technology including Nuxt, Vue.js, and TypeScript. Building performant, type-safe, and scalable applications with a focus on developer experience.
              </p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="max-w-4xl">
            <div class="mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-black mb-4">
                <path d="M4 17L10 11L7 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15 17L9 11L12 20" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="2" y="4" width="20" height="12" rx="2" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <h3 class="text-2xl font-medium mb-4">Educational Insight</h3>
              <p class="text-gray-600 font-light leading-relaxed max-w-2xl font-mono text-sm">
                Bridging the gap between complex concepts and practical application. In-depth tutorials, guides, and mentorship designed to help developers level up their skills.
              </p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="max-w-4xl">
            <div class="mb-6">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="text-black mb-4">
                <path d="M12 20H12.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
              </svg>
              <h3 class="text-2xl font-medium mb-4">Creative Solutions</h3>
              <p class="text-gray-600 font-light leading-relaxed max-w-2xl font-mono text-sm">
                Transforming abstract ideas into concrete digital products. From architectural design to deployment, focusing on solving real-world problems through code.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Value Propositions Section -->
    <section class="border-b border-black/10 bg-white">
      <div class="container mx-auto px-6 py-24">
        <div class="flex items-center gap-2 mb-16">
          <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
          <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">VALUE PROPOSITIONS</span>
        </div>

        <div class="space-y-0">
          <!-- Value Prop 1 -->
          <div class="group border-t border-black/10 py-12 hover:bg-gray-50 transition-colors">
            <div class="flex flex-col md:flex-row gap-8 items-start">
              <div class="w-12 h-12 flex items-center justify-center border border-black/20 rounded-lg bg-white group-hover:border-black transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" stroke-width="1.5"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold font-mono mb-3">Full-Stack Development</h3>
                <p class="text-gray-600 font-light font-mono text-sm leading-relaxed max-w-3xl">
                  End-to-end application development using Node.js, Supabase, and modern frontend frameworks. Building robust backends and dynamic frontends.
                </p>
              </div>
            </div>
          </div>

          <!-- Value Prop 2 -->
          <div class="group border-t border-black/10 py-12 hover:bg-gray-50 transition-colors">
            <div class="flex flex-col md:flex-row gap-8 items-start">
              <div class="w-12 h-12 flex items-center justify-center border border-black/20 rounded-lg bg-white group-hover:border-black transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold font-mono mb-3">UI/UX Design</h3>
                <p class="text-gray-600 font-light font-mono text-sm leading-relaxed max-w-3xl">
                  Creating beautiful, accessible, and responsive interfaces that delight users. Attention to detail in every pixel and interaction.
                </p>
              </div>
            </div>
          </div>

          <!-- Value Prop 3 -->
          <div class="group border-t border-black/10 py-12 hover:bg-gray-50 transition-colors">
            <div class="flex flex-col md:flex-row gap-8 items-start">
              <div class="w-12 h-12 flex items-center justify-center border border-black/20 rounded-lg bg-white group-hover:border-black transition-colors">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5"/>
                  <path d="M3 12H6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M18 12H21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M12 3V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                  <path d="M12 18V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </div>
              <div>
                <h3 class="text-xl font-bold font-mono mb-3">Technical Education</h3>
                <p class="text-gray-600 font-light font-mono text-sm leading-relaxed max-w-3xl">
                  Simplifying complex topics through clear documentation, tutorials, and mentorship. Helping developers bridge the gap between theory and practice.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Posts Section -->
    <section class="border-b border-black/10">
      <div class="container mx-auto px-6 py-16">
        <div class="flex items-center justify-between mb-12">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
            <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">FEATURED POSTS</span>
          </div>
          <div class="hidden md:block text-xs font-mono text-gray-400">YAARD MAN A DO IT</div>
        </div>

        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PostCard v-for="post in posts" :key="post._path" :item="post" />
        </div>
        
        <div class="mt-12 text-center">
             <NuxtLink to="/blog" class="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-b border-black hover:text-gray-600 transition-colors pb-1">
                View All Posts ->
             </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Dark Section: One Platform -->
    <section class="bg-[#111111] text-white py-24 border-b border-white/10">
      <div class="container mx-auto px-6">
        <div class="flex items-center gap-2 mb-20">
          <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
          <span class="text-xs font-medium tracking-widest text-gray-400 uppercase">FEATURES</span>
        </div>

        <div class="grid lg:grid-cols-2 gap-20">
          <!-- Left Column: Big Text -->
          <div class="lg:sticky lg:top-24 h-fit">
            <h2 class="text-6xl md:text-8xl font-medium tracking-tight leading-[0.9] mb-12">
              Learn.<br>Build.<br>Share.<br>Repeat.
            </h2>
          </div>

          <!-- Right Column: Features Grid -->
          <div class="grid gap-16">
            <!-- Grid Item 1 -->
            <div class="group">
              <div class="mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <path d="M9 3v18" />
                  <path d="M3 9h18" />
                </svg>
              </div>
              <h3 class="text-xl font-medium mb-4">Continuous Learning</h3>
              <p class="text-gray-400 font-mono text-sm leading-relaxed">
                Always exploring new technologies and staying ahead of the curve. From new frameworks to design patterns.
              </p>
            </div>

            <!-- Grid Item 2 -->
            <div class="group">
              <div class="mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 7h-9" />
                  <path d="M14 17H5" />
                  <circle cx="17" cy="17" r="3" />
                  <circle cx="7" cy="7" r="3" />
                </svg>
              </div>
              <h3 class="text-xl font-medium mb-4">Open Source</h3>
              <p class="text-gray-400 font-mono text-sm leading-relaxed">
                Contributing to the community with useful tools and libraries. Believing in the power of shared knowledge.
              </p>
            </div>

            <!-- Grid Item 3 -->
            <div class="group">
              <div class="mb-6 opacity-50 group-hover:opacity-100 transition-opacity">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3 class="text-xl font-medium mb-4">Global Reach</h3>
              <p class="text-gray-400 font-mono text-sm leading-relaxed">
                Connecting with developers worldwide, sharing insights, and building a global network of peers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Testimonials Section -->
    <section class="py-24 bg-[#F3F3F3] border-b border-black/10">
      <div class="container mx-auto px-6">
        <div class="flex items-center gap-2 mb-16">
          <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
          <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">TESTIMONIALS</span>
        </div>

        <div class="bg-white border border-black/10 p-8 md:p-16 relative overflow-hidden group hover:border-black transition-colors">
          <!-- Decoration -->
          <div class="absolute top-0 left-0 w-2 h-full bg-black/5 group-hover:bg-[#FF4F4F] transition-colors"></div>
          
          <blockquote class="text-2xl md:text-4xl font-medium leading-tight mb-12 relative z-10">
            "The best way to write code all day is by doing it! Evolve with innovation."
          </blockquote>

          <div class="flex items-center gap-4">
            <div class="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border border-black/10">
               <img src="https://res.cloudinary.com/ddszyeplg/image/upload/v1656478354/IMG_1412_orxemy.jpg" alt="Vantol Bennett" class="w-full h-full object-cover grayscale" />
            </div>
            <div>
              <div class="font-bold text-sm uppercase tracking-wider">Vantol Bennett</div>
              <div class="font-mono text-xs text-gray-500 uppercase mt-1">Founder, Zhyjenae</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 bg-white">
      <div class="container mx-auto px-6">
        <div class="bg-[#111111] text-white p-8 md:p-16 rounded-lg relative overflow-hidden min-h-[500px] flex flex-col justify-between group">
          
          <!-- Top Labels -->
          <div class="flex justify-between items-start z-10">
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
              <span class="text-xs font-medium tracking-widest text-gray-400 uppercase">BUILD WITH US</span>
            </div>
            <span class="text-xs font-mono text-gray-400 uppercase tracking-widest">START BUILDING</span>
          </div>

          <!-- Content -->
          <div class="z-10 mt-auto">
            <div class="mb-8">
               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" class="text-white mb-6">
                 <circle cx="12" cy="12" r="10" />
                 <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                 <path d="M2 12h20" />
               </svg>
               <h2 class="text-4xl md:text-6xl font-medium tracking-tight leading-tight mb-2">
                 Ready to build<br>the software of<br>the future?
               </h2>
            </div>
            
            <NuxtLink to="/contact" class="inline-flex items-center gap-2 bg-white text-black px-6 py-3 text-sm font-bold uppercase tracking-widest hover:bg-gray-200 transition-colors">
              Start Building 
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </NuxtLink>
          </div>

          <!-- Background Decoration -->
          <div class="absolute inset-0 z-0 opacity-20 pointer-events-none">
             <div class="absolute right-0 bottom-0 w-96 h-96 bg-linear-to-t from-[#222] to-transparent rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>

    <!-- Projects Section -->
    <section class="py-24 bg-white">
      <div class="container mx-auto px-6">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
                <div class="flex items-center gap-2 mb-4">
                <span class="w-2 h-2 bg-[#FF4F4F] rounded-full"></span>
                <span class="text-xs font-medium tracking-widest text-gray-500 uppercase">LATEST WORK</span>
                </div>
                <h2 class="text-3xl md:text-4xl font-medium tracking-tight">Projects</h2>
            </div>
            <p class="text-gray-500 font-light max-w-md text-sm md:text-base">
                Various Framework including React.js, Nuxt.js, & Vue.js
            </p>
        </div>
        
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ProjectCard v-for="project in projects" :key="project._path" :item="project" />
        </div>
      </div>
    </section>
  </div>
</template>
