'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { AppShell } from '@/components/app-shell';
import { ModeBadge } from '@/components/providers';
import { Shield, Loader2 } from 'lucide-react';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const initialized = useAuthStore((s) => s.initialized);
  const init = useAuthStore((s) => s.init);
  const router = useRouter();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (initialized && !user) {
      router.replace('/login');
    }
  }, [initialized, user, router]);

  if (!initialized || !user) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Shield className="w-12 h-12 text-primary/30" />
            <Loader2 className="w-12 h-12 text-primary animate-spin absolute inset-0" />
          </div>
          <p className="font-data-mono text-data-mono text-on-surface-muted">MEMVERIFIKASI AKSES...</p>
          <ModeBadge />
        </div>
      </div>
    );
  }

  return <AppShell>{children}</AppShell>;
}
