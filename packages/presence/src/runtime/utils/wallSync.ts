import type { Signature } from "../composables/usePresenceWall";

export const WALL_ENDPOINT = "/api/_presence/wall";

export interface WallTransport {
  /** Fire-and-forget: the local wall already rendered the signature. */
  push: (signature: Signature) => Promise<void>;
  pull: () => Promise<Signature[]>;
}

/**
 * Talks to the wall routes with plain `fetch`.
 *
 * Deliberately not `$fetch`: keeping this Nuxt-free is what lets the wall be
 * unit-tested without booting an app, same as the component and the plugin.
 */
export function createHttpTransport(endpoint: string = WALL_ENDPOINT): WallTransport {
  return {
    async push(signature) {
      await fetch(endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          text: signature.text,
          x: signature.x,
          y: signature.y,
          rotation: signature.rotation,
          color: signature.color,
        }),
      });
    },

    async pull() {
      const response = await fetch(endpoint);
      if (!response.ok) return [];

      const body = (await response.json()) as { signatures?: Signature[] };
      return body.signatures ?? [];
    },
  };
}

export interface PollOptions {
  intervalMs: number;
  onSignatures: (signatures: Signature[]) => void;
}

/**
 * Polls the wall while it is open. Returns a stop function.
 *
 * Polling beats a WebSocket here: the wall is open for seconds at a time and a
 * few visitors at once, so a socket would be infrastructure bought for nothing.
 */
export function startPolling(transport: WallTransport, opts: PollOptions): () => void {
  let stopped = false;

  async function tick() {
    try {
      const signatures = await transport.pull();
      if (!stopped) opts.onSignatures(signatures);
    } catch {
      // Offline or the route is gone — the local wall keeps working regardless.
    }
  }

  void tick();
  const timer = setInterval(() => void tick(), opts.intervalMs);

  return () => {
    stopped = true;
    clearInterval(timer);
  };
}
