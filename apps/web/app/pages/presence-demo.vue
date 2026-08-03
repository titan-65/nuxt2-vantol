<script setup lang="ts">
useHead({
  title: "Presence Demo — VantolBennett",
});

const route = useRoute();
const { identity, refresh, signInWithGitHub, signOut } = usePresenceDemoIdentity();

onMounted(() => {
  void refresh();
});

async function startOver() {
  await signOut();
  await refresh();
}

function openWall() {
  const w = window as unknown as { $presence?: { open: () => void } };
  w.$presence?.open();
}

function signSample(text: string) {
  const w = window as unknown as { $presence?: { sign: (t: string) => void } };
  w.$presence?.sign(text);
}
</script>

<template>
  <div class="min-h-screen bg-[#0a0a0a] text-white font-sans">
    <div class="max-w-2xl mx-auto px-6 py-20">
      <!-- Header -->
      <div class="mb-12">
        <p class="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-4">
          nuxt-presence · better-auth
        </p>
        <h1 class="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Presence Demo</h1>
        <p class="text-lg text-zinc-400 font-light">
          A signed guestbook backed by GitHub OAuth. Sign in below to leave a mark with your real
          avatar + handle, then open the wall with the Konami prefix
          <code class="text-[#f5c542]">↑ ↑ ↓ ↓</code> or the button.
        </p>
      </div>

      <!-- Identity card -->
      <div class="bg-[#111] border border-white/10 rounded-xl p-6 mb-8">
        <div v-if="!identity">
          <p class="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Sign in</p>
          <p class="text-sm text-zinc-400 mb-4">
            GitHub provides your avatar and handle. Better Auth stores the session server-side;
            nuxt-presence only receives the identity fields needed to render your card.
          </p>
          <button
            type="button"
            @click="signInWithGitHub(route.fullPath)"
            class="bg-[#f5c542] text-black px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#e0b13a] transition-colors rounded-lg"
          >
            Sign in with GitHub
          </button>
        </div>

        <div v-else>
          <p class="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Signed in</p>
          <div class="flex items-center gap-3 mb-4">
            <img
              :src="identity.avatarUrl"
              :alt="identity.handle"
              class="w-10 h-10 rounded-full border border-white/10 object-cover"
            />
            <div>
              <div class="text-sm font-semibold">
                {{ identity.displayName ?? identity.handle }}
              </div>
              <div class="text-[10px] text-zinc-500">@{{ identity.handle }}</div>
            </div>
          </div>
          <button
            type="button"
            @click="startOver"
            class="text-xs text-zinc-500 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>

      <!-- Wall launcher -->
      <div class="bg-[#111] border border-white/10 rounded-xl p-6 mb-8">
        <p class="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">The wall</p>
        <p class="text-sm text-zinc-400 mb-4">
          Press <code class="text-[#f5c542]">↑ ↑ ↓ ↓</code> anywhere on the page, or use the button.
          Posts you make appear with the GitHub identity above.
        </p>
        <button
          type="button"
          @click="openWall"
          :disabled="!identity"
          class="bg-[#f5c542] text-black px-5 py-2 text-xs font-bold uppercase tracking-widest hover:bg-[#e0b13a] transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-lg"
        >
          Open the wall
        </button>
      </div>

      <!-- Quick sign -->
      <div class="bg-[#111] border border-white/10 rounded-xl p-6">
        <p class="text-[10px] uppercase tracking-widest text-zinc-500 mb-4">Quick sign</p>
        <p class="text-sm text-zinc-400 mb-4">
          Each button posts a sample signature through the wall — visible to anyone else looking at
          the same scope.
        </p>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="sample in ['hello world', 'nice site!', 'leaving a mark', '👋']"
            :key="sample"
            type="button"
            :disabled="!identity"
            class="border border-white/10 px-3 py-1.5 text-xs hover:border-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed rounded-lg"
            @click="signSample(sample)"
          >
            {{ sample }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
