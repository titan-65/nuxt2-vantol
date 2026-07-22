/**
 * Public storage surface — exported for adapters (T2's companion `@nuxt-presence/github`
 * does not consume this, but hosts writing their own storage driver do).
 *
 * The interface is the contract from T3. Implementation lives in
 * `./nitro-unstorage.ts` (default). Hosts override via `presence.storage.instance`.
 */

// ponytail: import nothing here — pure types so adapters in any host can `import type`
// without dragging Nitro / unstorage into the type graph.

// ── Identity (mirrors T1's `PresenceIdentity` from module-options) ─────────────

export interface PresenceIdentity {
  /** Stable provider-internal ID; rate-limit key + dedup. */
  id: string;
  /** Display handle (e.g. "vantolbennett"). */
  handle: string;
  displayName?: string;
  avatarUrl?: string;
  url?: string;
  provider?: string;
}

// ── Scope ─────────────────────────────────────────────────────────────────────

export interface PresenceScope {
  siteKey: string;
  pageKey?: string;
}

// ── Admin actor (audit stamp) ─────────────────────────────────────────────────

export interface PresenceAdminActor {
  /** First 8 hex chars of `sha256(adminToken)`; never the token itself. */
  tokenId: string;
  /** ISO-8601 UTC of action. */
  at: string;
}

// ── Signature record (per T5) ─────────────────────────────────────────────────

export type SignatureState = "visible" | "pending" | "pinned";

export type RenderHint = "default" | "compact" | "signature";

export interface PresenceSignature {
  id: string;
  author: PresenceIdentity;
  siteKey: string;
  pageKey?: string;
  body: string;
  renderHint?: RenderHint;
  /** ISO-8601 UTC. */
  createdAt: string;
  state: SignatureState;
  /** Present iff `state === "pinned"`; smaller = higher rank. */
  pinRank?: number;
  reportCount: number;
  pinnedBy?: PresenceAdminActor;
  moderatedBy?: PresenceAdminActor;
  /** ISO-8601 UTC; present iff `pinnedBy` or `moderatedBy` set. */
  moderatedAt?: string;
}

// ── Listing ───────────────────────────────────────────────────────────────────

export interface PresenceListOptions {
  cursor?: string;
  limit?: number;
  /** Admin path only — non-admin drives ignore the flag. */
  includePending?: boolean;
}

export interface PresenceListPage<T> {
  items: T[];
  nextCursor?: string;
}

// ── Reports (per T3 §10) ─────────────────────────────────────────────────────

export interface PresenceReport {
  signatureId: string;
  /** `Identity.id` when signed, else `HMAC-SHA256(secret, ip)`. */
  reporterKey: string;
  reason: "spam" | "abuse" | "harassment" | "other";
  createdAt: number;
}

// ── Audit (per T3 §10; admin actions only) ───────────────────────────────────

export interface PresenceAuditEntry {
  id: string;
  /** Scope the action targeted — needed to write the audit row under the right prefix. */
  scope: PresenceScope;
  action: "pin" | "unpin" | "approve" | "delete";
  targetId?: string;
  adminTokenId: string;
  payload?: unknown;
  createdAt: number;
}

// ── Policy (per T3 §10; V1 is config-only — no /api/_presence/admin/policy) ──

export interface PresencePolicy {
  rateLimit: {
    perIpHour: number;
    perUserTenMin: number;
  };
  filter: {
    strict: boolean;
    extraHardBlocklist: string[];
    extraSoftBlocklist: string[];
    extraDenyRegex: string[];
  };
}

// ── Errors (per T3 §1) ────────────────────────────────────────────────────────

export type StorageErrorCode =
  | "not_found"
  | "storage_full"
  | "invalid_cursor"
  | "conflict"
  | "backend_unavailable";

export interface StorageError {
  code: StorageErrorCode;
  /** Per-code payload. */
  maxSignatures?: number;
  reason?: string;
  cause?: unknown;
}

export class PresenceStorageError extends Error {
  constructor(public readonly detail: StorageError) {
    super(detail.code);
    this.name = "PresenceStorageError";
  }
}

// ── The full adapter contract (T3) ───────────────────────────────────────────

export interface PresenceStorage {
  // -- signatures --
  append(
    input: Omit<PresenceSignature, "id" | "createdAt" | "reportCount">,
  ): Promise<PresenceSignature>;
  list(opts: PresenceListOptions & PresenceScope): Promise<PresenceListPage<PresenceSignature>>;
  getById(scope: PresenceScope, id: string): Promise<PresenceSignature | null>;
  pin(scope: PresenceScope, id: string, pinRank: number): Promise<PresenceSignature>;
  unpin(scope: PresenceScope, id: string): Promise<PresenceSignature>;
  approve(scope: PresenceScope, id: string): Promise<PresenceSignature>;
  delete(scope: PresenceScope, id: string): Promise<void>;

  /** Bumps `reportCount` on a signature. Returns the updated record. */
  incrementReportCount(scope: PresenceScope, id: string): Promise<PresenceSignature>;

  // -- reports --
  reportAppend(report: PresenceReport): Promise<void>;
  /** Idempotency — false when `(signatureId, reporterKey)` already exists. */
  hasReported(signatureId: string, reporterKey: string): Promise<boolean>;

  // -- admin audit --
  auditAppend(entry: PresenceAuditEntry): Promise<void>;
  auditList(
    opts: PresenceListOptions & PresenceScope,
  ): Promise<PresenceListPage<PresenceAuditEntry>>;

  // -- policy (config-only in V1; getPolicy reads, setPolicy unused by routes) --
  getPolicy(scope: PresenceScope): Promise<PresencePolicy>;
  setPolicy(scope: PresenceScope, patch: Partial<PresencePolicy>): Promise<PresencePolicy>;

  // -- rate-limit counters --
  rateLimitCount(bucket: "ip" | "user", key: string): Promise<number>;
  /** Atomically increments; auto-expires after `windowMs` via row eviction. */
  rateLimitIncr(bucket: "ip" | "user", key: string, windowMs: number): Promise<number>;
}
