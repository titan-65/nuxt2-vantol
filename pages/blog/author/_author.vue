<script>
export default {
  async asyncData({ $content, params }) {
    const articles = await $content('posts', params.slug)
      .where({
        'author.name': {
          $regex: [params.author, 'i'],
        },
      })
      .without('body')
      .sortBy('createdAt', 'asc')
      .fetch()

    return {
      articles,
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
    <h1>Author: {{ posts[0].author.name }}</h1>
    <p>Bio: {{ articles[0].author.bio }}</p>
    <h3>Here are a list of posts by {{ post[0].author.name }}:</h3>
    <ul>
      <li v-for="post in posts" :key="post.slug">
        <NuxtLink :to="{ name: 'blog-slug', params: { slug: post.slug } }">
          <img :src="post.img" :alt="post.alt" />
          <div>
            <h2>{{ post.title }}</h2>
            <p>{{ post.author }}</p>
            <p>{{ formatDate(post.updatedAt) }}</p>
          </div>
        </NuxtLink>
      </li>
    </ul>
  </div>
</template>
