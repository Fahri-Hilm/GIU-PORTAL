'use client';

import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  accent,
  className,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  accent?: 'primary' | 'critical' | 'high' | 'medium' | 'low';
  className?: string;
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
    <div className={cn('glass-panel rounded-xl p-gutter-md relative overflow-hidden group', className)}>
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 transition-opacity group-hover:opacity-40"
        style={{ background: accentColor }}
      />
      <div className="relative z-10 flex items-start justify-between mb-4">
        <div>
          <p className="font-label-caps text-label-caps text-on-surface-muted">{label}</p>
          <p className="font-headline-lg text-headline-lg text-on-surface mt-2 tabular-nums">{value}</p>
        </div>
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center border"
          style={{
            color: accentColor,
            borderColor: `color-mix(in srgb, ${accentColor} 40%, transparent)`,
            background: `color-mix(in srgb, ${accentColor} 12%, transparent)`,
          }}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {trend && (
        <div className="relative z-10 flex items-center gap-1.5">
          {trendUp ? (
            <TrendingUp className="w-3.5 h-3.5 text-status-active" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-threat-critical" />
          )}
          <span
            className="font-data-mono text-data-mono"
            style={{ color: trendUp ? 'var(--color-status-active)' : 'var(--color-threat-critical)' }}
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
}
