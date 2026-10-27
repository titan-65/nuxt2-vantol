<script setup lang="ts">
const email = ref("");
const status = ref<"idle" | "loading" | "success" | "error">("idle");
const message = ref("");

const { subscribe: subscribeToNewsletter } = useNewsletter();

const handleSubscribe = async () => {
  if (!email.value || !email.value.includes("@")) {
    status.value = "error";
    message.value = "Enter a valid email address.";
    return;
  }

  status.value = "loading";

  const result = await subscribeToNewsletter(email.value, "blog");

  if (result.success) {
    status.value = "success";
    message.value = result.message;
    email.value = "";
  } else {
    status.value = "error";
    message.value = result.message;
  }

  setTimeout(() => {
    status.value = "idle";
    message.value = "";
  }, 4000);
};
</script>

<template>
  <div class="card grid gap-8 p-6 md:p-10 lg:grid-cols-[1fr_1fr] lg:items-end">
    <div>
      <p class="label">Letters from the field</p>
      <h2 class="mt-3 max-w-[18ch] text-[clamp(1.8rem,3vw,2.4rem)] font-medium leading-[1.1] tracking-[-0.045em]">
        The next essay, in your inbox.
      </h2>
      <p class="mt-3 max-w-md text-[15px] leading-relaxed text-muted-foreground">
        New essays and build notes, sent when there is something worth saying. No feed, no noise.
      </p>
    </div>

    <form class="w-full" @submit.prevent="handleSubscribe">
      <label for="newsletter-email" class="sr-only">Email address</label>
      <div class="flex gap-2">
        <input
          id="newsletter-email"
          v-model="email"
          type="email"
          placeholder="you@example.com"
          class="field"
          :disabled="status === 'loading' || status === 'success'"
        />
        <button
          type="submit"
          class="btn btn-primary shrink-0 px-4"
          :disabled="status === 'loading' || status === 'success'"
        >
          <span v-if="status === 'loading'">…</span>
          <span v-else-if="status === 'success'">Sent</span>
          <span v-else>Subscribe</span>
        </button>
      </div>
      <p
        v-if="message"
        class="mt-3 text-[12px]"
        :class="status === 'error' ? 'text-danger' : 'text-success'"
        role="status"
      >
        {{ message }}
      </p>
      <p class="mt-3 font-mono text-[10px] uppercase tracking-[0.08em] text-faint-ink">
        No noise. Unsubscribe any time.
      </p>
    </form>
  </div>
</template>
