import { describe, it, expect, vi, beforeEach } from 'vitest';
import { triggerDeploy } from './deploy';

const VALID_URL = 'https://api.vercel.com/v1/integrations/deploy/mysite/hook/abc123';

describe('triggerDeploy', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('throws when hookUrl is missing', async () => {
    await expect(triggerDeploy({ hookUrl: '' })).rejects.toThrow('hookUrl is required');
  });

  it('throws when hookUrl is not a valid URL', async () => {
    await expect(triggerDeploy({ hookUrl: 'not-a-url' })).rejects.toThrow('must be a valid URL');
  });

  it('throws when hookUrl is not a Vercel URL', async () => {
    await expect(triggerDeploy({ hookUrl: 'https://example.com/hook' })).rejects.toThrow('must be a Vercel deploy hook URL');
  });

  it('returns result on successful deploy', async () => {
    const mockResponse = {
      ok: true,
      json: async () => ({
        jobId: 'job-123',
        status: 'QUEUED',
        createdAt: '2026-04-01T00:00:00Z',
      }),
    };
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(mockResponse));

    const result = await triggerDeploy({ hookUrl: VALID_URL });
    expect(result.jobId).toBe('job-123');
    expect(result.status).toBe('QUEUED');
    expect(result.createdAt).toBe('2026-04-01T00:00:00Z');
  });

  it('sends name in request body', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ jobId: 'job-456', status: 'QUEUED' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await triggerDeploy({ hookUrl: VALID_URL, name: 'test-build' });
    expect(mockFetch).toHaveBeenCalledWith(VALID_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'test-build' }),
    });
  });

  it('throws on non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ error: { message: 'Unauthorized' } }),
    }));

    await expect(triggerDeploy({ hookUrl: VALID_URL })).rejects.toThrow('Unauthorized');
  });

  it('handles network errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')));

    await expect(triggerDeploy({ hookUrl: VALID_URL })).rejects.toThrow('network error');
  });

  it('uses default name when not provided', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ jobId: 'job-789' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    await triggerDeploy({ hookUrl: VALID_URL });
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.name).toBe('deploy-hook');
  });
});
