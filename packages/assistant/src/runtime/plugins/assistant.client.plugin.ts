import { defineNuxtPlugin } from "nuxt/app";
import { assistantPlugin, type AssistantNuxtApp } from "./assistant.client";

export default defineNuxtPlugin((nuxtApp) => {
  assistantPlugin(nuxtApp as unknown as AssistantNuxtApp);
});
