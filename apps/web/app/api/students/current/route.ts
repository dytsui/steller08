import { NextResponse } from 'next/server';
import { listStudents } from '@/lib/d1';

export async function GET() {
  const students = await listStudents();
  return NextResponse.json({ student: students[0] ?? null });
}
