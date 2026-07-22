/**
 * Default `PresenceStorage` driver on Nitro's `useStorage()`.
 *
 * Memory budget: one Nitro storage mount per `mountKey` (default `'presence'`),
 * five key prefixes (`wall:`, `report:`, `audit:`, `policy:`, `counters:`).
 * Each signature is its own key, so per-scope `list` is small (cap-bounded at 50+50).
 *
 * Concurrency: append-only insert + last-write-wins on named transitions (per T3 §3).
 * The default driver never throws `storage_full` — the cap policy in T5 evicts oldest
 * visible first. Only hard-cap adapters do.
 */

import { useStorage } from "nitropack/runtime";
import { randomUUID } from "node:crypto";
import {
  PresenceStorageError,
  type PresenceAuditEntry,
  type PresenceListOptions,
  type PresencePolicy,
  type PresenceScope,
  type PresenceSignature,
  type PresenceStorage,
} from "./presence-storage";

const DEFAULT_CAP = 50;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

const PREFIXES = {
  wall: "wall",
  report: "report",
  audit: "audit",
  policy: "policy",
  counters: "counters",
} as const;

export type NitroUnstoragePrefixKey = keyof typeof PREFIXES;

export interface NitroUnstorageOptions {
  /** `useStorage(mount)` key. Default `'presence'`. */
  mountKey?: string;
  /** Override any of the five top-level prefixes. */
  prefixOverrides?: Partial<Record<NitroUnstoragePrefixKey, string>>;
  /** Per-scope visible cap (T5 §5). Default 50. */
  maxSignatures?: number;
  /** Returned by `getPolicy` when no policy key has been written for the scope. */
  defaultPolicy?: PresencePolicy;
}

const DEFAULT_POLICY: PresencePolicy = {
  rateLimit: { perIpHour: 5, perUserTenMin: 1 },
  filter: {
    strict: true,
    extraHardBlocklist: [],
    extraSoftBlocklist: [],
    extraDenyRegex: [],
  },
};

// ponytail: ULID/UUIDv7 was preferred for sortable ids; v4 used here for zero-dep.
// Cursor uses (createdAt, id) tiebreak (T3 §4) so list ordering stays correct.

