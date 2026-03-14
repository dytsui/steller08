import { NextResponse } from "next/server";
import { appEnv } from "@/lib/env";

export async function GET() {
  if (!appEnv.server.newsApiBase) return NextResponse.json({ items: [] });
  try {
    const res = await fetch(appEnv.server.newsApiBase);
    const text = await res.text();
    return NextResponse.json({ raw: text.slice(0, 1000) });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
