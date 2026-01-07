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
  <div class="border border-black/20 p-6 md:p-8 bg-white">
    <div class="max-w-xl mx-auto text-center">
      <div class="flex items-center justify-center gap-2 mb-4">
        <span class="w-2 h-2 bg-black rounded-full"></span>
        <h3 class="text-lg font-bold uppercase tracking-widest">Stay Updated</h3>
      </div>
      
      <p class="text-gray-600 font-light mb-8">Get the latest posts delivered straight to your inbox.</p>
      
      <ClientOnly>
        <form @submit.prevent="handleSubscribe" class="flex flex-col sm:flex-row gap-0 border border-black/20 p-1">
          <input
            v-model="email"
            type="email"
            placeholder="ENTER YOUR EMAIL"
            class="flex-1 px-4 py-3 bg-transparent text-sm font-mono placeholder-gray-400 focus:outline-none"
            :disabled="status === 'loading' || status === 'success'"
          />
          <button
            type="submit"
            :disabled="status === 'loading' || status === 'success'"
            class="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <span v-if="status === 'loading'">...</span>
            <span v-else-if="status === 'success'">DONE</span>
            <span v-else>SUBSCRIBE</span>
          </button>
        </form>
        
        <p v-if="status === 'error'" class="mt-3 text-red-500 text-xs font-mono uppercase">{{ message }}</p>
        <p v-if="status === 'success'" class="mt-3 text-green-600 text-xs font-mono uppercase">{{ message }}</p>
        
        <template #fallback>
          <div class="flex flex-col sm:flex-row gap-0 border border-black/20 p-1">
            <input
              type="email"
              placeholder="ENTER YOUR EMAIL"
              class="flex-1 px-4 py-3 bg-transparent text-sm font-mono placeholder-gray-400 focus:outline-none"
              disabled
            />
            <button
              disabled
              class="px-6 py-3 bg-black text-white text-xs font-bold uppercase tracking-widest opacity-70"
            >
              SUBSCRIBE
            </button>
          </div>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>
