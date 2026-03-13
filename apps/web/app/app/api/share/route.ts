import { NextResponse } from 'next/server';
import { createShareLog, getAnalysis, getSessionForScope, updateSessionShareKey } from '@/lib/d1';
import { makeShareKey, uploadMedia } from '@/lib/r2';
import { getRequestScope } from '@/lib/scope';

function buildShareSvg(score: number, tempo: number, issues: string[]) {
  const safeIssues = issues.slice(0, 3).map((issue, idx) => `<text x="48" y="${170 + idx * 34}" font-size="22" fill="#f4f0ff">• ${issue}</text>`).join('');
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs>
      <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
        <stop offset="0%" stop-color="#0d0916" />
        <stop offset="100%" stop-color="#29133d" />
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)" rx="42" />
    <text x="48" y="96" font-size="40" fill="#c5a3ff" font-weight="700">Steller08 挥杆摘要卡</text>
    <text x="48" y="150" font-size="84" fill="#ffffff" font-weight="700">评分 ${score}</text>
    <text x="380" y="150" font-size="42" fill="#d7cbf1">Tempo ${tempo}</text>
    ${safeIssues}
    <text x="48" y="576" font-size="24" fill="#a79bc4">Structured analysis first · AI report last</text>
  </svg>`;
}

export async function POST(request: Request) {
  const scope = await getRequestScope();
  if (!scope) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await request.json() as { sessionId: string; channel: string };
  const session = await getSessionForScope(body.sessionId, scope);
  if (!session) return NextResponse.json({ error: 'session_not_found' }, { status: 404 });

  const analysis = await getAnalysis(body.sessionId);
  if (!analysis) return NextResponse.json({ error: 'analysis_not_found' }, { status: 404 });

  const summaryKey = makeShareKey(body.sessionId, 'json');
  const cardKey = makeShareKey(`${body.sessionId}-card`, 'svg');
  const payload = JSON.stringify({
    sessionId: analysis.sessionId,
    score: analysis.score,
    tempoRatio: analysis.tempoRatio,
    topIssues: analysis.issues.slice(0, 3)
  }, null, 2);
  const svg = buildShareSvg(analysis.score, analysis.tempoRatio, analysis.issues.map((item) => item.titleZh));

  await uploadMedia('SHARES', summaryKey, new TextEncoder().encode(payload), 'application/json');
  await uploadMedia('SHARES', cardKey, new TextEncoder().encode(svg), 'image/svg+xml');
  await updateSessionShareKey(body.sessionId, summaryKey);
  await createShareLog(body.sessionId, body.channel, summaryKey);

  return NextResponse.json({
    shareKey: summaryKey,
    cardKey,
    shareUrl: `/api/media?bucket=SHARES&key=${encodeURIComponent(summaryKey)}`,
    cardUrl: `/api/media?bucket=SHARES&key=${encodeURIComponent(cardKey)}`
  });
}
