export interface DeployConfig {
  /** The Vercel deploy hook URL */
  hookUrl: string;
  /** Disable build cache (appends ?buildCache=false) */
  noBuildCache?: boolean;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
}

export interface DeployResult {
  /** Vercel job ID */
  jobId: string;
  /** Deployment state (PENDING, QUEUED, etc.) */
  state: string;
  /** ISO timestamp of creation */
  createdAt: string;
}

export interface VercelJobResponse {
  job: {
    id: string;
    state: string;
    createdAt: number;
  };
}

export interface DeployError {
  message: string;
  status?: number;
  hookUrl?: string;
}
