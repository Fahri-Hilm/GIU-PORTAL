import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfiguredServer, createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfiguredServer) {
    return NextResponse.json({ error: 'Signup tidak tersedia di mode mock' }, { status: 400 });
  }
  const sb = await createSupabaseServerClient();
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  const body = await request.json();
  const { email, password, full_name, codename, rank, role } = body;
  if (!email || !password) {
    return NextResponse.json({ error: 'Email dan password wajib' }, { status: 400 });
  }
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: full_name ?? 'Operator',
        codename: codename ?? null,
        rank: rank ?? 'Analyst',
        role: role ?? 'analyst',
      },
    },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, user: data.user });
}
