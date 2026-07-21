import type { RenderStyle } from "../../options";

export interface SignatureStyle {
  fontFamily: string;
  text: string;
}

const STYLES: Record<RenderStyle, (text: string) => SignatureStyle> = {
  cursive: (text) => ({ fontFamily: "'Caveat', cursive", text }),
  block: (text) => ({ fontFamily: "'Courier New', monospace", text: text.toUpperCase() }),
  monogram: (text) => ({ fontFamily: "Georgia, serif", text: text.charAt(0).toUpperCase() }),
};

// ponytail: module-level default rather than reading runtimeConfig in the
// component. The client plugin pushes the configured style in at startup, which
// keeps <PresenceWall> free of Nuxt-only imports so it still mounts under plain
// vitest — same reasoning as the plugin's PresenceNuxtApp type.
let defaultStyle: RenderStyle = "cursive";

export function setDefaultRenderStyle(style: RenderStyle): void {
  if (style in STYLES) defaultStyle = style;
}

export function getDefaultRenderStyle(): RenderStyle {
  return defaultStyle;
}

export function signatureStyle(sig: { text: string }, style?: RenderStyle): SignatureStyle {
  return (STYLES[style!] ?? STYLES[defaultStyle])(sig.text);
}
