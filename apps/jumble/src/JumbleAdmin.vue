<script setup lang="ts">
import { computed, ref } from "vue";
import type { AdminFlavor } from "./admin";
import {
  isOrderStatus,
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  type OrderStatus,
  type OrderSummary,
} from "./orders";
import { formatPickupDate } from "./pickup";
import { CURRENT_STAGE, STAGES, STAGE_COUNT } from "./stages";
import "./style.css";

const props = withDefaults(
  defineProps<{
    stage?: number;
    embed?: boolean;
    authorized: boolean;
    orders?: OrderSummary[];
    flavors?: AdminFlavor[];
    weekLabel?: string | null;
  }>(),
  {
    stage: CURRENT_STAGE,
    embed: false,
    orders: () => [],
    flavors: () => [],
    weekLabel: null,
  },
);

const blogUrl = "https://vantolbennett.vercel.app";
const seriesUrl = `${blogUrl}/learn/void`;
const lessonUrl = `${blogUrl}/learn/void/07-admin-and-auth`;

const displayStage = computed(() =>
  Math.min(Math.max(Number(props.stage) || CURRENT_STAGE, 1), STAGE_COUNT),
);

const nextStage = computed(() => STAGES[displayStage.value]);

const password = ref("");
const loginError = ref("");
const loggingIn = ref(false);
const message = ref("");
const orderList = ref<OrderSummary[]>(props.orders.map((order) => ({ ...order })));
const flavorList = ref<AdminFlavor[]>(props.flavors.map((flavor) => ({ ...flavor })));
const updatingOrder = ref<string | null>(null);
const updatingFlavor = ref<number | null>(null);
const uploadingImage = ref<number | null>(null);

const pad = (n: number) => String(n).padStart(2, "0");
const price = (cents: number) => `$${(cents / 100).toFixed(2)}`;

async function login(): Promise<void> {
  if (!password.value || loggingIn.value) return;

  loggingIn.value = true;
  loginError.value = "";

  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: password.value }),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      loginError.value =
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof payload.error === "string"
          ? payload.error
          : "Could not sign in.";
      return;
    }

    window.location.reload();
  } catch {
    loginError.value = "Could not reach the admin route.";
  } finally {
    loggingIn.value = false;
  }
}

async function logout(): Promise<void> {
  await fetch("/api/admin/logout", { method: "POST", credentials: "same-origin" });
  window.location.reload();
}

