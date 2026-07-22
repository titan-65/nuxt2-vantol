/**
 * V1 Nuxt client plugin wrapper.
 */

import { defineNuxtPlugin } from "#app";
import { presencePlugin } from "./presence.client";

export default defineNuxtPlugin((nuxtApp) => {
  // ponytail: typed as `unknown` rather than `NuxtApp` because `nuxt/app` pulls
  // generated virtual modules that only exist inside an actual Nuxt build.
  presencePlugin(nuxtApp as unknown as Parameters<typeof presencePlugin>[0]);
});
