<template>
  <div>
    <div class="py-12 bg-gray-100 md:py-24">
      <div
        class="grid max-w-screen-xl px-6 mx-auto lg:px-8 xl:px-4 md:grid-cols-4 xl:grid-cols-5 gap-x-12 lg:gap-x-20"
      >
        <div class="self-center order-2 col-span-2 mt-12 md:order-1 md:mt-0">
          <h1
            class="mb-2 text-3xl font-bold text-gray-800 md:text-4xl lg:text-5xl md:mb-4 lg:mb-8"
          >
            Vantol R. Bennett
          </h1>
          <p class="mb-6 text-sm text-gray-400 xl:text-xl lg:mb-8 xl:mb-10">
            Jamaican Educator & Developer at (MPS), Founder of Zhyjenae
          </p>
          <h1
            class="mb-2 text-3xl font-bold text-gray-800 md:text-4xl lg:text-5xl md:mb-4 lg:mb-8"
          >
            The best way to write code all day...
          </h1>
          <p class="mb-6 text-lg text-gray-600 xl:text-xl lg:mb-8 xl:mb-10">
            is by doing it! Evolve with innovation
          </p>
        </div>
        <div class="order-1 col-span-2 md:order-2 xl:col-span-3">
          <img
            src="https://res.cloudinary.com/zhyjenae/image/upload/v1640791500/highlights/DSC_0988_bvucoi.jpg"
            class="rounded-lg shadow-2xl"
            alt=""
          />
        </div>
      </div>
    </div>
    <div class="py-12 md:py-24">
      <div class="container px-5 py-24 mx-auto">
        <div class="flex flex-col text-center w-full mb-20">
          <h2 class="text-xs text-indigo-500 font-medium title-font">
            YAARD MAN A DO IT
          </h2>
          <h1 class="sm:text-3x1 text-4x1 mb-4 text-gray-900">
            Featured Posts
          </h1>
        </div>
        <div class="flex flex-wrap">
          <PostCard v-for="item in post" :key="item.slug" :item="item" />
          <!--           <pre>{{ post }}</pre> -->
        </div>
      </div>
    </div>
    <div class="py-12 bg-gray-200 md:py-24">
      <div
        class="max-w-screen-xl px-6 mx-auto mb-12 lg:px-8 xl:px-4 lg:mb-16 xl:mb-24"
      >
        <div class="mb-6 text-center md:mb-8">
          <h2
            class="mb-2 text-3xl font-bold text-gray-800 md:text-4xl lg:text-5xl md:mb-4"
          >
            Projects
          </h2>
          <p class="text-lg text-gray-300 xl:text-xl">
            Various Framework including React.js, Nuxt.js, Vue.js
          </p>
        </div>
      </div>
      <div class="flex flex-wrap">
        <ProjectCard />

      </div>
    </div>
  </div>
</template>

<script>
export default {
  async asyncData({ $content }) {
    const post = await $content('posts')
      .only([
        'title',
        'description',
        'language',
        'tag',
        'rating',
        'readTime',
        'img',
        'author',
        'slug',
      ])
      .fetch()
    return { post }
  },
  methods: {
    handleClick(slug) {
      this.$router.push(`/blog/${slug}`)
    },
  },
}
</script>
