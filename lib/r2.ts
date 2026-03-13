import { getEnv } from "@/lib/cloudflare";

export type MediaBucket = "VIDEOS" | "KEYFRAMES" | "SHARES" | "EXPORTS";

function bucket(name: MediaBucket) {
  return getEnv()[name];
}

export async function uploadMedia(bucketName: MediaBucket, key: string, blob: Blob | ArrayBuffer | Uint8Array, contentType?: string) {
  await bucket(bucketName).put(key, blob, {
    httpMetadata: contentType ? { contentType } : undefined
  });
  return key;
}

export async function readMedia(bucketName: MediaBucket, key: string) {
  return bucket(bucketName).get(key);
}

export function makeVideoKey(sessionId: string, filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${sessionId}/${safe}`;
}

export function makeKeyframeKey(sessionId: string, label: string) {
  return `${sessionId}/${label}.jpg`;
}

export function makeShareKey(sessionId: string, suffix = 'json') {
  return `${sessionId}.${suffix}`;
}

export function makeExportKey(sessionId: string, suffix = 'json') {
  return `${sessionId}.${suffix}`;
}
