import { afterEach, describe, expect, it } from "vite-plus/test";
import {
  getDefaultRenderStyle,
  setDefaultRenderStyle,
  signatureStyle,
} from "../src/runtime/utils/renderStyle";

afterEach(() => {
  setDefaultRenderStyle("cursive");
});

describe("signatureStyle", () => {
  it("returns a cursive font and the text untouched", () => {
    const s = signatureStyle({ text: "hello" }, "cursive");
    expect(s.fontFamily).toMatch(/cursive/i);
    expect(s.text).toBe("hello");
  });

  it("uppercases the text in a monospace font for block", () => {
    const s = signatureStyle({ text: "hello" }, "block");
    expect(s.fontFamily).toMatch(/monospace/i);
    expect(s.text).toBe("HELLO");
  });

  it("reduces the text to a capitalised initial for monogram", () => {
    expect(signatureStyle({ text: "hello" }, "monogram").text).toBe("H");
  });

  it("falls back to the default style when none is given", () => {
    setDefaultRenderStyle("block");
    expect(signatureStyle({ text: "hello" }).text).toBe("HELLO");
  });
});

describe("defaultRenderStyle", () => {
  it("is cursive until set", () => {
    expect(getDefaultRenderStyle()).toBe("cursive");
  });

  it("ignores unknown styles so bad config cannot break rendering", () => {
    setDefaultRenderStyle("neon" as never);
    expect(getDefaultRenderStyle()).toBe("cursive");
  });
});
