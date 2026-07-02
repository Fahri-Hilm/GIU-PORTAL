import { updateSession } from '@/lib/supabase/middleware';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return await updateSession(request);
  }
  return updateMockSession(request);
}

function updateMockSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthed = request.cookies.get('giu_mock_auth')?.value === '1';
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isApi = pathname.startsWith('/api');
  const isPublicAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.match(/\.(ico|png|jpg|jpeg|webp|svg|css|js|woff|woff2)$/);

  if (isPublicAsset || isApi) return;
  if (!isAuthed && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return Response.redirect(url);
  }
  if (isAuthed && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return Response.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
};
