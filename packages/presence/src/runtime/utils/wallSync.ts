/**
 * V1 HTTP transport for the wall. Pure `fetch` so the wall stays unit-testable
 * without booting Nuxt — same reasoning as the rest of the runtime layer.
 */

import type { PresenceSignature } from "../server/storage";
import type {
  AdminInput,
  WallPullInput,
  WallPushInput,
  WallTransport,
} from "../composables/usePresenceWall";

export const WALL_ENDPOINT = "/api/_presence/wall";

const ADMIN_ENDPOINTS = {
  pin: "/api/_presence/admin/pin",
  unpin: "/api/_presence/admin/unpin",
  approve: "/api/_presence/admin/approve",
  delete: "/api/_presence/admin/delete",
  list: "/api/_presence/admin/list",
} as const;

export function createHttpTransport(endpoint: string = WALL_ENDPOINT): WallTransport {
  return {
    async push(input: WallPushInput): Promise<PresenceSignature> {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const body = (await response.json()) as { signature?: PresenceSignature };
      if (!body.signature) throw new Error("presence: push returned no signature");
      return body.signature;
    },

    async pull(input?: WallPullInput) {
      const url = new URL(endpoint, location.origin);
      if (input?.pageKey) url.searchParams.set("pageKey", input.pageKey);
      if (input?.includePending) url.searchParams.set("includePending", "true");
      const headers: Record<string, string> = {};
      if (input?.adminToken) headers["x-presence-admin"] = input.adminToken;
      const response = await fetch(url, { headers });
      if (!response.ok) return { signatures: [] };
      return (await response.json()) as {
        signatures: PresenceSignature[];
        nextCursor?: string;
      };
    },

    async admin(input: AdminInput) {
      const path = ADMIN_ENDPOINTS[input.action];
      if (!path) throw new Error(`presence: unknown admin action ${input.action}`);
      const response = await fetch(path, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-presence-admin": input.adminToken,
        },
        body: JSON.stringify({
          id: input.id,
          ...(input.pinRank !== undefined ? { pinRank: input.pinRank } : {}),
          ...(input.pageKey ? { pageKey: input.pageKey } : {}),
        }),
      });
      return await response.json();
    },
  };
}

export interface PollOptions {
  intervalMs: number;
  onSignatures: (signatures: PresenceSignature[]) => void;
}

/**
 * Polls the wall while it is open. Returns a stop function.
 *
 * Polling beats a WebSocket here: the wall is open for seconds at a time and
 * a few visitors at once, so a socket would be infrastructure bought for nothing.
 */
export function startPolling(
  transport: WallTransport,
  opts: PollOptions,
  input?: WallPullInput,
): () => void {
  let stopped = false;

  async function tick() {
    try {
      const { signatures } = await transport.pull(input);
      if (!stopped) opts.onSignatures(signatures);
    } catch {
      // Offline or route gone — the local wall keeps working.
    }
  }
  void tick();
  const timer = setInterval(() => void tick(), opts.intervalMs);

  return () => {
    stopped = true;
    clearInterval(timer);
  };
}
