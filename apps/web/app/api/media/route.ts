import { NextResponse } from "next/server";
import { readMedia, type MediaBucket } from "@/lib/r2";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get("key");
  const bucket = (url.searchParams.get("bucket") ?? "VIDEOS") as MediaBucket;
  if (!key) return NextResponse.json({ error: "missing_key" }, { status: 400 });
  const object = await readMedia(bucket, key);
  if (!object) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  return new Response(object.body, { headers });
}
