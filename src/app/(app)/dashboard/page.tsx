'use client';

import { useOrganizations, useInvestigations, useOperations, useActivity, useMarkers } from '@/lib/queries';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThreatBadge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/misc';
import { CornerBrackets, GridOverlay, StatusDot, TacticalFrame } from '@/components/tactical';
import {
  Activity as ActivityIcon,
  Users,
  Search,
  Medal,
  Skull,
  AlertTriangle,
  Radio,
  Clock,
  ChevronRight,
  MapPin,
  Crosshair,
  Plus,
  TrendingUp,
  Shield,
  Target,
} from 'lucide-react';
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

const ACTIVITY_COLORS: Record<string, string> = {
  org_created: 'var(--color-primary)',
  org_updated: 'var(--color-on-surface-variant)',
  marker_added: 'var(--color-threat-medium)',
  investigation_opened: 'var(--color-status-active)',
  investigation_closed: 'var(--color-status-closed)',
  operation_started: 'var(--color-status-active)',
  operation_completed: 'var(--color-on-surface-muted)',
  mission_added: 'var(--color-threat-medium)',
  login: 'var(--color-on-surface-muted)',
  threat_escalated: 'var(--color-threat-critical)',
};

export default function DashboardPage() {
  const { data: orgs = [] } = useOrganizations();
  const { data: investigations = [] } = useInvestigations();
  const { data: operations = [] } = useOperations();
  const { data: activity = [] } = useActivity(7);
  const { data: markers = [] } = useMarkers();

  const stats = useMemo(() => {
    const critical = orgs.filter((o) => o.threat_level === 'critical').length;
    const activeInv = investigations.filter((i) => i.status === 'active').length;
    const activeOps = operations.filter((o) => o.status === 'active' || o.status === 'planning').length;
    const incidents = markers.filter((m) => m.type === 'incident').length;
    const markersWithIcon = markers.filter((m) => m.icon_url).length;
    return {
      total: orgs.length,
      critical,
      activeInv,
      activeOps,
      incidents,
      markers: markers.length,
      markersWithIcon,
      territories: 6,
    };
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

  const activeOperations = useMemo(() => operations.filter((o) => o.status === 'active').slice(0, 3), [operations]);

  const donutSegments = useMemo(() => {
    const total = stats.total || 1;
    let cumulative = 0;
    return threatDistribution.map((d) => {
      const fraction = d.count / total;
      const start = cumulative;
      cumulative += fraction;
      return { ...d, startAngle: start * 360, endAngle: cumulative * 360, fraction };
    });
  }, [threatDistribution, stats.total]);

  return (
    <div className="p-gutter-md space-y-gutter-md max-w-[1600px] mx-auto">
      <div className="opacity-0 animate-fade-slide-up flex items-center justify-between flex-wrap gap-2" style={{ animationFillMode: 'forwards' }}>
        <div className="flex items-center gap-3">
          <StatusDot color="var(--color-threat-critical)" size={8} />
          <span className="font-label-caps text-[10px] text-threat-critical tracking-widest animate-flicker">
            KLASIFIKASI: RAHASIA · AKSES TERBATAS
          </span>
        </div>
        <div className="flex items-center gap-3 font-data-mono text-[10px] text-on-surface-muted">
          <span>SIDANG: <span className="text-primary">GIU-{new Date().getFullYear()}-001</span></span>
          <span>·</span>
          <span>STATUS: <span className="text-status-active">OPERASIONAL</span></span>
        </div>
      </div>

      <div className="opacity-0 animate-fade-slide-up stagger-1" style={{ animationFillMode: 'forwards' }}>
        <p className="font-data-mono text-data-mono text-on-surface-muted">RINGKASAN OPERASIONAL</p>
        <div className="flex items-baseline gap-4 mt-1 flex-wrap">
          <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">Dasbor Komando</h1>
          <span className="font-data-mono text-data-mono text-on-surface-muted">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </span>
        </div>
        <p className="font-body-md text-sm text-on-surface-variant mt-2 max-w-2xl">
          Pantauan real-time ancaman organisasi kriminal di seluruh San Andreas. {stats.critical} organisasi tingkat kritis aktif dipantau.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-gutter-md">
        <StatTile
          label="Organisasi Dipantau"
          value={stats.total}
          icon={Users}
          accent="primary"
          trend="+2 minggu ini"
          trendUp
          href="/organizations"
          delay={1}
        />
        <StatTile
          label="Investigasi Aktif"
          value={stats.activeInv}
          icon={Search}
          accent="critical"
          trend="+1 hari ini"
          trendUp
          href="/investigations"
          delay={2}
        />
        <StatTile
          label="Operasi Berlangsung"
          value={stats.activeOps}
          icon={Medal}
          accent="medium"
          href="/operations"
          delay={3}
        />
        <StatTile
          label="Insiden Tercatat"
          value={stats.incidents}
          icon={AlertTriangle}
          accent="high"
          trend="+3 minggu ini"
          trendUp={false}
          href="/markers?type=incident"
          delay={4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-md">
        <Card className="lg:col-span-1 opacity-0 animate-fade-slide-up stagger-5 relative overflow-hidden" style={{ animationFillMode: 'forwards' }}>
          <CornerBrackets size={10} className="opacity-40" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Distribusi Ancaman</CardTitle>
              <Skull className="w-4 h-4 text-threat-critical" />
            </div>
            <CardDescription>{stats.total} organisasi terdaftar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center mb-4">
              <ThreatDonut segments={donutSegments} total={stats.total} />
            </div>
            <div className="space-y-2">
              {threatDistribution.map((d) => {
                const meta = THREAT_META[d.level];
                const pct = stats.total ? (d.count / stats.total) * 100 : 0;
                return (
                  <div key={d.level} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: meta.color, boxShadow: `0 0 6px ${meta.color}` }} />
                    <span className="font-data-mono text-[10px] text-on-surface-variant uppercase tracking-wider w-20">{meta.label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-surface-container-lowest overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: meta.color }} />
                    </div>
                    <span className="font-data-mono text-[10px] text-on-surface tabular-nums w-8 text-right">{d.count}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 opacity-0 animate-fade-slide-up stagger-6 relative overflow-hidden" style={{ animationFillMode: 'forwards' }}>
          <CornerBrackets size={10} className="opacity-40" />
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Organisasi Prioritas</CardTitle>
              <CardDescription>Tingkat kritis &amp; tinggi · {criticalOrgs.length} target utama</CardDescription>
            </div>
            <Link href="/organizations">
              <Button variant="ghost" size="sm" className="font-label-caps text-[10px]">
                SEMUA <ChevronRight className="w-3 h-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-1 -m-2">
            {criticalOrgs.length === 0 ? (
              <EmptyState icon={Users} title="Tidak ada prioritas" description="Belum ada organisasi tingkat kritis." />
            ) : (
              criticalOrgs.map((o, i) => {
                const meta = THREAT_META[o.threat_level];
                return (
                  <Link
                    key={o.id}
                    href={`/organizations?id=${o.id}`}
                    className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-gunmetal/60 transition-smooth group relative"
                  >
                    <span className="font-data-mono text-[10px] text-on-surface-muted tabular-nums w-6">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div
                      className="w-9 h-9 rounded-md flex items-center justify-center font-headline-md text-sm shrink-0 relative overflow-hidden"
                      style={{
                        background: `color-mix(in srgb, ${o.primary_color} 18%, transparent)`,
                        color: o.primary_color,
                        border: `1px solid color-mix(in srgb, ${o.primary_color} 40%, transparent)`,
                      }}
                    >
                      {o.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={o.logo_url} alt={o.name} className="w-full h-full object-cover" />
                      ) : (
                        o.name[0]
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-body-md text-sm text-on-surface truncate group-hover:text-primary transition-smooth">{o.name}</p>
                      <p className="font-data-mono text-data-mono text-on-surface-muted">
                        {o.alias ?? '—'} · {o.members_count} anggota
                      </p>
                    </div>
                    <ThreatBadge level={o.threat_level} withPulse={o.threat_level === 'critical'} />
                    <ChevronRight className="w-4 h-4 text-on-surface-muted group-hover:text-primary transition-smooth" />
                  </Link>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-md">
        <Card className="opacity-0 animate-fade-slide-up stagger-7 relative overflow-hidden" style={{ animationFillMode: 'forwards' }}>
          <CornerBrackets size={10} className="opacity-40" />
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Operasi Aktif</CardTitle>
              <Crosshair className="w-4 h-4 text-status-active" />
            </div>
            <CardDescription>{activeOperations.length} operasi berlangsung</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 -m-2">
            {activeOperations.length === 0 ? (
              <EmptyState icon={Crosshair} title="Tidak ada operasi aktif" />
            ) : (
              activeOperations.map((op) => (
                <Link
                  key={op.id}
                  href="/operations"
                  className="block p-3 rounded-lg border border-border-steel/60 bg-surface-gunmetal/30 hover:border-status-active/40 transition-smooth group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-data-mono text-[10px] text-status-active tracking-wider">{op.codename}</span>
                    <StatusDot color="var(--color-status-active)" size={5} />
                  </div>
                  <p className="font-body-md text-xs text-on-surface-variant line-clamp-2">{op.objective}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-steel/40">
                    <span className="font-data-mono text-[9px] text-on-surface-muted">{op.lead_operator}</span>
                    <span className="font-data-mono text-[9px] text-on-surface-muted">{op.participants} tim</span>
                  </div>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 opacity-0 animate-fade-slide-up stagger-8 relative overflow-hidden" style={{ animationFillMode: 'forwards' }}>
          <CornerBrackets size={10} className="opacity-40" />
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">Umpan Aktivitas</CardTitle>
              <CardDescription>Log operasional real-time</CardDescription>
            </div>
            <Link href="/activity" className="font-label-caps text-[10px] text-primary hover:underline flex items-center gap-1">
              SEMUA <ChevronRight className="w-3 h-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-1 -m-2">
            {activity.length === 0 ? (
              <EmptyState icon={Radio} title="Belum ada aktivitas" />
            ) : (
              <div className="relative">
                <div className="absolute left-[22px] top-2 bottom-2 w-px bg-border-steel/40" />
                {activity.map((a, i) => {
                  const Icon = ACTIVITY_ICONS[a.type] ?? ActivityIcon;
                  const color = ACTIVITY_COLORS[a.type] ?? 'var(--color-primary)';
                  return (
                    <div key={a.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-surface-gunmetal/40 transition-smooth relative">
                      <div
                        className="w-9 h-9 rounded-md flex items-center justify-center shrink-0 border z-10 bg-surface-graphite"
                        style={{
                          color,
                          borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
                          background: `color-mix(in srgb, ${color} 12%, transparent)`,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <p className="font-body-md text-sm text-on-surface">{a.message}</p>
                        <p className="font-data-mono text-data-mono text-on-surface-muted mt-0.5">
                          {a.actor} · {formatRelativeTime(a.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="opacity-0 animate-fade-slide-up stagger-8 grid grid-cols-2 md:grid-cols-4 gap-gutter-md" style={{ animationFillMode: 'forwards' }}>
        <QuickAction href="/map" icon={MapPin} label="Buka Peta" accent="primary" />
        <QuickAction href="/organizations" icon={Plus} label="Org Baru" accent="status-active" />
        <QuickAction href="/investigations" icon={Search} label="Kasus Baru" accent="threat-critical" />
        <QuickAction href="/operations" icon={Medal} label="Operasi Baru" accent="threat-medium" />
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  accent,
  href,
  delay,
}: {
  label: string;
  value: string | number;
  icon: typeof Users;
  trend?: string;
  trendUp?: boolean;
  accent: 'primary' | 'critical' | 'high' | 'medium' | 'low';
  href: string;
  delay: number;
}) {
  const accentColor =
    accent === 'critical'
      ? 'var(--color-threat-critical)'
      : accent === 'high'
        ? 'var(--color-threat-high)'
        : accent === 'medium'
          ? 'var(--color-threat-medium)'
          : accent === 'low'
            ? 'var(--color-threat-low)'
            : 'var(--color-primary)';

  return (
    <Link
      href={href}
      className="opacity-0 animate-fade-slide-up group relative block"
      style={{ animationDelay: `${0.05 + delay * 0.04}s`, animationFillMode: 'forwards' }}
    >
      <TacticalFrame className="rounded-xl p-gutter-md bg-surface-graphite/60 backdrop-blur-xl border border-border-steel hover:border-primary/40 transition-smooth overflow-hidden">
        <div
          className="absolute -top-12 -right-12 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-50 transition-opacity"
          style={{ background: accentColor }}
        />
        <div className="relative z-10 flex items-start justify-between mb-3">
          <div>
            <p className="font-label-caps text-[10px] text-on-surface-muted tracking-wider">{label}</p>
            <p className="font-headline-lg text-headline-lg text-on-surface mt-1.5 tabular-nums leading-none">{value}</p>
          </div>
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center border"
            style={{
              color: accentColor,
              borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
              background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
            }}
          >
            <Icon className="w-4 h-4" />
          </div>
        </div>
        {trend && (
          <div className="relative z-10 flex items-center gap-1.5">
            <TrendingUp
              className="w-3 h-3"
              style={{ color: trendUp ? 'var(--color-status-active)' : 'var(--color-threat-critical)', transform: trendUp ? 'none' : 'rotate(180deg)' }}
            />
            <span
              className="font-data-mono text-[10px]"
              style={{ color: trendUp ? 'var(--color-status-active)' : 'var(--color-threat-critical)' }}
            >
              {trend}
            </span>
          </div>
        )}
        {!trend && (
          <div className="relative z-10 h-4 flex items-center">
            <div className="flex-1 h-px bg-border-steel/40" />
            <ChevronRight className="w-3 h-3 text-on-surface-muted ml-1 opacity-0 group-hover:opacity-100 transition-smooth" />
          </div>
        )}
      </TacticalFrame>
    </Link>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
  accent,
}: {
  href: string;
  icon: typeof Users;
  label: string;
  accent: 'primary' | 'status-active' | 'threat-critical' | 'threat-medium';
}) {
  const color =
    accent === 'status-active'
      ? 'var(--color-status-active)'
      : accent === 'threat-critical'
        ? 'var(--color-threat-critical)'
        : accent === 'threat-medium'
          ? 'var(--color-threat-medium)'
          : 'var(--color-primary)';
  return (
    <Link href={href} className="group">
      <TacticalFrame className="rounded-lg p-4 bg-surface-graphite/40 hover:bg-surface-gunmetal/60 border border-border-steel hover:border-primary/40 transition-smooth">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-md flex items-center justify-center border shrink-0 group-hover:scale-110 transition-transform"
            style={{
              color,
              borderColor: `color-mix(in srgb, ${color} 40%, transparent)`,
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
            }}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span className="font-label-caps text-[11px] text-on-surface group-hover:text-primary transition-smooth">{label}</span>
          <ChevronRight className="w-4 h-4 text-on-surface-muted ml-auto group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </TacticalFrame>
    </Link>
  );
}

function ThreatDonut({
  segments,
  total,
}: {
  segments: { level: ThreatLevel; count: number; startAngle: number; endAngle: number }[];
  total: number;
}) {
  const radius = 56;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  return (
    <div className="relative w-40 h-40">
      <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="var(--color-surface-container-lowest)" strokeWidth={strokeWidth} />
        {segments.map((seg) => {
          const meta = THREAT_META[seg.level];
          const length = (seg.endAngle - seg.startAngle) / 360;
          const offset = seg.startAngle / 360;
          return (
            <circle
              key={seg.level}
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke={meta.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference * length} ${circumference}`}
              strokeDashoffset={-circumference * offset}
              style={{ filter: `drop-shadow(0 0 4px ${meta.color})`, transition: 'stroke-dasharray 0.7s ease' }}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display-lg text-display-lg text-on-surface leading-none tabular-nums">{total}</span>
        <span className="font-data-mono text-[9px] text-on-surface-muted tracking-widest mt-1">ORGANISASI</span>
      </div>
    </div>
  );
}
