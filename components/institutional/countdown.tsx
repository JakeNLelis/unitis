"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { archivo } from "@/lib/fonts";
import type { InstitutionalCountdownProps } from "@/lib/types/institutional";

export function InstitutionalCountdown({
  targetDate,
  label = "Institutional Session Timeout",
  expiredLabel = "Session Concluded",
  className,
}: InstitutionalCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: string;
    minutes: string;
    seconds: string;
    isExpired: boolean;
  }>({ hours: "00", minutes: "00", seconds: "00", isExpired: false });

  useEffect(() => {
    const target = new Date(targetDate).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = target - now;

      if (distance < 0) {
        setTimeLeft({
          hours: "00",
          minutes: "00",
          seconds: "00",
          isExpired: true,
        });
        return;
      }

      const h = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({
        hours: h.toString().padStart(2, "0"),
        minutes: m.toString().padStart(2, "0"),
        seconds: s.toString().padStart(2, "0"),
        isExpired: false,
      });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground italic">
        {timeLeft.isExpired ? expiredLabel : label}
      </p>

      <div className="flex items-baseline gap-3">
        <div className="flex flex-col items-center">
          <span
            className={cn(
              "text-4xl font-black tabular-nums tracking-tighter",
              archivo.className,
            )}
          >
            {timeLeft.hours}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground -mt-1">
            Hrs
          </span>
        </div>

        <span className="text-2xl font-black text-foreground/20 self-start mt-1">
          :
        </span>

        <div className="flex flex-col items-center">
          <span
            className={cn(
              "text-4xl font-black tabular-nums tracking-tighter",
              archivo.className,
            )}
          >
            {timeLeft.minutes}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground -mt-1">
            Min
          </span>
        </div>

        <span className="text-2xl font-black text-foreground/20 self-start mt-1">
          :
        </span>

        <div className="flex flex-col items-center">
          <span
            className={cn(
              "text-4xl font-black tabular-nums tracking-tighter text-primary",
              archivo.className,
            )}
          >
            {timeLeft.seconds}
          </span>
          <span className="text-[8px] font-bold uppercase tracking-widest text-primary/60 -mt-1">
            Sec
          </span>
        </div>
      </div>
    </div>
  );
}
