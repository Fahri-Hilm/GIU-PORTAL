'use client';

import { useState, useEffect, useMemo } from 'react';
import { BellRing, Search as SearchIcon, Menu, Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/ui';
import { useActivity } from '@/lib/queries';
import { cn } from '@/lib/utils';

const SECTION_MAP: Record<string, string> = {
  '/dashboard': 'INTELIJEN',
  '/map': 'INTELIJEN',
  '/markers': 'INTELIJEN',
  '/organizations': 'TARGET',
  '/members': 'TARGET',
  '/investigations': 'OPERASI',
  '/operations': 'OPERASI',
  '/activity': 'OPERASI',
  '/settings': 'SISTEM',
};

export function Topbar() {
  const pathname = usePathname();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleMobileSidebar = useUIStore((s) => s.toggleMobileSidebar);
  const collapse = useUIStore((s) => s.sidebarCollapsed);
  const [now, setNow] = useState<string>('');
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const { data: activity = [] } = useActivity(10);

  const active = NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(i.href + '/'));
  const title = active?.label ?? 'GIU Portal';
  const section = active ? SECTION_MAP[active.href] ?? 'PORTAL' : 'PORTAL';

  const unreadCount = useMemo(() => activity.length, [activity]);

  useEffect(() => {
    const tick = () =>
      setNow(
        new Date().toLocaleString('id-ID', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className={cn(
        'sticky top-0 z-50 flex items-center gap-3 px-margin-edge h-16 bg-surface-graphite/40 border-b border-border-steel/40 backdrop-blur-3xl',
        'transition-all',
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        onClick={() => {
          toggleSidebar();
          toggleMobileSidebar();
        }}
        className="shrink-0"
      >
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="font-data-mono text-[9px] text-on-surface-muted/40 tracking-widest uppercase leading-none mb-1">
            {section}
          </p>
          <h2 className="font-headline-md text-headline-md text-on-surface leading-none truncate">{title}</h2>
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileSearchOpen(true)}
          className="shrink-0 md:hidden"
        >
          <SearchIcon className="w-5 h-5" />
        </Button>

        <div className="hidden md:flex items-center gap-3">
        <div className="relative">
          <SearchIcon className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Cari organisasi, kasus, operasi..." className="pl-9 pr-8 w-72 h-10 text-xs" />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 font-data-mono text-[10px] bg-surface-elevated border border-border-steel rounded px-1.5 py-0.5 text-on-surface-muted pointer-events-none">
            /
          </kbd>
        </div>
        <div className="font-data-mono text-data-mono text-on-surface-muted tabular-nums hidden lg:block min-w-[160px] text-right">
          {now}
        </div>
        </div>
        <Button variant="outline" size="icon" className="relative">
          <BellRing className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-threat-critical text-white text-[9px] font-bold flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </div>

      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[60] bg-surface-graphite/95 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border-steel/40">
            <SearchIcon className="w-5 h-5 text-on-surface-muted shrink-0" />
            <Input
              autoFocus
              placeholder="Cari organisasi, kasus, operasi..."
              className="flex-1 h-10 border-0 bg-transparent focus-visible:ring-0 text-sm"
            />
            <Button variant="ghost" size="icon" onClick={() => setMobileSearchOpen(false)} className="shrink-0">
              <span className="font-data-mono text-[10px] text-on-surface-muted">ESC</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
