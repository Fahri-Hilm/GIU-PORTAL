import * as React from 'react';
import { Card } from '@/components/ui/card';
import { CornerBrackets } from '@/components/tactical';
import { cn } from '@/lib/utils';

interface TacticalCardProps extends React.HTMLAttributes<HTMLDivElement> {
  accent?: string;
}

export function TacticalCard({ className, children, accent = 'var(--color-primary)', ...props }: TacticalCardProps) {
  return (
    <Card className={cn('relative overflow-hidden noise-overlay', className)} {...props}>
      <CornerBrackets size={10} color={accent} className="opacity-30" />
      {children}
    </Card>
  );
}
