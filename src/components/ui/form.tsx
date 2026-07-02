import * as React from 'react';
import { cn } from '@/lib/utils';

export { Input } from './input';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'flex min-h-[80px] w-full rounded-md border border-border-steel bg-surface-container-lowest/60 px-3 py-2 font-body-md text-sm text-on-surface transition-smooth placeholder:text-on-surface-muted/60 focus-visible:outline-none focus-visible:border-primary/60 focus-visible:ring-2 focus-visible:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-50 resize-y',
      className,
    )}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

export const Label = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      'font-label-caps text-label-caps text-on-surface-variant block mb-1.5',
      className,
    )}
    {...props}
  />
));
Label.displayName = 'Label';
