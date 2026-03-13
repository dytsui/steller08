import { NextResponse } from 'next/server';
import { getCurrentSessionPayload } from '@/lib/auth';
import { getAnalysis, listHistory } from '@/lib/d1';
import { deriveTrainingPlan } from '@/lib/training';

function scopeFromPayload(payload: Awaited<ReturnType<typeof getCurrentSessionPayload>>) {
  if (!payload) return null;
  if (payload.role === 'admin') return { role: 'admin' as const, userId: payload.userId };
  if (payload.role === 'pro') return { role: 'pro' as const, userId: payload.userId };
  return { role: 'user' as const, userId: payload.userId };
}

export async function GET(request: Request) {
  const payload = await getCurrentSessionPayload();
  const scope = scopeFromPayload(payload);
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const url = new URL(request.url);
  const studentId = url.searchParams.get('studentId') ?? '';
  if (!studentId) return NextResponse.json({ error: 'missing_student_id' }, { status: 400 });
  const history = await listHistory(studentId, scope);
  const latest = history.find((item) => item.status === 'completed') ?? history[0];
  if (!latest) return NextResponse.json({ training: null, history: [] });
  const analysis = await getAnalysis(latest.id);
  return NextResponse.json({ training: analysis ? deriveTrainingPlan(analysis) : null, history });
}
