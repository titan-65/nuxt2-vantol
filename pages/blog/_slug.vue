<script>
export default {
  async asyncData({ $content, params }) {
    const post = await $content('posts', params.slug).fetch()

    const [prev, next] = await $content('posts')
      .only(['title', 'slug'])
      .sortBy('createdAt', 'asc')
      .surround(params.slug)
      .fetch()
    return {
      post,
      prev,
      next,
    }
  },

  methods: {
    formatDate(date) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' }
      return new Date(date).toLocaleDateString('en', options)
    },
  },
}
</script>
<template>
  <div>
    <div class="lg:flex d-container">
      <aside class="fixed z-50 lg:z-0 lg:static">
        <div
          class="h-full overflow-auto pointer-events-none lg:overflow-visible"
        >
          <div
            class="hidden lg:block fixed top-0 left-0 overflow-auto pointer-events-auto min-h-fill-available h-screen sticky top-header w-60"
          >
            <div class="w-auto h-full overflow-auto">
              <nav
                class="flex flex-col justify-start max-w-sm overflow-y-auto text-sm font-medium lg:h-[reset] h-(full-header) d-scrollbar py-4 px-4 sm:px-6 lg:pr-0 lg:pt-8"
              >
                <ul>
                  <li v-for="link of post.toc" :key="link.id">
                    <NuxtLink
                      :to="`#${link.id}`"
                      class="block w-full nuxt-link-exact-active nuxt-link-active d-active-aside-navigation-item-text"
                      :class="{
                        'py-2': link.depth === 2,
                        'ml-2 pb-2': link.depth === 3,
                      }"
                      >{{ link.text }}</NuxtLink
                    >
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </aside>
      <div
        class="flex-auto w-full min-w-0 lg:static lg:max-h-full lg:overflow-visible"
      >
        <div class="flex flex-col w-full pt-0 xl:flex-row xl:pt-10">
          <article class="mt-10 flex-auto order-last min-w-0 mt-0 xl:order-first xl:mt-0">
            <div
              class="mb-4 md:mb-0 w-full max-w-screen-md mx-auto relative"
              style="height: 24em"
            >
              <div
                class="absolute left-0 bottom-0 w-full h-full z-10"
                style="
                  background-image: linear-gradient(
                    180deg,
                    transparent,
                    rgba(0, 0, 0, 0.7)
                  );
                "
              ></div>
              <img
                :src="post.img"
                class="absolute left-0 top-0 w-full h-full z-0 object-cover"
              />
              <div class="p-4 absolute bottom-0 left-0 z-20">
                <a
                  href="#"
                  class="px-4 py-1 bg-black text-gray-200 inline-flex items-center justify-center mb-2"
                  >{{ post.tag }}</a
                >
                <h2 class="text-4xl font-semibold text-gray-100 leading-tight">
                  {{ post.title }}
                </h2>
                <div class="flex mt-3">
                  <img
                    :src="post.img"
                    class="h-10 w-10 rounded-full mr-2 object-cover"
                  />
                  <div>
                    <p class="font-semibold text-gray-200 text-sm">
                      {{ post.author.name }}
                    </p>
                    <p class="font-semibold text-gray-400 text-xs">
                      {{ formatDate(post.createdAt) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div
              class="px-4 lg:px-0 mt-12 text-gray-700 max-w-screen-md mx-auto text-lg leading-relaxed"
            >
              <nuxt-content :document="post" />
            </div>
             <div class="flex flex-col justify-between d-secondary-text mt-8 mb-4 px-4 sm:px-6 sm:flex-row">
            <div class="flex items-center mb-2 text-sm sm:mb-0 hover:underline">
              <author :author="post.author" />
            </div>
            <div class="flex items-center text-sm">
              <prev-next :prev="prev" :next="next" />
            </div>
          </div>
          </article>

        </div>
      </div>
    </div>
  </div>
</template>
<style>
.nuxt-content h2 {
  font-weight: bold;
  font-size: 28px;
}
.nuxt-content h3 {
  font-weight: bold;
  font-size: 22px;
}
.nuxt-content p {
  margin-bottom: 20px;
}
.nuxt-content-highlight {
  @apply relative;
}
.nuxt-content-highlight .filename {
  @apply absolute right-0 text-gray-600 font-light z-10 mr-2 mt-1 text-sm;
}
</style>
