import {
  createPrivateKey,
  createPublicKey,
  generateKeyPairSync,
  sign as edSign,
  verify as edVerify,
} from "node:crypto";

export interface MarkPayload {
  handle: string;
  siteUrl: string;
  buildSha: string;
  timestamp: number;
}

export interface Keypair {
  publicKey: string;
  privateKey: string;
}

export type VerifyResult = { valid: true; payload: MarkPayload } | { valid: false; reason: string };

export function generateKeypair(): Keypair {
  const { publicKey, privateKey } = generateKeyPairSync("ed25519");
  return {
    publicKey: publicKey.export({ type: "spki", format: "pem" }).toString(),
    privateKey: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
  };
}

/**
 * Returns a `<base64url payload>.<base64url signature>` token.
 *
 * The signature covers the encoded payload bytes, not the object — verification
 * never re-serialises, so it cannot fail on JSON key ordering.
 */
export function signMark(payload: MarkPayload, privateKeyPem: string): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = edSign(null, Buffer.from(encoded), createPrivateKey(privateKeyPem));

  return `${encoded}.${signature.toString("base64url")}`;
}

export function verifyMark(token: string, publicKeyPem: string): VerifyResult {
  if (!publicKeyPem) return { valid: false, reason: "no_public_key" };

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return { valid: false, reason: "malformed_token" };

  try {
    const ok = edVerify(
      null,
      Buffer.from(encoded),
      createPublicKey(publicKeyPem),
      Buffer.from(signature, "base64url"),
    );
    if (!ok) return { valid: false, reason: "invalid_signature" };

    return { valid: true, payload: JSON.parse(Buffer.from(encoded, "base64url").toString()) };
  } catch (error) {
    return { valid: false, reason: error instanceof Error ? error.message : "verify_error" };
  }
}
