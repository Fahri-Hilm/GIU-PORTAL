import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfiguredServer, createServiceRoleClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  if (!isSupabaseConfiguredServer) {
    return NextResponse.json({ error: 'Supabase tidak terkonfigurasi' }, { status: 500 });
  }
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'ID anggota wajib' }, { status: 400 });
    const sb = createServiceRoleClient();
    await sb.auth.admin.deleteUser(id);
    await sb.from('profiles').delete().eq('id', id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Gagal menghapus anggota';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
