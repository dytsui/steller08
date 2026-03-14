import { NextResponse } from "next/server";
import { exec } from "@/lib/db";
import { getRuntimeEnv } from "@/lib/runtime";
import { getRequestScope } from "@/lib/scope";
import { nowIso, uid } from "@/lib/utils";

export async function POST(req: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json()) as { sessionId: string; channel?: string };
  const shareKey = uid("share");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='480' height='300'><rect width='100%' height='100%' fill='#0a0'/><text x='24' y='80' fill='white'>Steller09 Session ${body.sessionId}</text></svg>`;
  await getRuntimeEnv().SHARES.put(`share/${shareKey}.svg`, svg, { httpMetadata: { contentType: "image/svg+xml" } });
  await exec("UPDATE sessions SET share_key=?, updated_at=? WHERE id=?", [shareKey, nowIso(), body.sessionId]);
  await exec("INSERT INTO share_logs (session_id, channel, share_key, created_at) VALUES (?, ?, ?, ?)", [body.sessionId, body.channel ?? "link", shareKey, nowIso()]);
  return NextResponse.json({ shareKey });
}
