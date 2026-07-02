import { NextResponse, type NextRequest } from 'next/server';
import { isSupabaseConfiguredServer, createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfiguredServer) {
    return NextResponse.json({ error: 'Tidak tersedia di mode mock' }, { status: 400 });
  }
  const sb = await createSupabaseServerClient();
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const { id } = await params;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await sb.from('profiles').select('role').eq('id', id).single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 });
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

  const allowedTypes = ['image/webp', 'image/png', 'image/jpeg'];
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ error: 'Invalid file type. Allowed: WebP, PNG, JPEG' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large. Max: 5MB' }, { status: 413 });
  }

  const filename = `${id}-${Date.now()}.webp`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { data: existing } = await sb.from('profiles').select('portrait_url').eq('id', id).single();
  if (existing?.portrait_url) {
    const oldPath = existing.portrait_url.split('/').pop();
    if (oldPath) {
      await sb.storage.from('character-portraits').remove([oldPath]);
    }
  }

  const { error: uploadError } = await sb.storage.from('character-portraits').upload(filename, buffer, {
    contentType: file.type,
    upsert: true,
  });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = sb.storage.from('character-portraits').getPublicUrl(filename);
  const publicUrl = urlData.publicUrl;

  const { error: updateError } = await sb.from('profiles').update({ portrait_url: publicUrl }).eq('id', id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ portrait_url: publicUrl });
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!isSupabaseConfiguredServer) {
    return NextResponse.json({ error: 'Tidak tersedia di mode mock' }, { status: 400 });
  }
  const sb = await createSupabaseServerClient();
  if (!sb) return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });

  const { id } = await params;
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await sb.from('profiles').select('role, portrait_url').eq('id', id).single();
  if (!profile || profile.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 });
  }

  if (profile.portrait_url) {
    const oldPath = profile.portrait_url.split('/').pop();
    if (oldPath) {
      await sb.storage.from('character-portraits').remove([oldPath]);
    }
  }

  const { error } = await sb.from('profiles').update({ portrait_url: null }).eq('id', id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
