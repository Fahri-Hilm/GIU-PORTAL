export const THREAT_LEVELS = ['critical', 'high', 'medium', 'low', 'unknown'] as const;
export type ThreatLevel = (typeof THREAT_LEVELS)[number];

export const THREAT_META: Record<
  ThreatLevel,
  { label: string; color: string; bg: string; border: string; glow: string }
> = {
  critical: {
    label: 'KRITIS',
    color: 'var(--color-threat-critical)',
    bg: 'color-mix(in srgb, var(--color-threat-critical) 15%, transparent)',
    border: 'color-mix(in srgb, var(--color-threat-critical) 50%, transparent)',
    glow: '0 0 15px color-mix(in srgb, var(--color-threat-critical) 30%, transparent)',
  },
  high: {
    label: 'TINGGI',
    color: 'var(--color-threat-high)',
    bg: 'color-mix(in srgb, var(--color-threat-high) 15%, transparent)',
    border: 'color-mix(in srgb, var(--color-threat-high) 50%, transparent)',
    glow: '0 0 15px color-mix(in srgb, var(--color-threat-high) 30%, transparent)',
  },
  medium: {
    label: 'SEDANG',
    color: 'var(--color-threat-medium)',
    bg: 'color-mix(in srgb, var(--color-threat-medium) 15%, transparent)',
    border: 'color-mix(in srgb, var(--color-threat-medium) 50%, transparent)',
    glow: '0 0 15px color-mix(in srgb, var(--color-threat-medium) 30%, transparent)',
  },
  low: {
    label: 'RENDAH',
    color: 'var(--color-threat-low)',
    bg: 'color-mix(in srgb, var(--color-threat-low) 15%, transparent)',
    border: 'color-mix(in srgb, var(--color-threat-low) 50%, transparent)',
    glow: '0 0 12px color-mix(in srgb, var(--color-threat-low) 25%, transparent)',
  },
  unknown: {
    label: 'TIDAK DIKETAHUI',
    color: 'var(--color-threat-unknown)',
    bg: 'color-mix(in srgb, var(--color-threat-unknown) 15%, transparent)',
    border: 'color-mix(in srgb, var(--color-threat-unknown) 50%, transparent)',
    glow: 'none',
  },
};

export const INVESTIGATION_STATUS = ['active', 'pending', 'closed'] as const;
export type InvestigationStatus = (typeof INVESTIGATION_STATUS)[number];

export const INVESTIGATION_STATUS_META: Record<
  InvestigationStatus,
  { label: string; color: string }
> = {
  active: { label: 'AKTIF', color: 'var(--color-status-active)' },
  pending: { label: 'TERTUNDA', color: 'var(--color-status-pending)' },
  closed: { label: 'DITUTUP', color: 'var(--color-status-closed)' },
};

export const OPERATION_STATUS = ['planning', 'active', 'completed', 'aborted'] as const;
export type OperationStatus = (typeof OPERATION_STATUS)[number];

export const OPERATION_STATUS_META: Record<
  OperationStatus,
  { label: string; color: string }
> = {
  planning: { label: 'PERENCANAAN', color: 'var(--color-threat-medium)' },
  active: { label: 'BERLANGSUNG', color: 'var(--color-status-active)' },
  completed: { label: 'SELESAI', color: 'var(--color-on-surface-muted)' },
  aborted: { label: 'DIBATALKAN', color: 'var(--color-threat-critical)' },
};

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dasbor', icon: 'LayoutDashboard' },
  { href: '/map', label: 'Peta Intelijen', icon: 'Map' },
  { href: '/organizations', label: 'Organisasi', icon: 'Users' },
  { href: '/investigations', label: 'Investigasi', icon: 'Search' },
  { href: '/operations', label: 'Operasi', icon: 'Medal' },
  { href: '/activity', label: 'Umpan Aktivitas', icon: 'Radio' },
  { href: '/settings', label: 'Pengaturan', icon: 'Settings' },
] as const;

export const MAP_DIMENSIONS = { width: 970, height: 970 } as const;