export function createNitroUnstorageStorage(opts: NitroUnstorageOptions = {}): PresenceStorage {
  const mount = opts.mountKey ?? "presence";
  const P = { ...PREFIXES, ...opts.prefixOverrides };
  const cap = opts.maxSignatures ?? DEFAULT_CAP;
  const defaultPolicy = opts.defaultPolicy ?? DEFAULT_POLICY;

  type Kvs = ReturnType<typeof useStorage>;

  const kvs = (): Kvs => useStorage(mount);

  // ── key builders ─────────────────────────────────────────────────────────

  function siteBase(scope: PresenceScope): string {
    return `${P.wall}:${scope.siteKey}`;
  }
  function sigKey(scope: PresenceScope, id: string): string {
    return `${siteBase(scope)}${scope.pageKey ? `:page:${scope.pageKey}:sigs` : ":sigs"}:${id}`;
  }
  function sigPrefix(scope: PresenceScope): string {
    return `${sigKey(scope, "")}`;
  }
  function reportKey(signatureId: string, reporterKey: string): string {
    return `${P.report}:${signatureId}:${reporterKey}`;
  }
  function auditKey(scope: PresenceScope, id: string): string {
    return `${P.audit}:${siteBase(scope)}${scope.pageKey ? `:page:${scope.pageKey}` : ""}:${id}`;
  }
  function auditPrefix(scope: PresenceScope): string {
    return `${P.audit}:${siteBase(scope)}${scope.pageKey ? `:page:${scope.pageKey}` : ""}:`;
  }
  function policyKey(scope: PresenceScope): string {
    return `${P.policy}:${siteBase(scope)}${scope.pageKey ? `:page:${scope.pageKey}` : ""}`;
  }
  function counterKey(bucket: "ip" | "user", key: string, windowStartMs: number): string {
    return `${P.counters}:${bucket}:${key}:${windowStartMs}`;
  }

  // ── cursor ───────────────────────────────────────────────────────────────

  function encodeCursor(createdAt: string, id: string): string {
    return Buffer.from(JSON.stringify({ c: createdAt, i: id }), "utf8").toString("base64url");
  }
  function decodeCursor(cursor: string): { createdAt: string; id: string } {
    try {
      const parsed: unknown = JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"));
      if (
        typeof parsed === "object" &&
        parsed !== null &&
        "c" in parsed &&
        "i" in parsed &&
        typeof (parsed as { c: unknown }).c === "string" &&
        typeof (parsed as { i: unknown }).i === "string"
      ) {
        return { createdAt: (parsed as { c: string }).c, id: (parsed as { i: string }).i };
      }
      throw new Error("shape");
    } catch (cause) {
      throw new PresenceStorageError({ code: "invalid_cursor", cause });
    }
  }

  // ── signature ops ────────────────────────────────────────────────────────

  async function readScope(scope: PresenceScope): Promise<PresenceSignature[]> {
    const keys = await kvs().getKeys(sigPrefix(scope));
    const values = await Promise.all(keys.map((k) => kvs().getItem<PresenceSignature>(k)));
    return values.filter((v): v is PresenceSignature => v !== null);
  }

  async function writeSig(sig: PresenceSignature): Promise<void> {
    await kvs().setItem(sigKey({ siteKey: sig.siteKey, pageKey: sig.pageKey }, sig.id), sig);
  }

  async function removeSig(sig: PresenceSignature): Promise<void> {
    await kvs().removeItem(sigKey({ siteKey: sig.siteKey, pageKey: sig.pageKey }, sig.id));
  }

  return {
    // ── append ────────────────────────────────────────────────────────────
    async append(input) {
      const incoming: PresenceSignature = {
        ...input,
        id: randomUUID(),
        createdAt: new Date().toISOString(),
        state: input.state,
        reportCount: 0,
      };

      // T5 §5 cap policy + T3 §1 `storage_full` semantics:
      //   - pending overflow → throw (no room left at all)
      //   - visible overflow → drop oldest visible (no throw)
      const existing = await readScope(incoming);
      const visible = existing.filter((s) => s.state !== "pending").length;

      if (incoming.state === "pending") {
        const pending = existing.filter((s) => s.state === "pending").length;
        if (pending >= cap) {
          throw new PresenceStorageError({
            code: "storage_full",
            maxSignatures: cap,
          });
        }
      } else if (visible >= cap) {
        const droppable = existing
          .filter((s) => s.state !== "pending")
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .slice(0, visible - cap + 1);
        await Promise.all(droppable.map(removeSig));
      }

      await writeSig(incoming);
      return incoming;
    },

    // ── list ──────────────────────────────────────────────────────────────
    async list(opts: PresenceListOptions & PresenceScope) {
      const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
      const includePending = opts.includePending === true;

      const all = (await readScope(opts)).filter((s) =>
        includePending ? true : s.state !== "pending",
      );

      // T3 §4 ordering: pinned (by pinRank asc, then createdAt desc) → visible (createdAt desc) → pending (admin only).
      all.sort((a, b) => {
        if (a.state === "pinned" && b.state !== "pinned") return -1;
        if (b.state === "pinned" && a.state !== "pinned") return 1;
        if (a.state === "pinned" && b.state === "pinned") {
          if (a.pinRank !== b.pinRank) return (a.pinRank ?? 0) - (b.pinRank ?? 0);
          return b.createdAt.localeCompare(a.createdAt);
        }
        return b.createdAt.localeCompare(a.createdAt);
      });

      let startIdx = 0;
      if (opts.cursor) {
        const cur = decodeCursor(opts.cursor);
        startIdx = all.findIndex((s) => s.createdAt === cur.createdAt && s.id === cur.id);
        if (startIdx === -1) startIdx = 0;
        else startIdx += 1;
      }

      const page = all.slice(startIdx, startIdx + limit);
      const next =
        startIdx + limit < all.length
          ? encodeCursor(page[page.length - 1]!.createdAt, page[page.length - 1]!.id)
          : undefined;

      return { items: page, nextCursor: next };
    },

    // ── getById ───────────────────────────────────────────────────────────
    async getById(scope, id) {
      const existing = await readScope(scope);
      return existing.find((s) => s.id === id) ?? null;
    },

    // ── pin / unpin ───────────────────────────────────────────────────────
    async pin(scope, id, pinRank) {
      const existing = await readScope(scope);
      const sig = existing.find((s) => s.id === id);
      if (!sig) throw new PresenceStorageError({ code: "not_found" });
      // ponytail: pinCap enforcement happens in T8/T12; storage applies the transition.
      const updated: PresenceSignature = {
        ...sig,
        state: "pinned",
        pinRank,
        moderatedAt: new Date().toISOString(),
      };
      await writeSig(updated);
      return updated;
    },

    async unpin(scope, id) {
      const existing = await readScope(scope);
      const sig = existing.find((s) => s.id === id);
      if (!sig) throw new PresenceStorageError({ code: "not_found" });
      const updated: PresenceSignature = {
        ...sig,
        state: "visible",
        pinRank: undefined,
        moderatedAt: new Date().toISOString(),
      };
      await writeSig(updated);
      return updated;
    },

    // ── approve ───────────────────────────────────────────────────────────
    async approve(scope, id) {
      const existing = await readScope(scope);
      const sig = existing.find((s) => s.id === id);
      if (!sig) throw new PresenceStorageError({ code: "not_found" });
      if (sig.state !== "pending") {
        throw new PresenceStorageError({
          code: "conflict",
          reason: `not_pending:${sig.state}`,
        });
      }
      const updated: PresenceSignature = {
        ...sig,
        state: "visible",
        moderatedAt: new Date().toISOString(),
      };
      await writeSig(updated);
      return updated;
    },

    // ── delete ────────────────────────────────────────────────────────────
    async delete(scope, id) {
      const existing = await readScope(scope);
      const sig = existing.find((s) => s.id === id);
      if (!sig) throw new PresenceStorageError({ code: "not_found" });
      await removeSig(sig);
    },

    // ── reports ───────────────────────────────────────────────────────────
    async incrementReportCount(scope, id) {
      const existing = await readScope(scope);
      const sig = existing.find((s) => s.id === id);
      if (!sig) throw new PresenceStorageError({ code: "not_found" });
      const updated: PresenceSignature = {
        ...sig,
        reportCount: sig.reportCount + 1,
      };
      await writeSig(updated);
      return updated;
    },

    async reportAppend(report) {
      // ponytail: idempotent via key equality — same (signatureId, reporterKey) overwrites
      // the same row. hasReported guards duplicate inserts.
      await kvs().setItem(reportKey(report.signatureId, report.reporterKey), report);
    },

    async hasReported(signatureId, reporterKey) {
      return (await kvs().getItem(reportKey(signatureId, reporterKey))) !== null;
    },

    // ── audit ─────────────────────────────────────────────────────────────
    async auditAppend(entry) {
      await kvs().setItem(auditKey(entry.scope, entry.id), entry);
    },

    async auditList(opts: PresenceListOptions & PresenceScope) {
      const limit = Math.min(opts.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
      const prefix = auditPrefix(opts);
      const keys = await kvs().getKeys(prefix);
      const values = await Promise.all(keys.map((k) => kvs().getItem<PresenceAuditEntry>(k)));
      const items = values
        .filter((v): v is PresenceAuditEntry => v !== null)
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(0, limit);
      return { items };
    },

    // ── policy ────────────────────────────────────────────────────────────
    async getPolicy(scope) {
      const stored = await kvs().getItem<PresencePolicy>(policyKey(scope));
      return stored ?? defaultPolicy;
    },

    async setPolicy(scope, patch) {
      const current = await this.getPolicy(scope);
      const next: PresencePolicy = mergePolicy(current, patch);
      await kvs().setItem(policyKey(scope), next);
      return next;
    },

    // ── rate-limit counters ───────────────────────────────────────────────
    async rateLimitCount(bucket, key) {
      // Sum all window rows for this (bucket, key) that are still in the present.
      const now = Date.now();
      const prefix = `${P.counters}:${bucket}:${key}:`;
      const keys = await kvs().getKeys(prefix);
      const values = await Promise.all(keys.map((k) => kvs().getItem<number>(k)));
      let sum = 0;
      const stale: string[] = [];
      for (let i = 0; i < keys.length; i++) {
        const windowStart = Number(keys[i]!.split(":").pop());
        const age = now - windowStart;
        if (age >= 0 && age < (bucket === "ip" ? 3_600_000 : 600_000)) {
          sum += values[i] ?? 0;
        } else if (age >= (bucket === "ip" ? 3_600_000 : 600_000)) {
          stale.push(keys[i]!);
        }
      }
      // ponytail: opportunistic evict — keeps the counter namespace from leaking rows.
      await Promise.all(stale.map((k) => kvs().removeItem(k)));
      return sum;
    },

    async rateLimitIncr(bucket, key, windowMs) {
      const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
      const ck = counterKey(bucket, key, windowStart);
      const current = (await kvs().getItem<number>(ck)) ?? 0;
      const next = current + 1;
      await kvs().setItem(ck, next);
      return next;
    },
  };
}

function mergePolicy(current: PresencePolicy, patch: Partial<PresencePolicy>): PresencePolicy {
  return {
    rateLimit: { ...current.rateLimit, ...patch.rateLimit },
    filter: {
      strict: patch.filter?.strict ?? current.filter.strict,
      extraHardBlocklist: patch.filter?.extraHardBlocklist ?? current.filter.extraHardBlocklist,
      extraSoftBlocklist: patch.filter?.extraSoftBlocklist ?? current.filter.extraSoftBlocklist,
      extraDenyRegex: patch.filter?.extraDenyRegex ?? current.filter.extraDenyRegex,
    },
  };
}
