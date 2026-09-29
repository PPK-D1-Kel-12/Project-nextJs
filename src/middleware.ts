import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

function redirectWithCookies(targetUrl: URL, originalResponse: NextResponse) {
  const redirectRes = NextResponse.redirect(targetUrl);
  originalResponse.cookies.getAll().forEach((cookie) => {
    redirectRes.cookies.set(cookie.name, cookie.value, cookie);
  });
  return redirectRes;
}

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  const { pathname } = request.nextUrl;

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/transactions');

  // Root path: redirect ke /dashboard jika sudah login, atau /login jika belum
  if (pathname === '/') {
    const targetUrl = request.nextUrl.clone();
    targetUrl.pathname = user ? '/dashboard' : '/login';
    return redirectWithCookies(targetUrl, response);
  }

  // Protected routes: wajib login (SRS-03)
  if (isProtectedRoute && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    if (pathname !== '/dashboard') {
      loginUrl.searchParams.set('redirectTo', pathname);
    }
    return redirectWithCookies(loginUrl, response);
  }

  // Auth routes (/login, /register): cegah user yang sudah login mengaksesnya kembali
  if (isAuthRoute && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return redirectWithCookies(dashboardUrl, response);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, jpeg, gif, webp)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
