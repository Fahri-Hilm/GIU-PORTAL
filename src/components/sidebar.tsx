'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, LogOut } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { icons } from '@/lib/icons';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth';
import { AvatarName } from '@/components/ui/avatar';
import { ModeBadge } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/stores/ui';

export function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const collapse = useUIStore((s) => s.sidebarCollapsed);

  const handleSignOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    await signOut();
    window.location.href = '/login';
  };

  return (
    <nav
      className={cn(
        'fixed left-0 top-0 h-full z-40 flex flex-col pt-5 pb-6 bg-surface-graphite/85 backdrop-blur-xl border-r border-border-steel/50 transition-all duration-300',
        collapse ? 'w-[72px]' : 'w-[280px]',
      )}
    >
      <div className={cn('px-margin-edge mb-6 flex items-center gap-3', collapse && 'justify-center')}>
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="relative w-11 h-11 shrink-0">
            <div className="absolute inset-0 rounded-lg overflow-hidden border border-primary/30 bg-surface-gunmetal shadow-[0_0_15px_rgba(230,195,131,0.15)] group-hover:border-primary/60 transition-smooth">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-giu.jpg" alt="GIU" className="w-full h-full object-cover" />
            </div>
            {!collapse && (
              <div className="absolute -inset-0.5 rounded-lg border border-primary/20 opacity-0 group-hover:opacity-100 transition-smooth animate-glow-pulse pointer-events-none" />
            )}
          </div>
          {!collapse && (
            <div className="opacity-0 animate-slide-in-left stagger-2">
              <h1 className="font-headline-md text-headline-md text-primary tracking-tight leading-none">Markas GIU</h1>
              <p className="font-data-mono text-data-mono text-on-surface-variant mt-1">Komando Strategis</p>
            </div>
          )}
        </Link>
      </div>

      {!collapse && (
        <div className="px-margin-edge mb-6 opacity-0 animate-slide-in-left stagger-2">
          <ModeBadge />
        </div>
      )}

      <ul className="flex-1 flex flex-col gap-1 px-3 overflow-y-auto">
        {NAV_ITEMS.map((item, i) => {
          const Icon = icons[item.icon] ?? icons.Shield;
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <li key={item.href} className="opacity-0 animate-slide-in-left group" style={{ animationDelay: `${0.1 + i * 0.05}s`, animationFillMode: 'forwards' }}>
              <Link
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-smooth relative overflow-hidden',
                  collapse && 'justify-center',
                  active
                    ? 'bg-primary/10 text-primary border-r-2 border-primary'
                    : 'text-on-surface-variant hover:text-primary hover:bg-surface-gunmetal/60',
                )}
                title={collapse ? item.label : undefined}
              >
                <div className="absolute inset-y-0 right-0 w-0 bg-primary group-hover:w-1 transition-all duration-300" />
                <Icon className={cn('w-5 h-5 shrink-0', active && 'fill-primary/20')} />
                {!collapse && <span className="font-label-caps text-label-caps">{item.label}</span>}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto px-3 border-t border-border-steel/50 pt-4 flex flex-col gap-2">
        {user && (
          <div className={cn('flex items-center gap-3 px-2 py-2 rounded-lg', collapse && 'justify-center')}>
            <AvatarName name={user.full_name} src={user.avatar_url} className="w-9 h-9" />
            {!collapse && (
              <div className="flex-1 min-w-0">
                <p className="font-body-md text-sm text-on-surface truncate">{user.full_name}</p>
                <p className="font-data-mono text-[10px] text-on-surface-muted truncate">{user.rank} · {user.role}</p>
              </div>
            )}
          </div>
        )}
        <Button
          variant="ghost"
          size={collapse ? 'icon' : 'default'}
          onClick={handleSignOut}
          className={cn('justify-start', collapse && 'justify-center')}
          title="Keluar"
        >
          <LogOut className="w-4 h-4" />
          {!collapse && <span>KELUAR</span>}
        </Button>
      </div>
    </nav>
  );
}
