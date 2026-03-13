import { NextResponse } from 'next/server';
import { createSession, getSessionForScope, getStudentForScope } from '@/lib/d1';
import { makeVideoKey, uploadMedia } from '@/lib/r2';
import { getRequestScope } from '@/lib/scope';
import { makeId } from '@/lib/utils';
import type { AnalysisSource, SessionRecord } from '@/lib/types';

export async function POST(request: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const studentId = String(formData.get('studentId') ?? '');
  const sourceType = String(formData.get('sourceType') ?? 'upload') as AnalysisSource;
  const durationMs = Number(formData.get('durationMs') ?? 0) || undefined;
  const sourceWidth = Number(formData.get('sourceWidth') ?? 0) || undefined;
  const sourceHeight = Number(formData.get('sourceHeight') ?? 0) || undefined;
  const title = String(formData.get('title') ?? '').trim() || null;

  if (!file || !studentId) {
    return NextResponse.json({ error: 'missing_file_or_student' }, { status: 400 });
  }

  const student = await getStudentForScope(studentId, scope);
  if (!student) return NextResponse.json({ error: 'student_forbidden' }, { status: 403 });

  const sessionId = makeId('ses');
  const videoKey = makeVideoKey(sessionId, file.name || 'swing.mp4');
  await uploadMedia('VIDEOS', videoKey, await file.arrayBuffer(), file.type || 'video/mp4');

  const now = new Date().toISOString();
  const session: SessionRecord & { title?: string | null; screenMode?: boolean; durationMs?: number; sourceWidth?: number; sourceHeight?: number } = {
    id: sessionId,
    studentId,
    sourceType,
    status: 'created',
    videoKey,
    shareKey: null,
    createdAt: now,
    updatedAt: now,
    title,
    screenMode: sourceType.startsWith('screen'),
    durationMs,
    sourceWidth,
    sourceHeight
  };
  await createSession(session);
  return NextResponse.json({ session });
}

export async function GET(request: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'missing_id' }, { status: 400 });

  const session = await getSessionForScope(id, scope);
  if (!session) return NextResponse.json({ error: 'session_not_found' }, { status: 404 });
  return NextResponse.json({ session });
}
