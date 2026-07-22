/**
 * Page-key validation smoke tests (T5 + T14).
 */

import { describe, it, expect } from "vite-plus/test";
import { validatePageKey, PageKeyError } from "../src/runtime/server/scope";

describe("validatePageKey", () => {
  it("accepts a normal page key", () => {
    expect(validatePageKey("docs/getting-started")).toBe("docs/getting-started");
  });

  it("accepts keys with dashes, colons, dots", () => {
    expect(validatePageKey("v1.0:release-notes")).toBe("v1.0:release-notes");
  });

  it("rejects an empty string", () => {
    expect(() => validatePageKey("")).toThrow(PageKeyError);
  });

  it("rejects a leading slash", () => {
    expect(() => validatePageKey("/bad")).toThrow(PageKeyError);
  });

  it("rejects keys longer than 128 chars", () => {
    expect(() => validatePageKey("a".repeat(129))).toThrow(PageKeyError);
  });

  it("rejects keys with disallowed characters", () => {
    expect(() => validatePageKey("has spaces")).toThrow(PageKeyError);
    expect(() => validatePageKey("has!bang")).toThrow(PageKeyError);
  });

  it("rejects non-string inputs", () => {
    expect(() => validatePageKey(123)).toThrow(PageKeyError);
    expect(() => validatePageKey(null)).toThrow(PageKeyError);
    expect(() => validatePageKey(undefined)).toThrow(PageKeyError);
  });
});
