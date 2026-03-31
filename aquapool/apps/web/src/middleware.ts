import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = [
  '/', '/login', '/register', '/signin', '/playblock', '/about',
  '/markets', '/crypto', '/stocks', '/defi', '/earn', '/send',
];
const AUTH_PATHS = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for auth token in cookie (set by the client-side auth store)
  const hasAuth = request.cookies.has('aquapool-auth') ||
    request.headers.get('authorization')?.startsWith('Bearer ');

  // Redirect authenticated users away from login/register
  if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && hasAuth) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirect unauthenticated users away from dashboard routes
  const isDashboard = !PUBLIC_PATHS.includes(pathname) &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next');

  if (isDashboard && !hasAuth) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
