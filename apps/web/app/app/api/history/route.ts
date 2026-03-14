import { NextResponse } from 'next/server';
import { getGrowth, listHistory } from '@/lib/d1';
import { getRequestScope } from '@/lib/scope';

export async function GET(request: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ history: [], growth: [] });

  const url = new URL(request.url);
  const studentId = url.searchParams.get('studentId') ?? undefined;
  const history = await listHistory(studentId, scope);
  const growth = studentId ? await getGrowth(studentId, scope) : [];
  return NextResponse.json({ history, growth });
}
