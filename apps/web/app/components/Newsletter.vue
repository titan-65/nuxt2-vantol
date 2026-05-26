<script setup lang="ts">
const email = ref('')
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const message = ref('')

const { subscribe: subscribeToNewsletter } = useNewsletter()

const handleSubscribe = async () => {
  if (!email.value || !email.value.includes('@')) {
    status.value = 'error'
    message.value = 'Please enter a valid email address'
    return
  }

  status.value = 'loading'

  const result = await subscribeToNewsletter(email.value, 'blog')

  if (result.success) {
    status.value = 'success'
    message.value = result.message
    email.value = ''
  } else {
    status.value = 'error'
    message.value = result.message
  }

  setTimeout(() => {
    status.value = 'idle'
    message.value = ''
  }, 3000)
}
</script>

<template>
  <div class="border border-white/10 p-6 md:p-8 bg-[#111] rounded-xl">
    <div class="max-w-xl mx-auto text-center">
      <h3 class="text-lg font-semibold mb-2">Stay Updated</h3>
      <p class="text-zinc-500 text-sm mb-6">Get the latest posts delivered straight to your inbox.</p>

      <ClientOnly>
        <form @submit.prevent="handleSubscribe" class="flex flex-col sm:flex-row gap-0 border border-white/10 rounded-lg overflow-hidden p-1 bg-[#0a0a0a] focus-within:border-white/30 transition-colors">
          <input
            v-model="email"
            type="email"
            placeholder="Enter your email"
            class="flex-1 px-4 py-3 bg-transparent text-sm text-white placeholder-zinc-600 focus:outline-none"
            :disabled="status === 'loading' || status === 'success'"
          />
          <button
            type="submit"
            :disabled="status === 'loading' || status === 'success'"
            class="px-6 py-3 bg-[#f5c542] text-black text-xs font-bold uppercase tracking-wider rounded-md hover:bg-[#e0b13a] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="status === 'loading'">...</span>
            <span v-else-if="status === 'success'">Done</span>
            <span v-else>Subscribe</span>
          </button>
        </form>

        <p v-if="status === 'error'" class="mt-3 text-red-400 text-xs">{{ message }}</p>
        <p v-if="status === 'success'" class="mt-3 text-green-400 text-xs">{{ message }}</p>

        <template #fallback>
          <div class="flex flex-col sm:flex-row gap-0 border border-white/10 rounded-lg overflow-hidden p-1 bg-[#0a0a0a]">
            <input
              type="email"
              placeholder="Enter your email"
              class="flex-1 px-4 py-3 bg-transparent text-sm text-white placeholder-zinc-600"
              disabled
            />
            <button
              disabled
              class="px-6 py-3 bg-[#f5c542] text-black text-xs font-bold uppercase rounded-md opacity-70"
            >
              Subscribe
            </button>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
