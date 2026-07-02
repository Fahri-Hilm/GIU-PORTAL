'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, Loader2, AlertTriangle, Eye, EyeOff, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/form';
import { useAuthStore } from '@/stores/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { toast } from 'sonner';
import Link from 'next/link';

export function SignupForm() {
  const router = useRouter();
  const signIn = useAuthStore((s) => s.signIn);
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized && user) router.replace('/dashboard');
  }, [initialized, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!isSupabaseConfigured) {
      setError('Signup membutuhkan Supabase. Hubungi administrator.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error ?? 'Gagal daftar');
      toast.success('Akun dibuat. Silakan masuk.');
      router.push('/login');
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
          <div className="w-16 h-16 rounded-xl bg-surface-gunmetal/80 border border-border-steel flex items-center justify-center shadow-[0_0_30px_rgba(230,195,131,0.2)]">
            <Shield className="text-primary w-8 h-8" />
          </div>
          <div className="text-center">
            <h1 className="font-headline-lg text-headline-lg text-primary tracking-tight">PENDAFTARAN OPERATOR</h1>
            <p className="font-data-mono text-data-mono text-on-surface-variant mt-1">
              MARKAS KOMANDO STRATEGIS · SAN ANDREAS
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="fullname">Nama Lengkap</Label>
            <div className="relative">
              <User className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="fullname"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Mis. Capt. R. Hermawan"
                className="pl-9"
                required
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
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
            <Label htmlFor="password">Kode Akses (min. 6 karakter)</Label>
            <div className="relative">
              <Lock className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="pl-9 pr-9"
                autoComplete="new-password"
                required
                minLength={6}
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
                MEMPROSES...
              </>
            ) : (
              'DAFTARKAN AKUN'
            )}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-border-steel/60 text-center">
          <Link href="/login" className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary transition-smooth inline-flex items-center gap-1.5">
            <ArrowLeft className="w-3 h-3" /> KEMBALI KE LOGIN
          </Link>
        </div>
      </div>
    </div>
  );
}
