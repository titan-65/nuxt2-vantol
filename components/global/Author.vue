<script>
export default {
  props: {
    author: {
      type: Object,
      required: true,
    },
  },
}
</script>
<template>
  <div>
    <!--     <img :src="author.img" />
    <div>
      <h4>Author</h4>
      <p>{{ author.name }}</p>
      <p>{{ author.website }}</p>
    </div> -->
    <NuxtLink :to="`/blog/author/${author.name}`">
      <img :src="author.img" class="h-32 w-32 bg-white p-2 rounded-full"/>
      <div>
        <h4>Author</h4>
        <p>{{ author.name }}</p>
      </div>
    </NuxtLink>
  </div>
</template>
