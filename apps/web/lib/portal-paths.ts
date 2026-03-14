export function portalFromRole(role: string | null | undefined) {
  return role === 'pro' || role === 'admin' ? 'pro' : 'app';
}

export function analysisPathForPortal(
  portal: 'app' | 'pro' | 'public',
  sessionId: string,
) {
  if (portal === 'pro') return `/pro/analysis/${sessionId}`;
  if (portal === 'app') return `/app/analysis/${sessionId}`;
  return `/analysis/${sessionId}`;
}

export function studentPathForPortal(portal: 'app' | 'pro', studentId: string) {
  return portal === 'pro' ? `/pro/students/${studentId}` : '/app/profile';
}
