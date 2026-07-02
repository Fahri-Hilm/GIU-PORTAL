import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { THREAT_META } from '@/lib/constants';
import type { ThreatLevel } from '@/lib/constants';

const badgeVariants = cva(
  'inline-flex items-center gap-1 font-label-caps text-[10px] px-2 py-0.5 rounded border transition-smooth',
  {
    variants: {
      variant: {
        default: 'border-border-steel bg-surface-gunmetal/60 text-on-surface-variant',
        primary: 'border-primary/40 bg-primary/10 text-primary',
        outline: 'border-border-steel text-on-surface-variant',
      },
    },
    defaultVariants: { variant: 'default' },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export function ThreatBadge({
  level,
  className,
  withPulse,
}: {
  level: ThreatLevel;
  className?: string;
  withPulse?: boolean;
}) {
  const meta = THREAT_META[level];
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 font-label-caps text-[10px] px-2 py-0.5 rounded border', className)}
      style={{
        color: meta.color,
        background: meta.bg,
        borderColor: meta.border,
        boxShadow: withPulse ? meta.glow : undefined,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: meta.color, boxShadow: withPulse ? meta.glow : undefined }}
      />
      {meta.label}
    </span>
  );
}
