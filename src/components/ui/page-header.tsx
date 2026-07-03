import * as React from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  label: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}

export function PageHeader({ label, title, description, actions, icon: Icon, className }: PageHeaderProps) {
  return (
    <div
      className={cn('opacity-0 animate-fade-slide-up flex items-start justify-between gap-4 flex-wrap', className)}
      style={{ animationFillMode: 'forwards' }}
    >
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        )}
        <div className="min-w-0">
          <p className="font-data-mono text-data-mono text-on-surface-muted tracking-widest uppercase leading-none">
            {label}
          </p>
          <h1 className="font-display-lg text-display-lg text-on-surface mt-1 leading-tight">{title}</h1>
          {description && (
            <p className="font-body-md text-sm text-on-surface-variant mt-2 max-w-2xl">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
