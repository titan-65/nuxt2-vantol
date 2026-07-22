import { createApp } from "vue";
import NuxtAssistant from "../components/NuxtAssistant.vue";
import { useNuxtAssistant } from "../composables/useNuxtAssistant";

export interface AssistantConsole {
  open: () => void;
  close: () => void;
  toggle: () => void;
  ask: (query: string) => Promise<unknown>;
  clear: () => void;
}

declare global {
  interface Window {
    $assistant?: AssistantConsole;
  }
}

export interface AssistantPluginOptions {
  shortcut: string[];
  autoMount: boolean;
}

export const ASSISTANT_ROOT_SELECTOR = "[data-nuxt-assistant-root]";

export function createAssistantPlugin(opts: AssistantPluginOptions): () => void {
  const assistant = useNuxtAssistant();

  function onKeydown(e: KeyboardEvent) {
    // Cmd+K / Ctrl+K / Meta+K / Cmd+/ / Ctrl+/
    const isCmdOrCtrl = e.metaKey || e.ctrlKey;
    const isK = e.key.toLowerCase() === "k";
    const isSlash = e.key === "/";

    if (isCmdOrCtrl && (isK || isSlash)) {
      e.preventDefault();
      assistant.toggleAssistant();
    } else if (e.key === "Escape" && assistant.isOpen.value) {
      assistant.closeAssistant();
    }
  }

  const consoleApi: AssistantConsole = {
    open: () => assistant.openAssistant(),
    close: () => assistant.closeAssistant(),
    toggle: () => assistant.toggleAssistant(),
    ask: (query: string) => assistant.sendMessage(query),
    clear: () => assistant.clearHistory(),
  };

  window.$assistant = consoleApi;
  window.addEventListener("keydown", onKeydown);

  return () => {
    window.removeEventListener("keydown", onKeydown);
    delete window.$assistant;
  };
}

export function mountAssistant(): () => void {
  if (typeof document === "undefined") return () => {};
  if (document.querySelector(ASSISTANT_ROOT_SELECTOR)) return () => {};

  const host = document.createElement("div");
  host.setAttribute("data-nuxt-assistant-root", "");
  document.body.appendChild(host);

  const app = createApp(NuxtAssistant);
  app.mount(host);

  return () => {
    app.unmount();
    host.remove();
  };
}

export interface AssistantNuxtApp {
  $config: {
    public: {
      assistant?: {
        enabled?: boolean;
        autoMount?: boolean;
        shortcut?: string[];
      };
    };
  };
}

export function assistantPlugin(nuxtApp: AssistantNuxtApp): void {
  const opts = nuxtApp.$config.public.assistant ?? {};
  if (opts.enabled === false) return;

  const shortcut = opts.shortcut ?? ["Cmd+K", "Ctrl+K"];
  const autoMount = opts.autoMount !== false;

  createAssistantPlugin({ shortcut, autoMount });

  if (autoMount) {
    mountAssistant();
  }
}
