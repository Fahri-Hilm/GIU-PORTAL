'use client';

import { cn } from '@/lib/utils';

export function CornerBrackets({
  size = 16,
  color = 'var(--color-primary)',
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  const s = `${size}px`;
  const common = 'absolute w-[var(--bracket-size)] h-[var(--bracket-size)] border-[var(--color)]';
  return (
    <div
      className={cn('pointer-events-none absolute inset-0', className)}
      style={{ ['--bracket-size' as string]: s, ['--color' as string]: color }}
      aria-hidden
    >
      <div className={cn(common, 'top-0 left-0 border-t-2 border-l-2 rounded-tl-md')} />
      <div className={cn(common, 'top-0 right-0 border-t-2 border-r-2 rounded-tr-md')} />
      <div className={cn(common, 'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-md')} />
      <div className={cn(common, 'bottom-0 right-0 border-b-2 border-r-2 rounded-br-md')} />
    </div>
  );
}

export function GridOverlay({ className, opacity = 0.4 }: { className?: string; opacity?: number }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 grid-pattern', className)}
      style={{ opacity }}
      aria-hidden
    />
  );
}

export function ScanLine({ className, delay = 0 }: { className?: string; delay?: number }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}
      aria-hidden
    >
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--color-primary), transparent)',
          opacity: 0.6,
          animation: `scan-sweep 4s linear ${delay}s infinite`,
        }}
      />
      <style>{`
        @keyframes scan-sweep {
          0% { top: -2px; opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

export function TacticalFrame({
  children,
  className,
  label,
  accent = 'var(--color-primary)',
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
  accent?: string;
}) {
  return (
    <div className={cn('relative', className)}>
      <CornerBrackets size={12} color={accent} />
      {label && (
        <div className="absolute -top-2 left-4 px-2 bg-surface-graphite z-10">
          <span className="font-label-caps text-[9px] tracking-widest" style={{ color: accent }}>
            {label}
          </span>
        </div>
      )}
      {children}
    </div>
  );
}

export function StatusDot({
  color = 'var(--color-status-active)',
  pulse = true,
  size = 6,
}: {
  color?: string;
  pulse?: boolean;
  size?: number;
}) {
  return (
    <span className="relative inline-flex" style={{ width: size, height: size }}>
      {pulse && (
        <span
          className="absolute inset-0 rounded-full animate-ping"
          style={{ background: color, opacity: 0.5 }}
        />
      )}
      <span
        className="relative inline-flex rounded-full"
        style={{ width: size, height: size, background: color, boxShadow: `0 0 8px ${color}` }}
      />
    </span>
  );
}

export function HUDStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-data-mono text-[10px] text-on-surface-muted uppercase tracking-wider">
        {label}
      </span>
      <span
        className="font-headline-md text-xl tabular-nums"
        style={{ color: accent ?? 'var(--color-on-surface)' }}
      >
        {value}
      </span>
    </div>
  );
}
