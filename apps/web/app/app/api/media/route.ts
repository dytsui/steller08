import { NextResponse } from 'next/server';
import { getSessionForScope } from '@/lib/d1';
import { readMedia, type MediaBucket } from '@/lib/r2';
import { getRequestScope } from '@/lib/scope';

function inferSessionId(bucket: MediaBucket, key: string) {
  if (bucket === 'VIDEOS' || bucket === 'KEYFRAMES') return key.split('/')[0] ?? '';
  if (bucket === 'SHARES' || bucket === 'EXPORTS') {
    const root = key.split('/').at(-1) ?? key;
    return root.replace(/-card\.[a-z0-9]+$/i, '').replace(/\.[a-z0-9]+$/i, '');
  }
  return '';
}

export async function GET(request: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const bucket = (url.searchParams.get('bucket') ?? 'VIDEOS') as MediaBucket;
  if (!key) return NextResponse.json({ error: 'missing_key' }, { status: 400 });

  const sessionId = inferSessionId(bucket, key);
  if (!sessionId) return NextResponse.json({ error: 'invalid_media_key' }, { status: 400 });

  const session = await getSessionForScope(sessionId, scope);
  if (!session) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const object = await readMedia(bucket, key);
  if (!object) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  return new Response(object.body, { headers });
}
