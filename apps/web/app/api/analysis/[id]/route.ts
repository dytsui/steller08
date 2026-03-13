import { NextResponse } from 'next/server';
import { getAnalysis, getSessionForScope, getStudentForScope } from '@/lib/d1';
import { getRequestScope } from '@/lib/scope';

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { id } = await params;
  const session = await getSessionForScope(id, scope);
  if (!session) return NextResponse.json({ error: 'session_not_found' }, { status: 404 });

  const analysis = await getAnalysis(id);
  const student = await getStudentForScope(session.studentId, scope);
  return NextResponse.json({ analysis, session, student });
}