async function updateStatus(order: OrderSummary, next: OrderStatus): Promise<void> {
  if (updatingOrder.value) return;

  const previous = order.status;
  updatingOrder.value = order.publicId;
  message.value = "";

  try {
    const response = await fetch(`/api/admin/orders/${encodeURIComponent(order.publicId)}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status: next }),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      order.status = previous;
      message.value =
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof payload.error === "string"
          ? payload.error
          : "Could not update the order.";
      return;
    }

    order.status = next;
    message.value = `${order.publicId} updated.`;
  } catch {
    order.status = previous;
    message.value = "Could not reach the order route.";
  } finally {
    updatingOrder.value = null;
  }
}

function onStatusChange(order: OrderSummary, event: Event): void {
  const select = event.target;
  if (!(select instanceof HTMLSelectElement)) return;

  const next = select.value;
  if (!isOrderStatus(next)) {
    select.value = order.status;
    return;
  }

  void updateStatus(order, next);
}

async function uploadImage(flavor: AdminFlavor, event: Event): Promise<void> {
  const input = event.target;
  if (!(input instanceof HTMLInputElement) || !input.files?.length) return;

  const file = input.files[0];
  uploadingImage.value = flavor.id;
  message.value = "";

  const body = new FormData();
  body.append("flavorId", String(flavor.id));
  body.append("file", file);

  try {
    const response = await fetch("/api/admin/images", {
      method: "POST",
      credentials: "same-origin",
      body,
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      message.value =
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof payload.error === "string"
          ? payload.error
          : "Could not upload the image.";
      return;
    }

    if (
      !payload ||
      typeof payload !== "object" ||
      !("imageKey" in payload) ||
      typeof payload.imageKey !== "string"
    ) {
      message.value = "The image upload returned an unexpected response.";
      return;
    }

    flavor.imageKey = payload.imageKey;
    message.value = `${flavor.name} photo updated.`;
  } catch {
    message.value = "Could not reach the image route.";
  } finally {
    input.value = "";
    uploadingImage.value = null;
  }
}

async function removeImage(flavor: AdminFlavor): Promise<void> {
  if (uploadingImage.value !== null) return;

  uploadingImage.value = flavor.id;
  message.value = "";

  try {
    const response = await fetch("/api/admin/images", {
      method: "DELETE",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flavorId: flavor.id }),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      message.value =
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof payload.error === "string"
          ? payload.error
          : "Could not remove the image.";
      return;
    }

    flavor.imageKey = null;
    message.value = `${flavor.name} photo removed.`;
  } catch {
    message.value = "Could not reach the image route.";
  } finally {
    uploadingImage.value = null;
  }
}

async function toggleFlavor(flavor: AdminFlavor): Promise<void> {
  if (updatingFlavor.value !== null) return;

  const next = !flavor.isActive;
  updatingFlavor.value = flavor.id;
  message.value = "";

  try {
    const response = await fetch("/api/admin/menu", {
      method: "POST",
      credentials: "same-origin",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ flavorId: flavor.id, active: next }),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      message.value =
        payload &&
        typeof payload === "object" &&
        "error" in payload &&
        typeof payload.error === "string"
          ? payload.error
          : "Could not update the menu.";
      return;
    }

    flavor.isActive = next;
    message.value = `${flavor.name} ${next ? "added to" : "removed from"} the week.`;
  } catch {
    message.value = "Could not reach the menu route.";
  } finally {
    updatingFlavor.value = null;
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
          <button v-if="authorized" type="button" class="admin-logout" @click="logout">
            Sign out
          </button>
          <a
            v-else
            class="header-link"
            :href="seriesUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the series ↗
          </a>
        </div>
      </header>

      <main v-if="!authorized" class="admin-login-wrap">
        <form class="admin-login" @submit.prevent="login">
          <p class="menu-index">Jumble · admin</p>
          <h1 class="admin-title">The kitchen door.</h1>
          <p class="admin-copy">
            Orders and the weekly menu are behind this door. This is a single-admin session, not a
            customer account.
          </p>
          <label class="checkout-field">
            <span>Admin password</span>
            <input
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              placeholder="••••••••"
              required
            />
          </label>
          <p v-if="loginError" class="checkout-error" role="alert">{{ loginError }}</p>
          <button type="submit" class="btn admin-submit" :disabled="loggingIn">
            {{ loggingIn ? "Checking…" : "Open the admin" }}
          </button>
          <p class="admin-note">
            The password lives in the Worker secret <code>ADMIN_PASSWORD</code>. There is no
            customer signup here.
          </p>
        </form>
      </main>

      <main v-else>
        <section class="admin-head">
          <div>
            <p class="menu-index">Jumble · admin</p>
            <h1 class="admin-title">Tonight's kitchen.</h1>
            <p class="admin-copy">
              {{ orderList.length }} {{ orderList.length === 1 ? "order" : "orders" }} ·
              {{ weekLabel ?? "No active week" }}
            </p>
          </div>
          <a class="btn btn-ghost admin-view-shop" href="/">View storefront →</a>
        </section>

        <p v-if="message" class="admin-message" role="status">{{ message }}</p>

        <div class="admin-grid">
          <section class="admin-panel">
            <div class="order-card-head">
              <h2>Orders</h2>
              <span>{{ orderList.length }} total</span>
            </div>

            <div v-if="!orderList.length" class="admin-empty">
              <p>No orders yet. The first checkout will land here.</p>
            </div>

            <div v-else class="admin-orders">
              <article v-for="order in orderList" :key="order.publicId" class="admin-order">
                <div class="admin-order-main">
                  <a :href="`/orders/${order.publicId}`" class="admin-order-code">
                    {{ order.publicId }}
                  </a>
                  <p>{{ order.customerName }} · {{ price(order.subtotalCents) }}</p>
                  <p class="admin-order-meta">
                    {{ order.pickupDate }} · {{ order.pickupWindow }} · {{ order.locationName }}
                  </p>
                </div>
                <label class="admin-status">
                  <span>Status</span>
                  <select
                    :value="order.status"
                    :disabled="updatingOrder === order.publicId"
                    @change="onStatusChange(order, $event)"
                  >
                    <option v-for="status in ORDER_STATUSES" :key="status" :value="status">
                      {{ ORDER_STATUS_LABELS[status] }}
                    </option>
                  </select>
                </label>
              </article>
            </div>
          </section>

          <section class="admin-panel">
            <div class="order-card-head">
              <h2>This week's menu</h2>
              <span>{{ weekLabel ?? "No active week" }}</span>
            </div>
            <p class="admin-panel-copy">
              Add or remove flavors from the active week. The storefront and cookie pages read this
              list immediately.
            </p>
            <div class="admin-flavors">
              <article v-for="flavor in flavorList" :key="flavor.id" class="admin-flavor">
                <div class="admin-flavor-main">
                  <img
                    v-if="flavor.imageKey"
                    class="admin-flavor-image"
                    :src="`/api/images/${flavor.imageKey}`"
                    :alt="`${flavor.name} photo`"
                  />
                  <div>
                    <p class="admin-flavor-name">{{ flavor.name }}</p>
                    <p class="admin-flavor-meta">{{ price(flavor.priceCents) }} · {{ flavor.slug }}</p>
                  </div>
                </div>
                <div class="admin-flavor-actions">
                  <label class="admin-upload">
                    {{ uploadingImage === flavor.id ? "Uploading…" : flavor.imageKey ? "Replace photo" : "Add photo" }}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      :disabled="uploadingImage === flavor.id"
                      @change="uploadImage(flavor, $event)"
                    />
                  </label>
                  <button
                    v-if="flavor.imageKey"
                    type="button"
                    class="admin-upload"
                    :disabled="uploadingImage === flavor.id"
                    @click="removeImage(flavor)"
                  >
                    Remove photo
                  </button>
                  <button
                    type="button"
                    class="admin-toggle"
                    :class="{ 'is-active': flavor.isActive }"
                    :disabled="updatingFlavor === flavor.id"
                    @click="toggleFlavor(flavor)"
                  >
                    {{ flavor.isActive ? "In the week" : "Add to week" }}
                  </button>
                </div>
              </article>
            </div>
          </section>
        </div>

        <div class="menu-footnote">
          <p>
            <strong>Stage {{ pad(displayStage) }} of {{ pad(STAGE_COUNT) }}:</strong> admin and
            protected menu operations are live.
            {{ nextStage ? `${nextStage.title} arrives next.` : "" }}
          </p>
          <a :href="lessonUrl" target="_blank" rel="noopener noreferrer">Read the lesson →</a>
        </div>
      </main>

      <footer v-if="!embed" class="site-footer">
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
