import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfiguredServer, createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(_request: NextRequest) {
  if (isSupabaseConfiguredServer) {
    const sb = await createSupabaseServerClient();
    if (sb) await sb.auth.signOut();
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.delete('giu_mock_auth');
  return res;
}
