<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import {
  isOrderStatus,
  ORDER_FINAL_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderView,
} from "./orders";
import { formatPickupDate } from "./pickup";
import { CURRENT_STAGE, STAGES, STAGE_COUNT } from "./stages";
import "./style.css";

const props = withDefaults(
  defineProps<{
    stage?: number;
    embed?: boolean;
    order: OrderView;
    backHref?: string;
  }>(),
  {
    stage: CURRENT_STAGE,
    embed: false,
    backHref: "/menu",
  },
);

const blogUrl = "https://vantolbennett.vercel.app";
const seriesUrl = `${blogUrl}/learn/void`;
const lessonUrl = `${blogUrl}/learn/void/06-order-status`;

const displayStage = computed(() =>
  Math.min(Math.max(Number(props.stage) || CURRENT_STAGE, 1), STAGE_COUNT),
);

const nextStage = computed(() => STAGES[displayStage.value]);

const current = ref<OrderView>(props.order);
const pollingError = ref("");
let timer: ReturnType<typeof setInterval> | null = null;

const finalStatus = computed(() => ORDER_FINAL_STATUSES.includes(current.value.status));
const statusLabel = computed(() => ORDER_STATUS_LABELS[current.value.status]);

const pad = (n: number) => String(n).padStart(2, "0");
const price = (cents: number) => `$${(cents / 100).toFixed(2)}`;

function isOrderView(value: unknown): value is OrderView {
  if (!value || typeof value !== "object") return false;

  return (
    "publicId" in value &&
    typeof value.publicId === "string" &&
    "status" in value &&
    isOrderStatus(value.status) &&
    "items" in value &&
    Array.isArray(value.items) &&
    "events" in value &&
    Array.isArray(value.events)
  );
}

function stopPolling(): void {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

async function refresh(): Promise<void> {
  try {
    const response = await fetch(`/api/orders/${encodeURIComponent(current.value.publicId)}`, {
      credentials: "same-origin",
      headers: { accept: "application/json" },
    });

    if (!response.ok) return;

    const payload: unknown = await response.json();
    if (!isOrderView(payload)) return;

    current.value = payload;
    pollingError.value = "";

    if (ORDER_FINAL_STATUSES.includes(payload.status)) {
      stopPolling();
    }
  } catch {
    pollingError.value = "Could not refresh the status. We will try again.";
  }
}

onMounted(() => {
  if (displayStage.value >= 6 && !finalStatus.value) {
    timer = setInterval(() => {
      void refresh();
    }, 4000);
  }
});

onBeforeUnmount(stopPolling);

function formatCreatedAt(value: string): string {
  return new Date(value).toLocaleString("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
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
          <a :href="backHref">Menu</a>
          <span aria-hidden="true">/</span>
          <span>{{ current.publicId }}</span>
        </nav>

        <section class="order-head">
          <div>
            <p class="menu-index">Pickup order · {{ current.publicId }}</p>
            <h1 class="order-title">Your box is in the works.</h1>
            <p class="order-copy">
              {{ current.location.name }} · {{ formatPickupDate(current.pickupDate) }} ·
              {{ current.pickupWindow }}
            </p>
          </div>
          <span class="order-status" :class="`order-status--${current.status}`">
            {{ statusLabel }}
          </span>
        </section>

        <div class="order-grid">
          <div class="order-main">
            <section class="order-card">
              <div class="order-card-head">
                <h2>Your order</h2>
                <span>{{ current.items.length }} {{ current.items.length === 1 ? "line" : "lines" }}</span>
              </div>
              <article v-for="item in current.items" :key="item.id" class="order-item">
                <div>
                  <h3>{{ item.flavorName }}</h3>
                  <p>{{ item.boxLabel }} · {{ item.quantity }} × {{ item.boxSize }} cookies</p>
                </div>
                <span>{{ price(item.lineTotalCents) }}</span>
              </article>
              <div class="order-total">
                <span>Subtotal</span>
                <strong>{{ price(current.subtotalCents) }}</strong>
              </div>
              <p class="order-payment">Pay at pickup. No online payment was taken.</p>
            </section>

            <section class="order-card">
              <div class="order-card-head">
                <h2>Pickup</h2>
                <span>{{ current.location.name }}</span>
              </div>
              <div class="order-pickup">
                <p>{{ current.location.address }}</p>
                <p>{{ current.location.hours }}</p>
                <p>
                  <strong>{{ formatPickupDate(current.pickupDate) }}</strong> ·
                  {{ current.pickupWindow }}
                </p>
              </div>
              <div class="order-contact">
                <p><span>Name</span>{{ current.customerName }}</p>
                <p><span>Email</span>{{ current.customerEmail }}</p>
                <p><span>Phone</span>{{ current.customerPhone }}</p>
                <p v-if="current.notes"><span>Notes</span>{{ current.notes }}</p>
              </div>
            </section>
          </div>

          <aside class="order-side">
            <section class="order-card">
              <p class="checkout-kicker">Timeline</p>
              <ol v-if="current.events.length" class="order-timeline">
                <li v-for="event in current.events" :key="event.id">
                  <span class="order-dot" aria-hidden="true" />
                  <div>
                    <p>{{ event.message }}</p>
                    <time :datetime="event.createdAt">{{ formatCreatedAt(event.createdAt) }}</time>
                  </div>
                </li>
              </ol>
              <p v-else class="order-muted">The first event will appear here.</p>
              <p v-if="pollingError" class="checkout-error" role="alert">{{ pollingError }}</p>
              <p v-if="!finalStatus && displayStage >= 6" class="order-muted">
                This page refreshes the status automatically.
              </p>
            </section>

            <section class="order-card order-help">
              <p class="checkout-kicker">Need a hand?</p>
              <p>Bring your order code to pickup. We can adjust the box at the counter.</p>
              <a class="menu-footnote-link" href="/menu">Back to the menu →</a>
            </section>
          </aside>
        </div>

        <div class="menu-footnote">
          <p>
            <strong>Stage {{ pad(displayStage) }} of {{ pad(STAGE_COUNT) }}:</strong> the order
            status page is live. {{ nextStage ? `${nextStage.title} arrives next.` : "" }}
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
