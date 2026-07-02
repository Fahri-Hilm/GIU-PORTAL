'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { useMockSubscription } from '@/lib/queries';
import { isSupabaseConfigured } from '@/lib/supabase/client';

function MockSubscription() {
  useMockSubscription();
  return null;
}

function AuthInit() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => {
    init();
  }, [init]);
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <AuthInit />
      <MockSubscription />
      {children}
      <Toaster
        theme="dark"
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--color-surface-gunmetal)',
            border: '1px solid var(--color-border-steel)',
            color: 'var(--color-on-surface)',
            fontFamily: 'var(--font-body-md)',
          },
        }}
      />
    </QueryClientProvider>
  );
}

export function ModeBadge() {
  return (
    <span
      className="font-data-mono text-[10px] px-2 py-0.5 rounded border"
      style={{
        color: isSupabaseConfigured ? 'var(--color-status-active)' : 'var(--color-threat-medium)',
        borderColor: isSupabaseConfigured
          ? 'color-mix(in srgb, var(--color-status-active) 40%, transparent)'
          : 'color-mix(in srgb, var(--color-threat-medium) 40%, transparent)',
        background: isSupabaseConfigured
          ? 'color-mix(in srgb, var(--color-status-active) 12%, transparent)'
          : 'color-mix(in srgb, var(--color-threat-medium) 12%, transparent)',
      }}
      title={isSupabaseConfigured ? 'Mode: Supabase' : 'Mode: Mock (seeded demo data)'}
    >
      {isSupabaseConfigured ? 'LIVE' : 'MOCK'}
    </span>
  );
}
