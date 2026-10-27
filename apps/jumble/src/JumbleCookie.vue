<script setup lang="ts">
import { computed, ref } from "vue";
import { Link } from "@void/vue";
import CartButton from "./CartButton.vue";
import CartDrawer from "./CartDrawer.vue";
import CookieArt from "./CookieArt.vue";
import { BOX_SIZES, type BoxSize } from "./boxes";
import { CURRENT_STAGE, STAGES, STAGE_COUNT } from "./stages";
import { useCart } from "./useCart";
import "./style.css";

type Week = {
  id: number;
  label: string;
  startsOn: string;
  endsOn: string;
};

type Flavor = {
  id: number;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  color: string;
  accent: string;
  imageKey: string | null;
};

const props = withDefaults(
  defineProps<{
    stage?: number;
    embed?: boolean;
    week?: Week | null;
    flavor?: Flavor | null;
    boxes?: BoxSize[];
    backHref?: string;
  }>(),
  {
    stage: CURRENT_STAGE,
    embed: false,
    week: null,
    flavor: null,
    boxes: () => BOX_SIZES,
    backHref: "/menu",
  },
);

const blogUrl = "https://vantolbennett.vercel.app";
const LESSON_SLUGS = [
  "01-the-jumble-foundation",
  "02-the-weekly-menu",
  "03-the-storefront",
  "04-box-and-cart",
  "05-pickup-and-checkout",
  "06-order-status",
  "07-admin-and-auth",
  "08-ship",
];
const seriesUrl = `${blogUrl}/learn/void`;

const displayStage = computed(() =>
  Math.min(Math.max(Number(props.stage) || CURRENT_STAGE, 1), STAGE_COUNT),
);

const lessonUrl = computed(
  () => `${blogUrl}/learn/void/${LESSON_SLUGS[displayStage.value - 1]}`,
);

const stageNote = computed(() => {
  if (displayStage.value >= 8) return "the full storefront is live.";
  if (displayStage.value >= 7) return "admin and auth are live.";
  if (displayStage.value >= 6) return "order status and the queue are live.";
  if (displayStage.value >= 5) return "pickup and checkout are live.";
  if (displayStage.value >= 4) return "the box builder and cart are live.";
  return "cookie pages and box sizes are live.";
});

const nextStage = computed(() => STAGES[displayStage.value]);

const { cart, isOpen, busy, error, add, openCart, closeCart, setQuantity, remove } = useCart(
  displayStage.value >= 4,
);

const adding = ref(false);
const added = ref(false);

const selectedSize = ref(props.boxes[1]?.size ?? props.boxes[0]?.size ?? 4);

const selectedBox = computed(
  () => props.boxes.find((box) => box.size === selectedSize.value) ?? props.boxes[0] ?? null,
);

const weekRange = computed(() => {
  if (!props.week) return "";
  return `${formatDate(props.week.startsOn)} – ${formatDate(props.week.endsOn)}`;
});

const pad = (n: number) => String(n).padStart(2, "0");
const price = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
  });
}

async function addToBox(): Promise<void> {
  if (!props.flavor || !selectedBox.value || adding.value) return;

  adding.value = true;
  added.value = false;
  const success = await add(props.flavor.slug, selectedBox.value.size);
  adding.value = false;

  if (success) {
    added.value = true;
    openCart();
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
          <CartButton
            v-if="displayStage >= 4"
            :count="cart.boxCount"
            @open="openCart"
          />
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
          <Link :href="backHref">Menu</Link>
          <span aria-hidden="true">/</span>
          <span>{{ flavor?.name || "Cookie" }}</span>
        </nav>

        <div v-if="flavor" class="cookie-layout">
          <div class="cookie-visual">
            <img
              v-if="flavor.imageKey"
              class="cookie-photo"
              :src="`/api/images/${flavor.imageKey}`"
              :alt="`${flavor.name} cookie`"
            />
            <CookieArt
              v-else
              :color="flavor.color"
              :accent="flavor.accent"
              :label="`${flavor.name} cookie`"
            />
          </div>

          <div class="cookie-info">
            <p class="menu-index">
              <span v-if="week">{{ week.label }}<span v-if="weekRange"> · {{ weekRange }}</span></span>
              <span v-else>This week at Jumble</span>
            </p>
            <h1 class="cookie-title">{{ flavor.name }}</h1>
            <p class="cookie-copy">{{ flavor.description }}</p>

            <div class="cookie-price-row">
              <span class="cookie-price">{{ price(flavor.priceCents) }}</span>
              <span class="cookie-unit">each cookie</span>
            </div>

            <fieldset class="box-picker">
              <legend>Choose a box</legend>
              <div class="box-options">
                <button
                  v-for="box in boxes"
                  :key="box.size"
                  type="button"
                  class="box-option"
                  :class="{ 'is-selected': selectedSize === box.size }"
                  :aria-pressed="selectedSize === box.size"
                  @click="selectedSize = box.size"
                >
                  <span class="box-label">{{ box.label }}</span>
                  <span class="box-size">{{ box.size }} cookies</span>
                  <span class="box-price">{{ price(box.priceCents) }}</span>
                </button>
              </div>
            </fieldset>

            <p v-if="selectedBox" class="cookie-selection">
              Selected: {{ selectedBox.label }} · {{ price(selectedBox.priceCents) }}
            </p>

            <div class="cookie-actions">
              <button
                v-if="displayStage >= 4"
                type="button"
                class="btn"
                :disabled="busy || adding || !selectedBox"
                @click="addToBox"
              >
                {{ adding ? "Adding…" : added ? "Added — add another" : "Add to box" }}
              </button>
              <button v-else type="button" class="btn" disabled>Add to box — stage 4</button>
              <span class="cookie-note">
                {{
                  displayStage >= 4
                    ? "Packed into a KV cart. Checkout lands next."
                    : "The box builder and cart land in stage 4."
                }}
              </span>
            </div>
          </div>
        </div>

        <div v-else class="menu-empty">
          <p>This cookie is not on the menu this week.</p>
          <Link :href="backHref" class="menu-footnote-link">Back to the menu →</Link>
        </div>

        <div class="menu-footnote">
          <p>
            <strong>Stage {{ pad(displayStage) }} of {{ pad(STAGE_COUNT) }}:</strong>
            {{ stageNote }}
            {{ nextStage ? `${nextStage.title} arrives next.` : "" }}
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

    <CartDrawer
      v-if="displayStage >= 4"
      :open="isOpen"
      :cart="cart"
      :busy="busy"
      :error="error"
      :checkout-enabled="displayStage >= 5"
      @close="closeCart"
      @update="setQuantity"
      @remove="remove"
    />
  </div>
</template>
