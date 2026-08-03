import { describe, it, expect, vi, beforeEach } from "vitest";
import { triggerDeploy } from "./deploy";

const VALID_URL = "https://api.vercel.com/v1/integrations/deploy/mysite/hook/abc123";

function mockVercelResponse(data: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    text: async () => JSON.stringify(data),
    json: async () => data,
  };
}

describe("triggerDeploy", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("throws when hookUrl is missing", async () => {
    await expect(triggerDeploy({ hookUrl: "" })).rejects.toThrow("hookUrl is required");
  });

  it("throws when hookUrl is not a valid URL", async () => {
    await expect(triggerDeploy({ hookUrl: "not-a-url" })).rejects.toThrow("must be a valid URL");
  });

  it("throws when hookUrl is not a Vercel URL", async () => {
    await expect(triggerDeploy({ hookUrl: "https://example.com/hook" })).rejects.toThrow(
      "must be a Vercel deploy hook URL",
    );
  });

  it("parses real Vercel API response format", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        mockVercelResponse({
          job: {
            id: "okzCd50AIap1O31g0gne",
            state: "PENDING",
            createdAt: 1662825789999,
          },
        }),
      ),
    );

    const result = await triggerDeploy({ hookUrl: VALID_URL });
    expect(result.jobId).toBe("okzCd50AIap1O31g0gne");
    expect(result.state).toBe("PENDING");
    expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it("throws on missing job field in response", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockVercelResponse({ success: true })));

    await expect(triggerDeploy({ hookUrl: VALID_URL })).rejects.toThrow('no "job" field');
  });

  it("throws on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(mockVercelResponse({ error: { message: "Unauthorized" } }, 401)),
    );

    await expect(triggerDeploy({ hookUrl: VALID_URL })).rejects.toThrow("Unauthorized");
  });

  it("handles non-JSON response body", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "<html>502 Bad Gateway</html>",
        json: async () => {
          throw new Error("not json");
        },
      }),
    );

    await expect(triggerDeploy({ hookUrl: VALID_URL })).rejects.toThrow("expected JSON response");
  });

  it("handles network errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));

    await expect(triggerDeploy({ hookUrl: VALID_URL })).rejects.toThrow("network error");
  });

  it("handles request timeout", async () => {
    // Simulate a fetch that never resolves until aborted
    vi.stubGlobal("fetch", (_url: string, options: RequestInit) => {
      return new Promise((_resolve, reject) => {
        options.signal?.addEventListener("abort", () => {
          reject(new DOMException("The operation was aborted.", "AbortError"));
        });
      });
    });

    await expect(triggerDeploy({ hookUrl: VALID_URL, timeoutMs: 100 })).rejects.toThrow(
      "timed out",
    );
  });

  it("appends buildCache=false when noBuildCache is true", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      mockVercelResponse({
        job: { id: "job-123", state: "PENDING", createdAt: Date.now() },
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    await triggerDeploy({ hookUrl: VALID_URL, noBuildCache: true });
    expect(mockFetch).toHaveBeenCalledWith(
      `${VALID_URL}?buildCache=false`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("sends POST without body (Vercel hooks do not use body)", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      mockVercelResponse({
        job: { id: "job-456", state: "PENDING", createdAt: Date.now() },
      }),
    );
    vi.stubGlobal("fetch", mockFetch);

    await triggerDeploy({ hookUrl: VALID_URL });
    const callArgs = mockFetch.mock.calls[0][1];
    expect(callArgs.method).toBe("POST");
  });
});
