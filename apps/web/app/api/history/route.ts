import { NextResponse } from "next/server";
import { getCurrentSessionPayload } from '@/lib/auth';
import { getGrowth, listHistory } from "@/lib/d1";

function scopeFromPayload(payload: Awaited<ReturnType<typeof getCurrentSessionPayload>>) {
  if (!payload) return null;
  if (payload.role === 'admin') return { role: 'admin' as const, userId: payload.userId };
  if (payload.role === 'pro') return { role: 'pro' as const, userId: payload.userId };
  return { role: 'user' as const, userId: payload.userId };
}

export async function GET(request: Request) {
  const payload = await getCurrentSessionPayload();
  const scope = scopeFromPayload(payload);
  if (!scope) return NextResponse.json({ history: [], growth: [] });
  const url = new URL(request.url);
  const studentId = url.searchParams.get("studentId") ?? undefined;
  const history = await listHistory(studentId, scope);
  const growth = studentId ? await getGrowth(studentId, scope) : [];
  return NextResponse.json({ history, growth });
}
