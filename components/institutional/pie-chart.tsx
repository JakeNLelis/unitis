import React from 'react';
import { cn } from '@/lib/utils';
import { archivo } from '@/lib/fonts';

interface InstitutionalPieChartProps {
  percentage: number;
  label?: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function InstitutionalPieChart({
  percentage,
  label,
  size = 120,
  strokeWidth = 12,
  className,
}: InstitutionalPieChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("flex flex-col items-center gap-4", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background Circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-surface-lowest"
          />
          {/* Progress Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            style={{ strokeDashoffset: offset }}
            strokeLinecap="butt"
            className="text-primary transition-all duration-1000 ease-in-out"
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-black tabular-nums tracking-tighter", archivo.className)}>
            {Math.round(percentage)}%
          </span>
          {label && (
            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground -mt-1">
              {label}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
