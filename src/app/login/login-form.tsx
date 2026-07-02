'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/form';
import { useAuthStore } from '@/stores/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { toast } from 'sonner';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') ?? '/dashboard';
  const signIn = useAuthStore((s) => s.signIn);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  const [email, setEmail] = useState(isSupabaseConfigured ? '' : 'analyst@giu.sa');
  const [password, setPassword] = useState(isSupabaseConfigured ? '' : 'giuportal');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && user) router.replace(next);
  }, [initialized, user, router, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(email, password);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? 'Gagal masuk');
      }
      toast.success('Akses diberikan', { description: 'Selamat datang kembali, Operator.' });
      router.replace(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="glass-panel rounded-2xl p-8 shadow-2xl opacity-0 animate-fade-slide-up" style={{ animationFillMode: 'forwards' }}>
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-xl bg-surface-gunmetal/80 border border-border-steel flex items-center justify-center shadow-[0_0_30px_rgba(230,195,131,0.2)] relative">
            <Shield className="text-primary w-8 h-8" />
            <div className="absolute -inset-1 rounded-xl border border-primary/20 animate-pulse-ring" />
          </div>
          <div className="text-center">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">PORTAL INTELIJEN GIU</h1>
            <p className="font-data-mono text-data-mono text-on-surface-variant mt-1">
              MARKAS KOMANDO STRATEGIS · SAN ANDREAS
            </p>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-6 p-3 rounded-md border border-threat-medium/40 bg-threat-medium/10 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-threat-medium mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="font-label-caps text-[10px] text-threat-medium">MODE DEMO</p>
              <p className="font-body-md text-xs text-on-surface-variant mt-1">
                Supabase belum dikonfigurasi. Gunakan kredensial default untuk masuk (email &amp; password apa pun diterima).
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="email">Identitas Operator</Label>
            <div className="relative">
              <Mail className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@giu.sa"
                className="pl-9"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="password">Kode Akses</Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 pr-9"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-primary transition-smooth cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-md border border-threat-critical/40 bg-threat-critical/10 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-threat-critical mt-0.5 shrink-0" />
              <p className="font-body-md text-xs text-threat-critical">{error}</p>
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full" size="lg">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                MEMVERIFIKASI...
              </>
            ) : (
              'BERI AKSES'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-steel/60 flex items-center justify-between">
          <p className="font-data-mono text-data-mono text-on-surface-muted">SISTEM: OPERASIONAL</p>
          <p className="font-data-mono text-data-mono text-on-surface-muted">v1.0.0 · KLASIFIKASI</p>
        </div>
      </div>

      <p className="text-center mt-6 font-data-mono text-data-mono text-on-surface-muted opacity-0 animate-fade-slide-up" style={{ animationDelay: '0.3s', animationFillMode: 'forwards' }}>
        AKSES TIDAK DIOTORISASI DILARANG · PELANGGARAN AKAN DITINDAK
      </p>
    </div>
  );
}
