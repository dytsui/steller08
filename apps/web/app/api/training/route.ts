import { NextResponse } from 'next/server';
import { getAnalysis, listHistory } from '@/lib/d1';
import { deriveTrainingPlan } from '@/lib/training';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const studentId = url.searchParams.get('studentId') ?? '';
  if (!studentId) return NextResponse.json({ error: 'missing_student_id' }, { status: 400 });
  const history = await listHistory(studentId);
  const latest = history[0];
  if (!latest) return NextResponse.json({ training: null, history: [] });
  const analysis = await getAnalysis(latest.id);
  return NextResponse.json({ training: analysis ? deriveTrainingPlan(analysis) : null, history });
}
