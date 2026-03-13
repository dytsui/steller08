import { getCloudflareContext } from "@opennextjs/cloudflare";

type D1Binding = any;
type R2Binding = any;

export type CloudflareEnv = {
  DB: D1Binding;
  VIDEOS: R2Binding;
  KEYFRAMES: R2Binding;
  SHARES: R2Binding;
  EXPORTS: R2Binding;
  NEXT_PUBLIC_APP_URL?: string;
  NEXT_PUBLIC_DEFAULT_LOCALE?: string;
  ANALYZER_BASE_URL?: string;
  ANALYZER_TOKEN?: string;
  GEMINI_API_KEY?: string;
  GEMINI_MODEL?: string;
  GEMINI_API_BASE?: string;
  NEWS_API_BASE?: string;
  AUTH_SECRET?: string;
};

export function getEnv() {
  return getCloudflareContext().env as CloudflareEnv;
}
