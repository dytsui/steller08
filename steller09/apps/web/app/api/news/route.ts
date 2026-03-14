import { NextResponse } from "next/server";
import { appEnv } from "@/lib/env";

export async function GET(){
  if (!appEnv.server.newsApiBase) return NextResponse.json({ items: [] });
  try {
    const r = await fetch(appEnv.server.newsApiBase);
    return NextResponse.json({ raw: (await r.text()).slice(0, 1200) });
  } catch { return NextResponse.json({ items: [] }); }
}
