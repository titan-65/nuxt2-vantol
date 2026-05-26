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
  <main class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <div class="max-w-xl mx-auto px-6 py-16">
      <section class="border border-white/10 bg-[#111] rounded-xl p-6 md:p-10">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Authentication</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight">Sign in</h1>

        <p class="mt-3 text-xs text-zinc-400">
          This area is protected. Sign in to access the admin tools.
        </p>

        <p v-if="unauthorized" class="mt-4 text-xs text-red-400">
          This account is signed in but not authorized for admin access.
        </p>

        <div class="mt-6">
          <button
            v-if="!user"
            type="button"
            class="w-full bg-[#f5c542] text-black px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-[#e0b13a] transition-colors rounded-lg"
            @click="handleLogin"
          >
            Continue with Google
          </button>

          <button
            v-else
            type="button"
            class="w-full border border-white/10 bg-transparent text-white px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors rounded-lg"
            @click="handleLogout"
          >
            Sign out
          </button>
        </div>

        <p class="mt-5 text-[11px] text-zinc-600">
          Redirect: {{ redirectTo }}
        </p>
      </section>
    </div>
  </main>
</template>
