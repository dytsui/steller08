import { NextResponse } from 'next/server';
import { getAnalysis } from '@/lib/d1';
import { deriveTrainingPlan } from '@/lib/training';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const analysis = await getAnalysis(id);
  if (!analysis) return NextResponse.json({ error: 'analysis_not_found' }, { status: 404 });
  return NextResponse.json({ training: deriveTrainingPlan(analysis) });
}
