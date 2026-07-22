<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef, watch } from "vue";
import { usePresenceWall } from "../composables/usePresenceWall";
import type { PresenceSignature } from "../server/storage";

const props = defineProps<{
  open?: boolean;
  pageKey?: string;
  renderHint?: "default" | "compact" | "signature";
}>();
const emit = defineEmits<{ (e: "update:open", value: boolean): void }>();

const wall = usePresenceWall();

watch(
  () => props.open,
  (open) => {
    if (typeof open === "boolean") wall.isOpen.value = open;
  },
  { immediate: true },
);

const isVisible = computed(() => props.open || wall.isOpen.value);

// ponytail: the SSR boolean arrives in payload at hydration time. Read it on
// `window.__PRESENCE_ADMIN__`, which the client plugin sets at startup.
const isAdmin = computed(
  () =>
    typeof window !== "undefined" &&
    (window as { __PRESENCE_ADMIN__?: boolean }).__PRESENCE_ADMIN__ === true,
);

const activeTab = ref<"wall" | "admin">("wall");

const draft = ref("");
const inputRef = useTemplateRef<HTMLInputElement>("input");
const submitting = ref(false);
const errorMessage = ref<string | null>(null);

const MAX_BODY = 240;
const SIGNATURES_LIMIT = 50;

async function submit() {
  const body = draft.value.trim();
  if (!body || submitting.value) return;
  submitting.value = true;
  errorMessage.value = null;
  try {
    await wall.add({
      body,
      ...(props.pageKey ? { pageKey: props.pageKey } : {}),
      ...(props.renderHint ? { renderHint: props.renderHint } : {}),
    });
    draft.value = "";
  } catch (err) {
    errorMessage.value = err instanceof Error ? err.message : "unknown";
  } finally {
    submitting.value = false;
    await nextTick();
    inputRef.value?.focus();
  }
}

function close() {
  wall.close();
  emit("update:open", false);
}

