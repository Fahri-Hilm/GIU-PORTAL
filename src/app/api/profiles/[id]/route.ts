import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfiguredServer, createSupabaseServerClient, createServiceRoleClient } from '@/lib/supabase/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfiguredServer) {
    return NextResponse.json({ error: 'Tidak tersedia di mode mock' }, { status: 400 });
  }
  const sb = await createSupabaseServerClient();
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const { id } = await params;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: currentUser } = await sb.from('profiles').select('role').eq('id', user.id).single();
  if (!currentUser || currentUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 });
  }

  const body = await request.json();
  const update: Record<string, unknown> = {};
  if (typeof body.full_name === 'string') update.full_name = body.full_name;
  if (body.codename !== undefined) update.codename = body.codename?.trim() || null;
  if (typeof body.rank === 'string') update.rank = body.rank;
  if (typeof body.role === 'string' && ['admin', 'commander', 'analyst'].includes(body.role)) update.role = body.role;

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
  }

  const serviceClient = createServiceRoleClient();
  const { error } = await serviceClient.from('profiles').update(update).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
