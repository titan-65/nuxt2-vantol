import { defineEventHandler, readBody } from "h3";
import { useRuntimeConfig } from "nitropack/runtime";
import { verifyMark, type VerifyResult } from "../../runtime/utils/crypto";

/**
 * Authoritative check of a presence mark.
 *
 * The public key comes from this build's own config, never from the request —
 * a caller-supplied key would verify anything the caller signed themselves.
 */
export default defineEventHandler(async (event): Promise<VerifyResult> => {
  const presence: { publicKey?: string; mark?: string } = useRuntimeConfig(event).public.presence;

  const body = await readBody<{ token?: unknown }>(event).catch(() => undefined);
  // No token given — verify the mark this build stamped into its own pages.
  const token = typeof body?.token === "string" ? body.token : presence.mark;

  if (!token) return { valid: false, reason: "no_mark" };

  return verifyMark(token, presence.publicKey ?? "");
});
