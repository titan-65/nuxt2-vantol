<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { CART_HEADER } from "./cart";
import {
  PICKUP_WINDOWS,
  pickupDateOptions,
  type PickupLocationView,
  type PickupWindow,
} from "./pickup";
import { CURRENT_STAGE, STAGES, STAGE_COUNT } from "./stages";
import { useCart } from "./useCart";
import "./style.css";

const props = withDefaults(
  defineProps<{
    stage?: number;
    embed?: boolean;
    locations?: PickupLocationView[];
    cartToken?: string | null;
    backHref?: string;
  }>(),
  {
    stage: CURRENT_STAGE,
    embed: false,
    locations: () => [],
    cartToken: null,
    backHref: "/menu",
  },
);

const blogUrl = "https://vantolbennett.vercel.app";
const seriesUrl = `${blogUrl}/learn/void`;
const lessonUrl = `${blogUrl}/learn/void/05-pickup-and-checkout`;

const displayStage = computed(() =>
  Math.min(Math.max(Number(props.stage) || CURRENT_STAGE, 1), STAGE_COUNT),
);

const nextStage = computed(() => STAGES[displayStage.value]);

const { cart, sessionToken, error: cartError } = useCart(
  displayStage.value >= 5,
  props.cartToken,
);

const dateOptions = pickupDateOptions();

const form = reactive({
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  locationSlug: props.locations[0]?.slug ?? "",
  pickupDate: dateOptions[0]?.value ?? "",
  pickupWindow: PICKUP_WINDOWS[0] as PickupWindow,
  notes: "",
});

const submitting = ref(false);
const formError = ref("");

const selectedLocation = computed(
  () => props.locations.find((location) => location.slug === form.locationSlug) ?? null,
);

const canSubmit = computed(
  () =>
    Boolean(cart.value.lines.length) &&
    Boolean(sessionToken.value) &&
    Boolean(form.customerName.trim()) &&
    Boolean(form.customerEmail.trim()) &&
    Boolean(form.customerPhone.trim()) &&
    Boolean(form.locationSlug) &&
    Boolean(form.pickupDate) &&
    Boolean(form.pickupWindow) &&
    !submitting.value,
);

const pad = (n: number) => String(n).padStart(2, "0");
const price = (cents: number) => `$${(cents / 100).toFixed(2)}`;

