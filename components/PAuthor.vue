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
                                    src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=crop&amp;w=731&amp;q=80"
                                    alt="avatar" class="object-cover w-10 h-10 mx-4 rounded-full">
                                <p><a href="#" class="mx-1 font-bold text-gray-700 hover:underline">{{ author.name }}</a><span
                                        class="text-sm font-light text-gray-700">Created 23 Posts</span></p>
                            </li>
</template>
