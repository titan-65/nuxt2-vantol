<script setup lang="ts">
import { computed } from "vue";
import { Link } from "@void/vue";
import CartButton from "./CartButton.vue";
import CartDrawer from "./CartDrawer.vue";
import CookieArt from "./CookieArt.vue";
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
    flavors?: Flavor[];
  }>(),
  {
    stage: CURRENT_STAGE,
    embed: false,
    week: null,
    flavors: () => [],
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

const displayStage = computed(() =>
  Math.min(Math.max(Number(props.stage) || CURRENT_STAGE, 1), STAGE_COUNT),
);

const nextStage = computed(() => STAGES[displayStage.value]);

const lessonUrl = computed(
  () => `${blogUrl}/learn/void/${LESSON_SLUGS[displayStage.value - 1]}`,
);

const stageNote = computed(() => {
  if (displayStage.value >= 8) return "the final storefront is live.";
  if (displayStage.value >= 7) return "admin and auth are live.";
  if (displayStage.value >= 6) return "order status and the queue are live.";
  if (displayStage.value >= 5) return "pickup and checkout are live.";
  if (displayStage.value >= 4) return "the box builder and cart are live.";
  if (displayStage.value >= 3) return "the storefront and box sizes are live.";
  return "the weekly menu is live.";
});

const { cart, isOpen, busy, error, openCart, closeCart, setQuantity, remove } = useCart(
  displayStage.value >= 4,
);

const cardComponent = computed(() => (displayStage.value >= 3 ? Link : "div"));

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
</script>

<template>
  <div class="jumble" :class="{ embed }">
    <div class="shell">
      <header class="site-header">
        <a class="brand" href="/" aria-label="Jumble Cookies home">
          Jumble<span class="brand-dot" aria-hidden="true" />
        </a>

        <nav class="site-nav" aria-label="Jumble">
          <a href="#menu">Menu</a>
          <a :href="`${blogUrl}/learn/void`" target="_blank" rel="noopener noreferrer"
            >Read the series</a
          >
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
            :href="`${blogUrl}/learn/void`"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the series ↗
          </a>
        </div>
      </header>

      <main>
        <section id="menu" class="menu-hero">
          <div>
            <h1 class="menu-title">This week at Jumble.</h1>
            <p class="hero-copy">
              Small-batch Jamaican cookies, baked for pickup in Kingston. The menu changes with the
              week, so the good ones do not stay forever.
            </p>
            <p class="week-meta">
              <span v-if="week">{{ week.label }} · {{ weekRange }}</span>
              <span v-else>The next menu drops soon.</span>
            </p>
          </div>
          <div class="menu-stamp" aria-hidden="true">
            <span>{{ pad(displayStage) }}</span>
            <small>weekly menu</small>
          </div>
        </section>

        <div v-if="flavors.length" class="menu-grid">
          <component
            :is="cardComponent"
            v-for="(flavor, index) in flavors"
            :key="flavor.slug"
            :href="displayStage >= 3 ? `/cookies/${flavor.slug}` : undefined"
            class="menu-card"
            :class="{ 'menu-card--link': displayStage >= 3 }"
          >
            <div class="menu-cookie">
              <img
                v-if="flavor.imageKey"
                class="menu-cookie-image"
                :src="`/api/images/${flavor.imageKey}`"
                :alt="`${flavor.name} cookie`"
                loading="lazy"
              />
              <CookieArt
                v-else
                :color="flavor.color"
                :accent="flavor.accent"
                :label="`${flavor.name} cookie`"
              />
            </div>
            <div class="menu-card-body">
              <p class="menu-index">{{ pad(index + 1) }} / {{ pad(flavors.length) }}</p>
              <h2>{{ flavor.name }}</h2>
              <p class="menu-description">{{ flavor.description }}</p>
              <div class="menu-card-footer">
                <span class="price">{{ price(flavor.priceCents) }}</span>
                <span class="box-note">
                  {{ displayStage >= 3 ? "View cookie →" : "Box builder in stage 4" }}
                </span>
              </div>
            </div>
          </component>
        </div>

        <div v-else class="menu-empty">
          <p>No active menu yet. Seed the menu and check back.</p>
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
