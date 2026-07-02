'use client';

import { useOrganizations, useInvestigations, useOperations, useActivity, useMarkers } from '@/lib/queries';
import { StatCard } from '@/components/stat-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ThreatBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/misc';
import { Activity as ActivityIcon, Users, Search, Medal, Skull, AlertTriangle, Radio, Clock, ChevronRight, MapPin } from 'lucide-react';
import { THREAT_META, type ThreatLevel } from '@/lib/constants';
import { formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';
import { useMemo } from 'react';

const ACTIVITY_ICONS: Record<string, typeof ActivityIcon> = {
  org_created: Users,
  org_updated: Users,
  marker_added: MapPin,
  investigation_opened: Search,
  investigation_closed: Search,
  operation_started: Medal,
  operation_completed: Medal,
  mission_added: Medal,
  login: ActivityIcon,
  threat_escalated: AlertTriangle,
};

export default function DashboardPage() {
  const { data: orgs = [] } = useOrganizations();
  const { data: investigations = [] } = useInvestigations();
  const { data: operations = [] } = useOperations();
  const { data: activity = [] } = useActivity(6);
  const { data: markers = [] } = useMarkers();

  const stats = useMemo(() => {
    const critical = orgs.filter((o) => o.threat_level === 'critical').length;
    const activeInv = investigations.filter((i) => i.status === 'active').length;
    const activeOps = operations.filter((o) => o.status === 'active' || o.status === 'planning').length;
    const incidents = markers.filter((m) => m.type === 'incident').length;
    return { total: orgs.length, critical, activeInv, activeOps, incidents };
  }, [orgs, investigations, operations, markers]);

  const threatDistribution = useMemo(() => {
    const levels: ThreatLevel[] = ['critical', 'high', 'medium', 'low', 'unknown'];
    return levels
      .map((lvl) => ({ level: lvl, count: orgs.filter((o) => o.threat_level === lvl).length }))
      .filter((d) => d.count > 0);
  }, [orgs]);

  const criticalOrgs = useMemo(
    () => orgs.filter((o) => o.threat_level === 'critical' || o.threat_level === 'high').slice(0, 5),
    [orgs],
  );

  return (
    <div className="p-gutter-md space-y-gutter-md max-w-[1600px] mx-auto">
      <div className="opacity-0 animate-fade-slide-up" style={{ animationFillMode: 'forwards' }}>
        <p className="font-data-mono text-data-mono text-on-surface-muted">RINGKASAN OPERASIONAL</p>
        <h1 className="font-display-lg text-display-lg text-on-surface mt-1">Dasbor Komando</h1>
        <p className="font-body-md text-sm text-on-surface-variant mt-2 max-w-2xl">
          Pantauan real-time ancaman organisasi kriminal di seluruh San Andreas. {stats.critical} organisasi tingkat kritis aktif.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter-md">
        <StatCard label="Organisasi Dipantau" value={stats.total} icon={Users} accent="primary" trend="+2 minggu ini" trendUp className="opacity-0 animate-fade-slide-up stagger-1" />
        <StatCard label="Investigasi Aktif" value={stats.activeInv} icon={Search} accent="critical" trend="+1 hari ini" trendUp className="opacity-0 animate-fade-slide-up stagger-2" />
        <StatCard label="Operasi Berlangsung" value={stats.activeOps} icon={Medal} accent="medium" className="opacity-0 animate-fade-slide-up stagger-3" />
        <StatCard label="Insiden Tercatat" value={stats.incidents} icon={AlertTriangle} accent="high" trend="+3 minggu ini" trendUp={false} className="opacity-0 animate-fade-slide-up stagger-4" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-md">
        <Card className="lg:col-span-2 opacity-0 animate-fade-slide-up stagger-5">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Distribusi Tingkat Ancaman</CardTitle>
              <CardDescription>Komposisi {stats.total} organisasi berdasarkan tingkat</CardDescription>
            </div>
            <Skull className="w-5 h-5 text-threat-critical" />
          </CardHeader>
          <CardContent className="space-y-4">
            {threatDistribution.map((d) => {
              const meta = THREAT_META[d.level];
              const pct = (d.count / stats.total) * 100;
              return (
                <div key={d.level}>
                  <div className="flex items-center justify-between mb-2">
                    <ThreatBadge level={d.level} />
                    <span className="font-data-mono text-data-mono text-on-surface-variant tabular-nums">
                      {d.count} · {pct.toFixed(0)}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-surface-container-lowest overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, background: meta.color, boxShadow: `0 0 8px ${meta.color}` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card className="opacity-0 animate-fade-slide-up stagger-6">
          <CardHeader>
            <CardTitle className="text-base">Organisasi Prioritas</CardTitle>
            <CardDescription>Tingkat kritis &amp; tinggi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 -m-2">
            {criticalOrgs.length === 0 ? (
              <EmptyState icon={Users} title="Tidak ada prioritas" description="Belum ada organisasi tingkat kritis." />
            ) : (
              criticalOrgs.map((o) => (
                <Link
                  key={o.id}
                  href={`/organizations?id=${o.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-gunmetal/60 transition-smooth group"
                >
                  <div
                    className="w-8 h-8 rounded-md flex items-center justify-center font-headline-md text-sm shrink-0"
                    style={{
                      background: `color-mix(in srgb, ${o.primary_color} 18%, transparent)`,
                      color: o.primary_color,
                      border: `1px solid color-mix(in srgb, ${o.primary_color} 40%, transparent)`,
                    }}
                  >
                    {o.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-sm text-on-surface truncate">{o.name}</p>
                    <p className="font-data-mono text-data-mono text-on-surface-muted">{o.members_count} anggota</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-on-surface-muted group-hover:text-primary transition-smooth" />
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="opacity-0 animate-fade-slide-up stagger-7">
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Aktivitas Terkini</CardTitle>
            <CardDescription>Log operasional portal</CardDescription>
          </div>
          <Link href="/activity" className="font-label-caps text-label-caps text-primary hover:underline flex items-center gap-1">
            LIHAT SEMUA <ChevronRight className="w-3 h-3" />
          </Link>
        </CardHeader>
        <CardContent className="space-y-1 -m-2">
          {activity.length === 0 ? (
            <EmptyState icon={Radio} title="Belum ada aktivitas" />
          ) : (
            activity.map((a) => {
              const Icon = ACTIVITY_ICONS[a.type] ?? ActivityIcon;
              return (
                <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-gunmetal/40 transition-smooth">
                  <div className="w-8 h-8 rounded-md bg-surface-gunmetal/60 border border-border-steel flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-sm text-on-surface">{a.message}</p>
                    <p className="font-data-mono text-data-mono text-on-surface-muted mt-0.5">
                      {a.actor} · {formatRelativeTime(a.created_at)}
                    </p>
                  </div>
                  <Clock className="w-3 h-3 text-on-surface-muted/50 mt-1" />
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </div>
  );
}
