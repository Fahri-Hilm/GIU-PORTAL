'use client';

import { useState } from 'react';
import { User, Save, Trash2, Eye, EyeOff, Shield, Database, RotateCcw, LogOut } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input, Label } from '@/components/ui/form';
import { AvatarName } from '@/components/ui/avatar';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { mockStore } from '@/lib/mock/store';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const cursorGlow = useUIStore((s) => s.cursorGlow);
  const setCursorGlow = useUIStore((s) => s.setCursorGlow);
  const router = useRouter();
  const [name, setName] = useState(user?.full_name ?? '');
  const [rank, setRank] = useState(user?.rank ?? '');

  const handleSave = () => {
    toast.success('Preferensi disimpan (lokal)');
  };

  const handleResetMock = () => {
    if (!confirm('Reset semua data mock ke kondisi awal? Perubahan akan hilang.')) return;
    mockStore.reset();
    toast.success('Data mock direset');
    setTimeout(() => window.location.reload(), 500);
  };

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await signOut();
    router.push('/login');
  };

  return (
    <div className="p-gutter-md space-y-gutter-md max-w-3xl mx-auto">
      <div className="opacity-0 animate-fade-slide-up" style={{ animationFillMode: 'forwards' }}>
        <p className="font-data-mono text-data-mono text-on-surface-muted">PREFERENSI OPERATOR</p>
        <h1 className="font-display-lg text-display-lg text-on-surface mt-1">Pengaturan</h1>
      </div>

      <Card className="opacity-0 animate-fade-slide-up stagger-1">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Profil Operator</CardTitle>
          <CardDescription>Informasi yang ditampilkan di sidebar dan header.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <AvatarName name={user?.full_name ?? 'Operator'} src={user?.avatar_url} className="w-16 h-16" />
            <div>
              <p className="font-body-md text-sm text-on-surface">{user?.full_name}</p>
              <p className="font-data-mono text-data-mono text-on-surface-muted">{user?.email}</p>
              <p className="font-label-caps text-[10px] text-primary mt-1">{user?.rank?.toUpperCase()} · {user?.role?.toUpperCase()}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nama Lengkap</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <Label>Pangkat</Label>
              <Input value={rank} onChange={(e) => setRank(e.target.value)} />
            </div>
          </div>
          <Button onClick={handleSave}><Save className="w-4 h-4" /> SIMPAN PROFIL</Button>
        </CardContent>
      </Card>

      <Card className="opacity-0 animate-fade-slide-up stagger-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Tampilan</CardTitle>
          <CardDescription>Kontrol efek visual antarmuka.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border-steel bg-surface-gunmetal/30">
            <div>
              <p className="font-body-md text-sm text-on-surface">Cursor Glow</p>
              <p className="font-data-mono text-data-mono text-on-surface-muted mt-0.5">Efek cahaya mengikuti kursor</p>
            </div>
            <Button variant={cursorGlow ? 'default' : 'outline'} size="icon" onClick={() => setCursorGlow(!cursorGlow)}>
              {cursorGlow ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="opacity-0 animate-fade-slide-up stagger-3">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2"><Database className="w-4 h-4 text-primary" /> Sistem Data</CardTitle>
          <CardDescription>
            Mode: <span style={{ color: isSupabaseConfigured ? 'var(--color-status-active)' : 'var(--color-threat-medium)' }}>{isSupabaseConfigured ? 'Supabase Live' : 'Mock (localStorage)'}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!isSupabaseConfigured && (
            <div className="p-3 rounded-lg border border-threat-medium/40 bg-threat-medium/10">
              <p className="font-label-caps text-[10px] text-threat-medium mb-1">KONFIGURASI SUPABASE</p>
              <p className="font-body-md text-xs text-on-surface-variant mb-2">
                Isi <code className="font-data-mono text-primary">NEXT_PUBLIC_SUPABASE_URL</code> dan <code className="font-data-mono text-primary">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> di <code className="font-data-mono text-primary">.env.local</code>, lalu jalankan migration SQL di <code className="font-data-mono text-primary">supabase/migrations/0001_init.sql</code>.
              </p>
            </div>
          )}
          {!isSupabaseConfigured && (
            <Button variant="outline" onClick={handleResetMock} className="w-full">
              <RotateCcw className="w-4 h-4" /> RESET DATA MOCK KE AWAL
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="opacity-0 animate-fade-slide-up stagger-4 border-threat-critical/30">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2 text-threat-critical"><Shield className="w-4 h-4" /> Sesi &amp; Keamanan</CardTitle>
          <CardDescription>Akhiri sesi operasional saat ini.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={handleSignOut} className="w-full">
            <LogOut className="w-4 h-4" /> KELUAR DARI PORTAL
          </Button>
        </CardContent>
      </Card>

      <p className="text-center font-data-mono text-data-mono text-on-surface-muted py-4">
        GIU INTELLIGENCE PORTAL · v1.0.0 · KLASIFIKASI RAHASIA
      </p>
    </div>
  );
}
