import { NextResponse } from 'next/server';
import { fetchChineseGolfNews } from '@/lib/news';

export async function GET() {
  const payload = await fetchChineseGolfNews();
  return NextResponse.json(payload);
}
