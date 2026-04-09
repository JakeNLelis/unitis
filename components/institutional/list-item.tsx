import React from 'react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface InstitutionalListItemProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
  value?: string | number;
  status?: string;
  timestamp?: string;
  action?: React.ReactNode;
  href?: string;
  trend?: {
    label: string;
    isPositive: boolean;
  };
}

export function InstitutionalListItem({
  title,
  subtitle,
  value,
  status,
  timestamp,
  action,
  href,
  trend,
  className,
  ...props
}: InstitutionalListItemProps) {
  const content = (
    <div
      className={cn(
        "group relative flex items-center justify-between py-5 px-6",
        "bg-background hover:bg-surface-low transition-colors duration-200",
        "border-b border-border last:border-0",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        <h3 className="font-heading text-lg font-bold tracking-tight text-foreground uppercase">
          {title}
        </h3>
        <div className="flex items-center gap-4">
          {subtitle && (
            <p className="text-sm text-muted-foreground font-medium">
              {subtitle}
            </p>
          )}
          {timestamp && (
            <>
              <div className="h-3 w-px bg-border hidden sm:block" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">
                {timestamp}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-8">
        {status && (
          <div className="hidden sm:block">
            <span className={cn(
              "px-3 py-1 text-[10px] font-black uppercase tracking-widest border border-foreground/10",
              status === 'approved' ? "bg-green-100 text-green-800" : 
              status === 'pending' ? "bg-amber-100 text-amber-800" : 
              "bg-red-100 text-red-800"
            )}>
              {status}
            </span>
          </div>
        )}
        
        {value !== undefined && (
          <div className="flex flex-col items-end">
            <span className="font-heading text-2xl font-black tabular-nums text-primary">
              {value}
            </span>
            {trend && (
              <span className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                trend.isPositive ? "text-green-600" : "text-destructive"
              )}>
                {trend.isPositive ? '↑' : '↓'} {trend.label}
              </span>
            )}
          </div>
        )}

        {action && (
          <div className="text-foreground/20 group-hover:text-primary transition-colors">
            {action}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
