<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { CART_MAX_QUANTITY, type CartView, type CartViewLine } from "./cart";

const props = defineProps<{
  open: boolean;
  cart: CartView;
  busy: boolean;
  error: string;
  checkoutEnabled?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  update: [line: CartViewLine, quantity: number];
  remove: [line: CartViewLine];
}>();

const closeButton = ref<HTMLButtonElement | null>(null);
const drawer = ref<HTMLElement | null>(null);
const mounted = ref(false);
let previousOverflow = "";

const price = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function close(): void {
  emit("close");
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape") {
    close();
    return;
  }

  if (event.key !== "Tab" || !drawer.value) return;

  const focusable = [...drawer.value.querySelectorAll<HTMLElement>(
    'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )];

  if (focusable.length === 0) {
    event.preventDefault();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (!drawer.value.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

watch(
  () => props.open,
  async (open) => {
    if (typeof document === "undefined") return;

    if (open) {
      previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      document.addEventListener("keydown", onKeydown);
      await nextTick();
      closeButton.value?.focus();
    } else {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeydown);
    }
  },
);

onMounted(() => {
  mounted.value = true;
});

onBeforeUnmount(() => {
  if (typeof document === "undefined") return;
  document.body.style.overflow = previousOverflow;
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <Teleport v-if="mounted" to="body">
    <div v-if="open" class="cart-layer">
      <button
        type="button"
        class="cart-backdrop"
        tabindex="-1"
        aria-label="Close your box"
        @click="close"
      />

      <aside
        ref="drawer"
        class="cart-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
      >
        <header class="cart-head">
          <div>
            <p class="cart-kicker">Jumble · Kingston</p>
            <h2 id="cart-title">Your box</h2>
          </div>
          <button
            ref="closeButton"
            type="button"
            class="cart-close"
            aria-label="Close your box"
            @click="close"
          >
            ×
          </button>
        </header>

        <p v-if="error" class="cart-error" role="alert">{{ error }}</p>

        <div v-if="!cart.lines.length" class="cart-empty">
          <p>Your box is empty.</p>
          <p class="cart-empty-copy">Pick a cookie, choose a box, and it will wait here.</p>
          <button type="button" class="btn btn-ghost" @click="close">Keep browsing</button>
        </div>

        <div v-else class="cart-lines">
          <article v-for="line in cart.lines" :key="line.key" class="cart-line">
            <span
              class="cart-swatch"
              :style="{ background: line.color, borderColor: line.accent }"
              aria-hidden="true"
            />

            <div class="cart-line-info">
              <h3>{{ line.name }}</h3>
              <p>{{ line.boxLabel }} · {{ line.size }} cookies</p>
              <button
                type="button"
                class="cart-remove"
                :disabled="busy"
                @click="emit('remove', line)"
              >
                Remove
              </button>
            </div>

            <div class="cart-line-side">
              <p class="cart-line-price">{{ price(line.lineTotalCents) }}</p>
              <div class="cart-qty" aria-label="Box quantity">
                <button
                  type="button"
                  :disabled="busy || line.quantity <= 1"
                  :aria-label="`Decrease ${line.name} ${line.boxLabel}`"
                  @click="emit('update', line, line.quantity - 1)"
                >
                  −
                </button>
                <span>{{ line.quantity }}</span>
                <button
                  type="button"
                  :disabled="busy || line.quantity >= CART_MAX_QUANTITY"
                  :aria-label="`Increase ${line.name} ${line.boxLabel}`"
                  @click="emit('update', line, line.quantity + 1)"
                >
                  +
                </button>
              </div>
            </div>
          </article>
        </div>

        <footer v-if="cart.lines.length" class="cart-foot">
          <div class="cart-total-row">
            <span>Subtotal</span>
            <strong>{{ price(cart.subtotalCents) }}</strong>
          </div>
          <p class="cart-meta">
            {{ cart.boxCount }} {{ cart.boxCount === 1 ? "box" : "boxes" }} · {{ cart.cookieCount }}
            {{ cart.cookieCount === 1 ? "cookie" : "cookies" }}
          </p>
          <a v-if="checkoutEnabled" href="/checkout" class="btn cart-checkout">Checkout</a>
          <button v-else type="button" class="btn cart-checkout" disabled>Checkout — stage 5</button>
          <p class="cart-note">
            {{ checkoutEnabled ? "Pickup only · pay at pickup." : "Pickup only · checkout lands in stage 5." }}
          </p>
        </footer>
      </aside>
    </div>
  </Teleport>
</template>
