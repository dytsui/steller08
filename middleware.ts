import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, parseSessionCookie } from '@/lib/auth';

const protectedPrefixes = ['/app', '/pro', '/analysis'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!protectedPrefixes.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const payload = parseSessionCookie(request.cookies.get(AUTH_COOKIE_NAME)?.value ?? null);
  if (!payload) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/pro') && payload.role !== 'pro' && payload.role !== 'admin') {
    return NextResponse.redirect(new URL('/app', request.url));
  }

  if (pathname.startsWith('/app') && (payload.role === 'pro' || payload.role === 'admin')) {
    return NextResponse.redirect(new URL('/pro', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/app/:path*', '/pro/:path*', '/analysis/:path*']
};
