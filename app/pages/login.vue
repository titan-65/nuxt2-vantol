<script setup lang="ts">
useHead({
  title: 'Login - VantolBennett'
})

definePageMeta({
  layout: 'default'
})

const route = useRoute()
const redirectTo = computed(() => {
  const raw = route.query.redirect
  return typeof raw === 'string' && raw.length ? raw : '/admin'
})

const unauthorized = computed(() => route.query.unauthorized === '1')

const { user, isAdmin, init, signInWithGoogle, signOut } = useFirebaseAuth()

await init()

watchEffect(() => {
  if (user.value && isAdmin.value) {
    navigateTo(redirectTo.value)
  }
})

const handleLogin = async () => {
  await signInWithGoogle()
}

const handleLogout = async () => {
  await signOut()
}
</script>

<template>
  <main class="container mx-auto px-6 py-16">
    <section class="border border-black/10 bg-white p-6 md:p-10 max-w-xl">
      <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500">Authentication</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight">Sign in</h1>

      <p class="mt-3 text-xs font-mono text-gray-600">
        This area is protected. Sign in to access the admin tools.
      </p>

      <p v-if="unauthorized" class="mt-4 text-xs font-mono text-red-700">
        This account is signed in but not authorized for admin access.
      </p>

      <div class="mt-6">
        <button
          v-if="!user"
          type="button"
          class="w-full border border-black/20 bg-black text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors"
          @click="handleLogin"
        >
          Continue with Google
        </button>

        <button
          v-else
          type="button"
          class="w-full border border-black/20 bg-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-black/5 transition-colors"
          @click="handleLogout"
        >
          Sign out
        </button>
      </div>

      <p class="mt-5 text-[11px] font-mono text-gray-500">
        Redirect: {{ redirectTo }}
      </p>
    </section>
  </main>
</template>