async function submit(): Promise<void> {
  if (!canSubmit.value) return;

  submitting.value = true;
  formError.value = "";

  try {
    const response = await fetch("/api/checkout", {
      method: "POST",
      credentials: "same-origin",
      headers: {
        "content-type": "application/json",
        [CART_HEADER]: sessionToken.value,
      },
      body: JSON.stringify(form),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      formError.value =
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof payload.error === "string"
          ? payload.error
          : "Could not place the order.";
      return;
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      !("order" in payload) ||
      !payload.order ||
      typeof payload.order !== "object" ||
      !("publicId" in payload.order) ||
      typeof payload.order.publicId !== "string"
    ) {
      formError.value = "The order returned an unexpected response.";
      return;
    }

    window.location.assign(`/orders/${payload.order.publicId}`);
  } catch {
    formError.value = "Could not place the order. Check your connection and try again.";
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="jumble" :class="{ embed }">
    <div class="shell">
      <header class="site-header">
        <a class="brand" href="/" aria-label="Jumble Cookies home">
          Jumble<span class="brand-dot" aria-hidden="true" />
        </a>

        <nav class="site-nav" aria-label="Jumble">
          <a href="/menu">Menu</a>
          <a :href="seriesUrl" target="_blank" rel="noopener noreferrer">Read the series</a>
        </nav>

        <div class="header-right">
          <span class="stage-pill">Stage {{ pad(displayStage) }} / {{ pad(STAGE_COUNT) }}</span>
          <a
            class="header-link"
            :href="seriesUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the series ↗
          </a>
        </div>
      </header>

      <main>
        <nav class="crumbs" aria-label="Breadcrumb">
          <a :href="backHref">Back to the box</a>
          <span aria-hidden="true">/</span>
          <span>Checkout</span>
        </nav>

        <div class="checkout-head">
          <p class="menu-index">Pickup · Kingston</p>
          <h1 class="checkout-title">Checkout.</h1>
          <p class="checkout-copy">
            No delivery, no payment online. Choose a pickup window, leave a name, and pay when you
            collect the box.
          </p>
        </div>

        <div v-if="!cart.lines.length" class="checkout-empty">
          <p>Your box is empty.</p>
          <a class="btn btn-ghost" href="/menu">Choose a box</a>
        </div>

        <div v-else class="checkout-grid">
          <form class="checkout-form" @submit.prevent="submit">
            <fieldset class="checkout-fieldset">
              <legend>01 · Contact</legend>
              <label class="checkout-field">
                <span>Name</span>
                <input
                  v-model="form.customerName"
                  name="name"
                  autocomplete="name"
                  placeholder="Who is picking up?"
                  required
                />
              </label>
              <label class="checkout-field">
                <span>Email</span>
                <input
                  v-model="form.customerEmail"
                  name="email"
                  type="email"
                  autocomplete="email"
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label class="checkout-field">
                <span>Phone</span>
                <input
                  v-model="form.customerPhone"
                  name="phone"
                  type="tel"
                  autocomplete="tel"
                  placeholder="+1 876 …"
                  required
                />
              </label>
            </fieldset>

            <fieldset class="checkout-fieldset">
              <legend>02 · Pickup</legend>
              <label class="checkout-field">
                <span>Location</span>
                <select v-model="form.locationSlug" name="location" required>
                  <option v-for="location in locations" :key="location.slug" :value="location.slug">
                    {{ location.name }}
                  </option>
                </select>
              </label>
              <div v-if="selectedLocation" class="checkout-location">
                <p>{{ selectedLocation.address }}</p>
                <p>{{ selectedLocation.hours }}</p>
              </div>
              <div class="checkout-field-row">
                <label class="checkout-field">
                  <span>Date</span>
                  <select v-model="form.pickupDate" name="date" required>
                    <option v-for="date in dateOptions" :key="date.value" :value="date.value">
                      {{ date.label }}
                    </option>
                  </select>
                </label>
                <label class="checkout-field">
                  <span>Window</span>
                  <select v-model="form.pickupWindow" name="window" required>
                    <option v-for="window in PICKUP_WINDOWS" :key="window" :value="window">
                      {{ window }}
                    </option>
                  </select>
                </label>
              </div>
            </fieldset>

            <fieldset class="checkout-fieldset">
              <legend>03 · Notes</legend>
              <label class="checkout-field">
                <span>Anything we should know?</span>
                <textarea
                  v-model="form.notes"
                  name="notes"
                  rows="3"
                  maxlength="500"
                  placeholder="Allergies, a name on the box, a pickup note…"
                />
              </label>
            </fieldset>

            <p v-if="cartError || formError" class="checkout-error" role="alert">
              {{ formError || cartError }}
            </p>

            <button type="submit" class="btn checkout-submit" :disabled="!canSubmit">
              {{ submitting ? "Placing order…" : `Place pickup order · ${price(cart.subtotalCents)}` }}
            </button>
            <p class="checkout-note">Pay at pickup. You will get an order code on the next screen.</p>
          </form>

          <aside class="checkout-summary" aria-label="Order summary">
            <p class="checkout-kicker">Your box</p>
            <div class="checkout-lines">
              <article v-for="line in cart.lines" :key="line.key" class="checkout-line">
                <span
                  class="cart-swatch"
                  :style="{ background: line.color, borderColor: line.accent }"
                  aria-hidden="true"
                />
                <div>
                  <h2>{{ line.name }}</h2>
                  <p>{{ line.boxLabel }} · {{ line.quantity }} × {{ line.size }} cookies</p>
                </div>
                <span class="checkout-line-price">{{ price(line.lineTotalCents) }}</span>
              </article>
            </div>
            <div class="checkout-total">
              <span>Subtotal</span>
              <strong>{{ price(cart.subtotalCents) }}</strong>
            </div>
            <p class="checkout-summary-note">
              {{ cart.boxCount }} {{ cart.boxCount === 1 ? "box" : "boxes" }} ·
              {{ cart.cookieCount }} {{ cart.cookieCount === 1 ? "cookie" : "cookies" }}
            </p>
            <p class="checkout-summary-note">Pickup only · pay at collection.</p>
          </aside>
        </div>

        <div class="menu-footnote">
          <p>
            <strong>Stage {{ pad(displayStage) }} of {{ pad(STAGE_COUNT) }}:</strong> pickup and
            checkout are live. {{ nextStage ? `${nextStage.title} arrives next.` : "" }}
          </p>
          <a :href="lessonUrl" target="_blank" rel="noopener noreferrer">Read the lesson →</a>
        </div>
      </main>

      <footer class="site-footer">
        <div>
          <span class="brand">Jumble<span class="brand-dot" aria-hidden="true" /></span>
          <p>Kingston, Jamaica · Small-batch cookies</p>
        </div>
        <div class="footer-meta">
          <span>Built on Void</span>
          <span>Stage {{ pad(displayStage) }} / {{ pad(STAGE_COUNT) }}</span>
        </div>
      </footer>
    </div>
  </div>
</template>
