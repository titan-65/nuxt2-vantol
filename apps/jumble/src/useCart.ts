import { onMounted, ref } from "vue";
import {
  CART_HEADER,
  CART_STORAGE_KEY,
  createCartToken,
  emptyCartView,
  isCartToken,
  type CartView,
  type CartViewLine,
} from "./cart";

let memoryToken = "";

function isCartViewLine(value: unknown): value is CartViewLine {
  if (!value || typeof value !== "object") return false;

  return (
    "key" in value &&
    typeof value.key === "string" &&
    "slug" in value &&
    typeof value.slug === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "size" in value &&
    typeof value.size === "number" &&
    "boxLabel" in value &&
    typeof value.boxLabel === "string" &&
    "quantity" in value &&
    typeof value.quantity === "number" &&
    "priceCents" in value &&
    typeof value.priceCents === "number" &&
    "lineTotalCents" in value &&
    typeof value.lineTotalCents === "number" &&
    "color" in value &&
    typeof value.color === "string" &&
    "accent" in value &&
    typeof value.accent === "string"
  );
}

function isCartView(value: unknown): value is CartView {
  if (!value || typeof value !== "object") return false;

  return (
    "lines" in value &&
    Array.isArray(value.lines) &&
    value.lines.every(isCartViewLine) &&
    "subtotalCents" in value &&
    typeof value.subtotalCents === "number" &&
    "boxCount" in value &&
    typeof value.boxCount === "number" &&
    "cookieCount" in value &&
    typeof value.cookieCount === "number"
  );
}

function ensureCartToken(): string {
  if (isCartToken(memoryToken)) {
    return memoryToken;
  }

  if (typeof window !== "undefined") {
    try {
      const stored = window.localStorage.getItem(CART_STORAGE_KEY);
      if (isCartToken(stored)) {
        memoryToken = stored;
        return stored;
      }
    } catch {
      // Storage can be unavailable in a privacy-restricted iframe.
    }
  }

  const token = createCartToken();
  memoryToken = token;

  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, token);
    } catch {
      // Keep the in-memory token for this page.
    }
  }

  return token;
}

async function requestCart(token: string, init?: RequestInit): Promise<CartView> {
  const response = await fetch("/api/cart", {
    ...init,
    credentials: "same-origin",
    headers: {
      "content-type": "application/json",
      [CART_HEADER]: token,
    },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Could not update your box.";
    throw new Error(message);
  }

  if (!isCartView(payload)) {
    throw new Error("The cart returned an unexpected response.");
  }

  return payload;
}

export function useCart(enabled = true, initialToken?: string | null) {
  const fixedToken = isCartToken(initialToken) ? initialToken : null;
  const cart = ref<CartView>(emptyCartView());
  const isOpen = ref(false);
  const busy = ref(false);
  const error = ref("");
  const sessionToken = ref(fixedToken ?? "");

  function tokenForRequest(): string {
    const token = fixedToken ?? ensureCartToken();
    sessionToken.value = token;
    return token;
  }

  async function refresh(): Promise<void> {
    if (!enabled) return;

    error.value = "";

    try {
      cart.value = await requestCart(tokenForRequest());
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : "Could not load your box.";
    }
  }

  async function mutate(
    method: "POST" | "PATCH" | "DELETE",
    body: unknown,
  ): Promise<boolean> {
    if (!enabled) return false;

    busy.value = true;
    error.value = "";

    try {
      cart.value = await requestCart(tokenForRequest(), {
        method,
        body: JSON.stringify(body),
      });
      return true;
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : "Could not update your box.";
      return false;
    } finally {
      busy.value = false;
    }
  }

  function add(slug: string, size: number, quantity = 1): Promise<boolean> {
    return mutate("POST", { slug, size, quantity });
  }

  function setQuantity(line: CartViewLine, quantity: number): Promise<boolean> {
    return mutate("PATCH", { slug: line.slug, size: line.size, quantity });
  }

  function remove(line: CartViewLine): Promise<boolean> {
    return mutate("DELETE", { slug: line.slug, size: line.size });
  }

  function openCart(): void {
    isOpen.value = true;
  }

  function closeCart(): void {
    isOpen.value = false;
  }

  onMounted(() => {
    if (enabled) {
      void refresh();
    }
  });

  return {
    cart,
    sessionToken,
    isOpen,
    busy,
    error,
    refresh,
    add,
    setQuantity,
    remove,
    openCart,
    closeCart,
  };
}
