<script setup lang="ts">
import { authClient } from "../../utils/auth-client";

useHead({ title: "Login - VantolBennett" });
definePageMeta({ layout: "default" });

const route = useRoute();
const redirectTo = computed(() => {
  const raw = route.query.redirect;
  return typeof raw === "string" && raw.startsWith("/") ? raw : "/";
});
const unauthorized = computed(() => route.query.unauthorized === "1");
const { data: session } = await authClient.useSession(useFetch);
const user = computed(() => session.value?.user ?? null);

function handleLogin() {
  return authClient.signIn.social({
    provider: "github",
    callbackURL: redirectTo.value,
  });
}

async function handleLogout() {
  await authClient.signOut();
}
</script>

<template>
  <main class="min-h-screen bg-background text-foreground font-sans">
    <div class="max-w-xl mx-auto px-6 py-16">
      <section class="border border-border bg-card rounded-xl p-6 md:p-10">
        <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Authentication</p>
        <h1 class="mt-2 text-3xl font-semibold tracking-tight">Sign in</h1>
        <p class="mt-3 text-xs text-muted-foreground">
          Sign in with GitHub to personalize your experience across the blog.
        </p>

        <p v-if="unauthorized" class="mt-4 text-xs text-danger">
          This GitHub account is signed in but not authorized for admin access.
        </p>

        <div v-if="user" class="mt-6 flex items-center gap-3">
          <img
            v-if="user.image"
            :src="user.image"
            :alt="user.name"
            class="size-10 rounded-full object-cover"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-semibold">{{ user.name }}</p>
            <p class="truncate text-xs text-muted-foreground">{{ user.email }}</p>
          </div>
        </div>

        <div class="mt-6 space-y-3">
          <button
            v-if="!user"
            type="button"
            class="w-full bg-brand text-brand-foreground px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-hover transition-colors rounded-lg"
            @click="handleLogin"
          >
            Continue with GitHub
          </button>

          <template v-else>
            <NuxtLink
              :to="redirectTo"
              class="block w-full bg-brand text-center text-brand-foreground px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-brand-hover transition-colors rounded-lg"
            >
              Continue
            </NuxtLink>
            <button
              type="button"
              class="w-full border border-border px-4 py-3 text-xs font-bold uppercase tracking-widest hover:bg-accent transition-colors rounded-lg"
              @click="handleLogout"
            >
              Sign out
            </button>
          </template>
        </div>
      </section>
    </div>
  </main>
</template>
