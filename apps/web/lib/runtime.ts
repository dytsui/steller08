import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface WorkerEnv {
  DB: D1Database;
  VIDEOS: R2Bucket;
  KEYFRAMES: R2Bucket;
  SHARES: R2Bucket;
  EXPORTS: R2Bucket;
}

export function getRuntimeEnv(): WorkerEnv {
  const { env } = getCloudflareContext();
  return env as WorkerEnv;
}
