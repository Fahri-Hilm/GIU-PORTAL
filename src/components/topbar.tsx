'use client';

import { useState, useEffect } from 'react';
import { BellRing, Search as SearchIcon, Menu, Shield } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/utils';

export function Topbar() {
  const pathname = usePathname();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const collapse = useUIStore((s) => s.sidebarCollapsed);
  const [now, setNow] = useState<string>('');

  const active = NAV_ITEMS.find((i) => pathname === i.href || pathname.startsWith(i.href + '/'));
  const title = active?.label ?? 'GIU Portal';

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
        'sticky top-0 z-50 flex items-center gap-4 px-margin-edge h-20 bg-surface-graphite/40 border-b border-border-steel/40 backdrop-blur-3xl',
        'transition-all',
      )}
      style={{ marginLeft: collapse ? 72 : 280 }}
    >
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="shrink-0">
        <Menu className="w-5 h-5" />
      </Button>

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div className="min-w-0">
          <h2 className="font-headline-md text-headline-md text-on-surface leading-none truncate">{title}</h2>
          <p className="font-data-mono text-data-mono text-on-surface-muted mt-1">
            THREAT LEVEL: <span className="text-threat-critical">ELEVATED</span>
          </p>
        </div>
      </div>

      <div className="ml-auto hidden md:flex items-center gap-3">
        <div className="relative">
          <SearchIcon className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <Input placeholder="Cari organisasi, kasus, operasi..." className="pl-9 w-72 h-9 text-xs" />
        </div>
        <div className="font-data-mono text-data-mono text-on-surface-muted tabular-nums hidden lg:block min-w-[160px] text-right">
          {now}
        </div>
        <Button variant="outline" size="icon" className="relative">
          <BellRing className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-threat-critical text-white text-[9px] font-bold flex items-center justify-center">
            3
          </span>
        </Button>
      </div>
    </header>
  );
}
