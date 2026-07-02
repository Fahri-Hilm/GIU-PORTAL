'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock,
  Mail,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  Shield,
  Fingerprint,
  ChevronRight,
  Crosshair,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/form';
import { useAuthStore } from '@/stores/auth';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { CornerBrackets, GridOverlay, StatusDot, TacticalFrame } from '@/components/tactical';
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
    <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-8 lg:gap-0 min-h-[640px] lg:min-h-[680px]">
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-gunmetal/40 via-surface-graphite/20 to-transparent" />
        <GridOverlay opacity={0.5} className="bg-surface-container-lowest/30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] radial-gold animate-glow-pulse" />
        <CornerBrackets size={20} className="opacity-60" />

        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusDot color="var(--color-threat-critical)" size={8} />
            <span className="font-label-caps text-[10px] text-threat-critical tracking-widest animate-flicker">
              KLASIFIKASI: RAHASIA
            </span>
          </div>
          <span className="font-data-mono text-[10px] text-on-surface-muted">
            CHANNEL: <span className="text-primary">GIU-7</span>
          </span>
        </div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="relative w-48 h-48 mb-8">
            <div className="absolute inset-0 animate-rotate-slow">
              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="98" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" strokeDasharray="2 4" opacity="0.4" />
                <circle cx="100" cy="100" r="92" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" opacity="0.2" />
                <line x1="100" y1="2" x2="100" y2="10" stroke="var(--color-primary)" strokeWidth="1" />
                <line x1="100" y1="190" x2="100" y2="198" stroke="var(--color-primary)" strokeWidth="1" />
                <line x1="2" y1="100" x2="10" y2="100" stroke="var(--color-primary)" strokeWidth="1" />
                <line x1="190" y1="100" x2="198" y2="100" stroke="var(--color-primary)" strokeWidth="1" />
              </svg>
            </div>
            <div className="absolute inset-4 animate-radar">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0deg, color-mix(in srgb, var(--color-primary) 30%, transparent) 60deg, transparent 90deg)',
                  maskImage: 'radial-gradient(circle, transparent 30%, black 70%)',
                  WebkitMaskImage: 'radial-gradient(circle, transparent 30%, black 70%)',
                }}
              />
            </div>
            <div className="absolute inset-8 rounded-full overflow-hidden border-glow-gold bg-surface-gunmetal flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-giu.jpg"
                alt="GIU Emblem"
                className="w-full h-full object-cover"
                style={{ filter: 'contrast(1.1) brightness(0.95)' }}
              />
              <div className="absolute inset-0 rounded-full ring-1 ring-inset ring-primary/30" />
            </div>
          </div>

          <div className="opacity-0 animate-fade-slide-up" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
            <p className="font-data-mono text-[11px] text-primary tracking-[0.3em] mb-2">GANGSTER INTELLIGENCE UNIT</p>
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight text-glow-gold leading-none">
              PORTAL INTELIJEN
            </h1>
            <div className="flex items-center justify-center gap-3 mt-3">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-primary" />
              <span className="font-data-mono text-[10px] text-on-surface-muted tracking-widest">SAN ANDREAS</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-primary" />
            </div>
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-3 gap-4 opacity-0 animate-fade-slide-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
          {[
            { label: 'Operasi Aktif', value: '04', icon: Crosshair, color: 'var(--color-status-active)' },
            { label: 'Ancaman Kritis', value: '04', icon: AlertTriangle, color: 'var(--color-threat-critical)' },
            { label: 'Organisasi', value: '10', icon: Users, color: 'var(--color-primary)' },
          ].map((stat) => (
            <TacticalFrame key={stat.label} className="p-3 bg-surface-graphite/40">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className="w-3 h-3" style={{ color: stat.color }} />
                <span className="font-data-mono text-[9px] text-on-surface-muted uppercase tracking-wider">{stat.label}</span>
              </div>
              <span className="font-headline-lg text-2xl tabular-nums" style={{ color: stat.color }}>
                {stat.value}
              </span>
            </TacticalFrame>
          ))}
        </div>
      </div>

      <div className="relative flex flex-col justify-center p-8 lg:p-12">
        <div className="lg:hidden flex justify-center mb-8">
          <div className="relative w-24 h-24">
            <div className="absolute inset-0 animate-rotate-slow opacity-50">
              <svg viewBox="0 0 100 100" className="w-full h-full">
                <circle cx="50" cy="50" r="48" fill="none" stroke="var(--color-primary)" strokeWidth="0.5" strokeDasharray="2 4" />
              </svg>
            </div>
            <div className="absolute inset-3 rounded-full overflow-hidden border-glow-gold bg-surface-gunmetal">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-giu.jpg" alt="GIU" className="w-full h-full object-cover" />
            </div>
          </div>
        </div>

        <div className="w-full max-w-sm mx-auto">
          <div className="mb-8 opacity-0 animate-slide-in-right" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center gap-2 mb-3">
              <Fingerprint className="w-4 h-4 text-primary" />
              <span className="font-data-mono text-[11px] text-primary tracking-[0.25em]">OTORISASI OPERATOR</span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface leading-tight">
              Verifikasi<br />Identitas
            </h2>
            <p className="font-body-md text-xs text-on-surface-muted mt-2">
              Sistem keamanan berlapis. Setiap upaya akses tidak sah dicatat dan ditindak.
            </p>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-5 p-3 rounded-md border border-threat-medium/40 bg-threat-medium/10 flex items-start gap-2 opacity-0 animate-slide-in-right stagger-1" style={{ animationFillMode: 'forwards' }}>
              <AlertTriangle className="w-4 h-4 text-threat-medium mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="font-label-caps text-[10px] text-threat-medium">MODE DEMO</p>
                <p className="font-body-md text-xs text-on-surface-variant mt-1">
                  Email &amp; password apa pun diterima.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 opacity-0 animate-slide-in-right stagger-2" style={{ animationFillMode: 'forwards' }}>
            <div>
              <Label>Identitas</Label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                <Input
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
              <div className="flex items-center justify-between mb-1.5">
                <Label className="mb-0">Kode Akses</Label>
                <span className="font-data-mono text-[9px] text-on-surface-muted">AES-256</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2 z-10" />
                <Input
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-muted hover:text-primary transition-smooth cursor-pointer z-10"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-md border border-threat-critical/40 bg-threat-critical/10 flex items-start gap-2 animate-flicker">
                <AlertTriangle className="w-4 h-4 text-threat-critical mt-0.5 shrink-0" />
                <p className="font-body-md text-xs text-threat-critical">{error}</p>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full btn-shimmer" size="lg">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  MEMVERIFIKASI...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  BERI AKSES
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border-steel/60 space-y-3 opacity-0 animate-slide-in-right stagger-3" style={{ animationFillMode: 'forwards' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-status-active animate-blink" />
                <span className="font-data-mono text-[9px] text-on-surface-muted tracking-wider">SECURE CHANNEL · TLS 1.3</span>
              </div>
              <span className="font-data-mono text-[9px] text-on-surface-muted">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
