<script>
export default {
  props: {
    author: {
      type: Object,
      required: true
    }
  },
}
</script>
<template>
  <li class="flex items-center"><img
                                    :src="author.img"
                                    alt="avatar" class="object-cover w-10 h-10 mx-4 mt-4 rounded-full">
                                <p><a href="#" class="mx-1 font-bold text-gray-700 hover:underline">{{ author.name }}</a><span
                                        class="text-sm font-light text-gray-700">Created 23 Posts</span></p>
                            </li>
</template>
