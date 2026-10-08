import { NextRequest, NextResponse } from 'next/server';

// UX guard only: redirects visitors without a session cookie. The API enforces real authorization on every request.
export function middleware(req: NextRequest) {
  if (req.nextUrl.pathname === '/admin/login' || req.cookies.has('admin_session')) return NextResponse.next();
  return NextResponse.redirect(new URL('/admin/login', req.url));
}
export const config = { matcher: ['/admin/:path*'] };