function cardAge(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

async function adminAction(action: "pin" | "unpin" | "approve" | "delete", sig: PresenceSignature) {
  // ponytail: a single sessionStorage-backed token keeps the admin UX free of
  // pasting-the-secret-each-time. Not for hardening — the server still enforces.
  const token =
    window.sessionStorage.getItem("presence-admin-token") ?? window.prompt("Admin token?") ?? "";
  if (!token) return;
  window.sessionStorage.setItem("presence-admin-token", token);

  await fetch(`/api/_presence/admin/${action}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-presence-admin": token,
    },
    body: JSON.stringify({
      id: sig.id,
      ...(action === "pin" ? { pinRank: 0 } : {}),
      ...(props.pageKey ? { pageKey: props.pageKey } : {}),
    }),
  });
  // Re-pull the list on next tick.
  setTimeout(() => location.reload(), 250);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== "Escape" || !isVisible.value) return;
  close();
}

onMounted(() => window.addEventListener("keydown", onKeydown));
onUnmounted(() => window.removeEventListener("keydown", onKeydown));

const visible = computed(() => {
  // ponytail: client sees no pending unless admin.
  const items = isAdmin.value
    ? wall.signatures.value
    : wall.signatures.value.filter((s) => s.state !== "pending");
  return items.slice(0, SIGNATURES_LIMIT);
});
</script>

<template>
  <div
    v-if="isVisible"
    data-presence-wall
    class="presence-wall"
    role="dialog"
    aria-label="Presence wall"
  >
    <header class="presence-wall__header">
      <nav v-if="isAdmin" class="presence-wall__tabs" aria-label="Wall sections">
        <button
          type="button"
          data-presence-tab="wall"
          :aria-pressed="activeTab === 'wall'"
          class="presence-wall__tab"
          @click="activeTab = 'wall'"
        >
          Wall
        </button>
        <button
          type="button"
          data-presence-tab="admin"
          :aria-pressed="activeTab === 'admin'"
          class="presence-wall__tab"
          @click="activeTab = 'admin'"
        >
          Admin
        </button>
      </nav>
      <button
        type="button"
        data-presence-close
        class="presence-wall__close"
        aria-label="Close"
        @click="close"
      >
        ×
      </button>
    </header>

    <ul class="presence-wall__list" data-presence-list>
      <li v-for="sig in visible" :key="sig.id" class="presence-card" :data-state="sig.state">
        <img
          v-if="sig.author.avatarUrl"
          :src="sig.author.avatarUrl"
          :alt="sig.author.handle"
          class="presence-card__avatar"
        />
        <div
          v-else
          class="presence-card__avatar presence-card__avatar--fallback"
          aria-hidden="true"
        >
          {{ sig.author.handle.charAt(0).toUpperCase() }}
        </div>
        <div class="presence-card__body">
          <div class="presence-card__head">
            <span class="presence-card__handle">{{ sig.author.handle }}</span>
            <span v-if="isAdmin" class="presence-card__state" :data-state="sig.state">{{
              sig.state
            }}</span>
            <span class="presence-card__time">{{ cardAge(sig.createdAt) }}</span>
          </div>
          <div class="presence-card__text">{{ sig.body }}</div>
          <div v-if="isAdmin && activeTab === 'admin'" class="presence-card__actions">
            <button v-if="sig.state !== 'pinned'" type="button" @click="adminAction('pin', sig)">
              Pin
            </button>
            <button v-if="sig.state === 'pinned'" type="button" @click="adminAction('unpin', sig)">
              Unpin
            </button>
            <button
              v-if="sig.state === 'pending'"
              type="button"
              @click="adminAction('approve', sig)"
            >
              Approve
            </button>
            <button type="button" @click="adminAction('delete', sig)">Delete</button>
          </div>
        </div>
      </li>
    </ul>

    <form
      v-if="!isAdmin || activeTab === 'wall'"
      data-presence-form
      class="presence-wall__form"
      @submit.prevent="submit"
    >
      <input
        ref="input"
        v-model="draft"
        :maxlength="MAX_BODY"
        placeholder="leave a mark…"
        aria-label="Your signature"
        :disabled="submitting"
      />
      <button type="submit" :disabled="submitting || draft.trim().length === 0">sign</button>
      <p v-if="errorMessage" class="presence-wall__error">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<style scoped>
.presence-wall {
  position: fixed;
  inset: 0;
  background: rgba(10, 10, 10, 0.92);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  color: white;
  font-family: inherit;
}
.presence-wall__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
}
.presence-wall__tabs {
  display: flex;
  gap: 0.5rem;
}
.presence-wall__tab {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  padding: 0.4rem 0.9rem;
  border-radius: 9999px;
  cursor: pointer;
  font: inherit;
}
.presence-wall__tab[aria-pressed="true"] {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.6);
}
.presence-wall__close {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 1.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  cursor: pointer;
}
.presence-wall__list {
  flex: 1;
  overflow-y: auto;
  margin: 0;
  padding: 0 1.25rem;
  list-style: none;
}
.presence-card {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}
.presence-card[data-state="pinned"] {
  border-left: 2px solid rgba(255, 255, 255, 0.5);
  padding-left: 0.5rem;
}
.presence-card__avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  flex-shrink: 0;
}
.presence-card__avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  font-weight: 600;
}
.presence-card__body {
  flex: 1;
  min-width: 0;
}
.presence-card__head {
  display: flex;
  gap: 0.5rem;
  align-items: baseline;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
}
.presence-card__handle {
  color: white;
  font-weight: 600;
}
.presence-card__state {
  font-size: 0.7rem;
  text-transform: uppercase;
  padding: 0.1rem 0.4rem;
  border: 1px solid currentColor;
  border-radius: 9999px;
}
.presence-card__state[data-state="pending"] {
  color: #fda4af;
}
.presence-card__state[data-state="pinned"] {
  color: #f5c542;
}
.presence-card__time {
  margin-left: auto;
  font-size: 0.75rem;
}
.presence-card__text {
  margin-top: 0.25rem;
  font-size: 0.95rem;
  word-wrap: break-word;
}
.presence-card__actions {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.4rem;
}
.presence-card__actions button {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 9999px;
  cursor: pointer;
}
.presence-wall__form {
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}
.presence-wall__form input {
  flex: 1;
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font: inherit;
  font-size: 0.95rem;
  padding: 0.4rem 0;
  outline: none;
}
.presence-wall__form button {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  font: inherit;
  padding: 0.4rem 1rem;
  border-radius: 9999px;
  cursor: pointer;
}
.presence-wall__form button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.presence-wall__error {
  flex-basis: 100%;
  margin: 0.5rem 0 0;
  font-size: 0.75rem;
  color: #fda4af;
}
</style>
