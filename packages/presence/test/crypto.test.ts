import { describe, expect, it } from "vite-plus/test";
import {
  generateKeypair,
  signMark,
  verifyMark,
  type MarkPayload,
} from "../src/runtime/utils/crypto";

const payload: MarkPayload = {
  handle: "vantol",
  siteUrl: "https://vantolbennett.com",
  buildSha: "abc123",
  timestamp: 1_700_000_000,
};

describe("generateKeypair", () => {
  it("returns PEM strings", () => {
    const { publicKey, privateKey } = generateKeypair();
    expect(publicKey).toMatch(/BEGIN PUBLIC KEY/);
    expect(privateKey).toMatch(/BEGIN PRIVATE KEY/);
  });

  it("returns a different key each call", () => {
    expect(generateKeypair().publicKey).not.toBe(generateKeypair().publicKey);
  });
});

describe("signMark / verifyMark", () => {
  it("roundtrips a payload", () => {
    const { publicKey, privateKey } = generateKeypair();
    const result = verifyMark(signMark(payload, privateKey), publicKey);

    expect(result).toEqual({ valid: true, payload });
  });

  it("produces a two-part token", () => {
    const { privateKey } = generateKeypair();
    expect(signMark(payload, privateKey).split(".")).toHaveLength(2);
  });

  it("rejects a tampered payload", () => {
    const { publicKey, privateKey } = generateKeypair();
    const [, signature] = signMark(payload, privateKey).split(".");
    const forged = Buffer.from(JSON.stringify({ ...payload, handle: "attacker" })).toString(
      "base64url",
    );

    expect(verifyMark(`${forged}.${signature}`, publicKey).valid).toBe(false);
  });

  it("rejects a signature from a different key", () => {
    const signer = generateKeypair();
    const other = generateKeypair();

    expect(verifyMark(signMark(payload, signer.privateKey), other.publicKey).valid).toBe(false);
  });

  it("rejects a malformed token instead of throwing", () => {
    const { publicKey } = generateKeypair();

    expect(verifyMark("not-a-token", publicKey)).toMatchObject({ valid: false });
    expect(verifyMark("", publicKey)).toMatchObject({ valid: false });
  });

  it("reports a missing public key rather than crashing", () => {
    const { privateKey } = generateKeypair();

    expect(verifyMark(signMark(payload, privateKey), "")).toMatchObject({
      valid: false,
      reason: "no_public_key",
    });
  });
});
