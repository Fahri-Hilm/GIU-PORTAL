import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfiguredServer, createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  if (isSupabaseConfiguredServer) {
    const sb = await createSupabaseServerClient();
    if (sb) {
      const body = await request.json();
      const { error } = await sb.auth.signInWithPassword(body);
      if (error) return NextResponse.json({ error: error.message }, { status: 401 });
      return NextResponse.json({ ok: true });
    }
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set('giu_mock_auth', '1', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  });
  return res;
}
