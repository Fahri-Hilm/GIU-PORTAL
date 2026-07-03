import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfiguredServer, createServiceRoleClient, createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfiguredServer) {
    return NextResponse.json({ error: 'Tidak tersedia di mode mock' }, { status: 400 });
  }
  const sb = await createSupabaseServerClient();
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: currentUser } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 });
  }

  const body = await request.json();
  const { email, password, full_name, codename, rank, role } = body;
  if (!email || !password || !full_name) {
    return NextResponse.json({ error: 'Email, password, full_name wajib' }, { status: 400 });
  }

  const serviceClient = createServiceRoleClient();
  const { data, error } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name,
      codename: codename ?? null,
      rank: rank ?? 'Analyst',
      role: role ?? 'analyst',
    },
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ ok: true, user_id: data.user?.id });
}
