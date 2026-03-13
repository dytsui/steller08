import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentSessionPayload } from '@/lib/auth';
import { getStudentForScope, listStudents } from '@/lib/d1';

const COOKIE = 'steller08_current_student';

function scopeFromPayload(payload: Awaited<ReturnType<typeof getCurrentSessionPayload>>) {
  if (!payload) return null;
  if (payload.role === 'admin') return { role: 'admin' as const, userId: payload.userId };
  if (payload.role === 'pro') return { role: 'pro' as const, userId: payload.userId };
  return { role: 'user' as const, userId: payload.userId };
}

export async function GET() {
  const payload = await getCurrentSessionPayload();
  const scope = scopeFromPayload(payload);
  if (!scope) return NextResponse.json({ student: null });
  const cookieStore = await cookies();
  const fromCookie = cookieStore.get(COOKIE)?.value ?? '';
  if (fromCookie) {
    const student = await getStudentForScope(fromCookie, scope);
    if (student) return NextResponse.json({ student });
  }
  const students = await listStudents(scope);
  return NextResponse.json({ student: students[0] ?? null });
}
