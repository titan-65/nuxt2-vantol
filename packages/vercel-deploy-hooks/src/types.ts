export interface DeployConfig {
  /** The Vercel deploy hook URL */
  hookUrl: string;
  /** Optional label for this deployment */
  name?: string;
}

export interface DeployResult {
  /** Vercel job ID */
  jobId: string;
  /** Deployment status */
  status: string;
  /** ISO timestamp of creation */
  createdAt: string;
}

export interface DeployError {
  message: string;
  status?: number;
  hookUrl?: string;
}
