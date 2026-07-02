import * as React from 'react';
import { cn } from '@/lib/utils';

export function Separator({ className, orientation = 'horizontal', ...props }: React.HTMLAttributes<HTMLDivElement> & { orientation?: 'horizontal' | 'vertical' }) {
  return (
    <div
      role="separator"
      className={cn(
        'bg-border-steel/60',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 px-6 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="w-12 h-12 rounded-full border border-border-steel bg-surface-gunmetal/50 flex items-center justify-center">
          <Icon className="w-5 h-5 text-on-surface-muted" />
        </div>
      )}
      <div className="space-y-1">
        <p className="font-headline-md text-base text-on-surface">{title}</p>
        {description && <p className="font-body-md text-xs text-on-surface-muted max-w-sm">{description}</p>}
      </div>
      {action}
    </div>
  );
}
