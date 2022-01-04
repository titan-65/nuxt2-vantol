<script>
export default {
  name: 'PostCardLong',
  props: {
    item: {
      type: Object,
      required: true,
    },
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
  <div class="mt-6">
                    <div class="max-w-4xl px-10 py-6 mx-auto bg-white rounded-lg shadow-md">
                        <div class="flex items-center justify-between"><span class="font-light text-gray-600">{{ formatDate(item.createdAt) }}</span><a href="#"
                                class="px-2 py-1 font-bold text-gray-100 bg-gray-600 rounded hover:bg-gray-500">{{ item.tag }}</a>
                        </div>
                        <div class="mt-2">
                          <NuxtLink :to="{ name: 'blog-slug', params: { slug: item.slug}}" class="text-2xl font-bold text-gray-700 hover:underline">{{ item.title }}</NuxtLink>
                            <p class="mt-2 text-gray-600">{{ item.description }}</p>
                        </div>
                        <div class="flex items-center justify-between mt-4"><NuxtLink :to="{ name: 'blog-slug', params: { slug: item.slug}}"
                                class="text-blue-500 hover:underline">Read More</NuxtLink>
                            <div><a href="#" class="flex items-center"><img
                                        :src="item.author.img"
                                        alt="avatar" class="hidden object-cover w-10 h-10 mx-4 rounded-full sm:block">
                                    <h1 class="font-bold text-gray-700 hover:underline">{{item.author.name}}</h1>
                                </a></div>
                        </div>
                    </div>
                </div>
</template>
