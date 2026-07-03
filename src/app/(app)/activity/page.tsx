'use client';

import { useState, useMemo } from 'react';
import { Radio, Users, Search, Medal, MapPin, AlertTriangle, LogIn, Activity as ActivityIcon, Filter } from 'lucide-react';
import { useActivity } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TacticalCard } from '@/components/ui/tactical-card';
import { PageHeader } from '@/components/ui/page-header';
import { SkeletonCard } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/misc';
import { formatRelativeTime, formatDateTime } from '@/lib/utils';
import type { ActivityType } from '@/lib/types';
import type { LucideIcon } from 'lucide-react';

const TYPE_META: Record<ActivityType, { icon: LucideIcon; color: string; label: string }> = {
  org_created: { icon: Users, color: 'var(--color-primary)', label: 'ORG DIBUAT' },
  org_updated: { icon: Users, color: 'var(--color-on-surface-variant)', label: 'ORG DIPERBARUI' },
  marker_added: { icon: MapPin, color: 'var(--color-threat-medium)', label: 'PENANDA DITAMBAH' },
  investigation_opened: { icon: Search, color: 'var(--color-status-active)', label: 'INVESTIGASI DIBUKA' },
  investigation_closed: { icon: Search, color: 'var(--color-status-closed)', label: 'INVESTIGASI DITUTUP' },
  operation_started: { icon: Medal, color: 'var(--color-status-active)', label: 'OPERASI DIMULAI' },
  operation_completed: { icon: Medal, color: 'var(--color-on-surface-muted)', label: 'OPERASI SELESAI' },
  mission_added: { icon: Medal, color: 'var(--color-threat-medium)', label: 'MISI DITAMBAH' },
  login: { icon: LogIn, color: 'var(--color-on-surface-muted)', label: 'MASUK' },
  threat_escalated: { icon: AlertTriangle, color: 'var(--color-threat-critical)', label: 'ANCAMAN NAIK' },
};

export default function ActivityPage() {
  const { data: activity = [], isLoading } = useActivity(200);
  const [typeFilter, setTypeFilter] = useState<ActivityType | 'all'>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return activity.filter((a) => {
      if (typeFilter !== 'all' && a.type !== typeFilter) return false;
      if (search && !a.message.toLowerCase().includes(search.toLowerCase()) && !a.actor.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [activity, typeFilter, search]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof filtered> = {};
    filtered.forEach((a) => {
      const day = new Date(a.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
      if (!groups[day]) groups[day] = [];
      groups[day].push(a);
    });
    return groups;
  }, [filtered]);

  return (
    <div className="p-gutter-md space-y-gutter-md max-w-[1200px] mx-auto">
      <PageHeader
        label="LOG OPERASIONAL"
        title="Umpan Aktivitas"
        icon={Radio}
        description={`${activity.length} peristiwa tercatat · Audit trail lengkap portal`}
        actions={
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-on-surface-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input placeholder="Cari pesan/aktor..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 w-56 h-9 text-xs" />
            </div>
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as ActivityType | 'all')}>
              <SelectTrigger className="w-48"><Filter className="w-3 h-3 mr-2" /><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                {Object.entries(TYPE_META).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <SkeletonCard className="h-16" />
          <SkeletonCard className="h-16" />
          <SkeletonCard className="h-16" />
        </div>
      ) : filtered.length === 0 ? (
        <TacticalCard><EmptyState icon={Radio} title="Belum ada aktivitas" description="Aktivitas akan muncul saat operasi dilakukan." /></TacticalCard>
      ) : (
        <div className="space-y-gutter-md">
          {Object.entries(grouped).map(([day, events], gi) => (
            <div key={day} className="opacity-0 animate-fade-slide-up" style={{ animationDelay: `${0.1 + gi * 0.05}s`, animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <h2 className="font-label-caps text-label-caps text-primary">{day}</h2>
                <div className="flex-1 h-px bg-border-steel/60" />
                <span className="font-data-mono text-data-mono text-on-surface-muted">{events.length}</span>
              </div>
              <TacticalCard>
                <CardContent className="space-y-1 -m-2">
                  {events.map((a, i) => {
                    const meta = TYPE_META[a.type];
                    const Icon = meta.icon;
                    return (
                      <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-surface-gunmetal/40 transition-smooth group relative">
                        <div className="absolute left-[18px] top-12 bottom-0 w-px bg-border-steel/40 last:hidden" />
                        <div
                          className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 border z-10"
                          style={{
                            color: meta.color,
                            borderColor: `color-mix(in srgb, ${meta.color} 40%, transparent)`,
                            background: `color-mix(in srgb, ${meta.color} 12%, transparent)`,
                          }}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body-md text-sm text-on-surface">{a.message}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="font-data-mono text-data-mono text-on-surface-muted">{a.actor}</span>
                            <span className="font-data-mono text-data-mono text-on-surface-muted">·</span>
                            <span className="font-data-mono text-data-mono text-on-surface-muted">{formatRelativeTime(a.created_at)}</span>
                            <span className="font-label-caps text-[9px] px-1.5 py-0.5 rounded border border-border-steel text-on-surface-variant">
                              {meta.label}
                            </span>
                          </div>
                        </div>
                        <span className="font-data-mono text-data-mono text-on-surface-muted/50 text-right hidden sm:block">
                          {formatDateTime(a.created_at)}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </TacticalCard>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
