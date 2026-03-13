import { NextResponse } from 'next/server';
import { getAnalysis, getSessionForScope, writeAnalysis } from '@/lib/d1';
import { generateReport } from '@/lib/report';
import { getRequestScope } from '@/lib/scope';

export async function POST(request: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json() as { sessionId: string };
  const session = await getSessionForScope(body.sessionId, scope);
  if (!session) return NextResponse.json({ error: 'session_not_found' }, { status: 404 });

  const analysis = await getAnalysis(body.sessionId);
  if (!analysis) return NextResponse.json({ error: 'analysis_not_found' }, { status: 404 });
  const report = await generateReport(analysis);
  analysis.reportZh = report.zh;
  analysis.reportEn = report.en;
  await writeAnalysis(analysis);
  return NextResponse.json(report);
}
