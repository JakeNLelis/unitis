"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Clock3, Calendar as CalendarIcon } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function toDateInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildDateTimeLocalValue(date?: Date, time?: string): string {
  if (!date || !time) return "";
  const datePart = toDateInputValue(date);
  const normalizedTime = time.length === 5 ? `${time}:00` : time;
  return `${datePart}T${normalizedTime}`;
}

interface DateTimeRangePickerProps {
  title: string;
  description?: string;
  startLabel: string;
  endLabel: string;
  startName: string;
  endName: string;
  required?: boolean;
}

export function DateTimeRangePicker({
  title,
  description,
  startLabel,
  endLabel,
  startName,
  endName,
  required = false,
}: DateTimeRangePickerProps) {
  const [range, setRange] = useState<DateRange | undefined>();
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("17:00");

  const startDateTime = useMemo(
    () => buildDateTimeLocalValue(range?.from, startTime),
    [range?.from, startTime],
  );

  const endDateTime = useMemo(
    () => buildDateTimeLocalValue(range?.to, endTime),
    [range?.to, endTime],
  );

  return (
    <div className="space-y-6 pt-6 border-t-2 border-foreground/10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-xl font-black font-heading uppercase tracking-tighter flex items-center gap-2">
            <CalendarIcon className="size-5 text-primary" />
            {title}
          </h3>
          {description && (
            <p className="text-sm font-medium text-muted-foreground italic pl-7">{description}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Section */}
        <div className="lg:col-span-8 border-2 border-foreground p-4 bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            className="w-full flex justify-center"
          />
        </div>

        {/* Time Selection Section */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 border-2 border-foreground bg-surface-low space-y-4">
            <div className="space-y-2">
              <Label 
                htmlFor={`${startName}_time`}
                className="text-xs font-black uppercase tracking-widest text-muted-foreground"
              >
                {startLabel}
              </Label>
              <div className="relative">
                <Input
                  id={`${startName}_time`}
                  type="time"
                  step="60"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="bg-background border-2 border-foreground rounded-none font-bold tabular-nums h-12 pr-10 focus-visible:ring-0 focus-visible:border-primary transition-colors [&::-webkit-calendar-picker-indicator]:hidden"
                  required={required}
                />
                <Clock3 className="size-5 text-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-2">
              <Label 
                htmlFor={`${endName}_time`}
                className="text-xs font-black uppercase tracking-widest text-muted-foreground"
              >
                {endLabel}
              </Label>
              <div className="relative">
                <Input
                  id={`${endName}_time`}
                  type="time"
                  step="60"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="bg-background border-2 border-foreground rounded-none font-bold tabular-nums h-12 pr-10 focus-visible:ring-0 focus-visible:border-primary transition-colors [&::-webkit-calendar-picker-indicator]:hidden"
                  required={required}
                />
                <Clock3 className="size-5 text-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
            
            <div className="pt-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-primary/60 mb-1">Status Overlay</div>
              <div className="bg-white border border-foreground/10 px-3 py-2 text-xs font-mono">
                {range?.from ? range.from.toLocaleDateString() : 'SELECT DATE'} ➔ {range?.to ? range.to.toLocaleDateString() : '...'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <input
        type="hidden"
        name={startName}
        value={startDateTime}
        required={required}
      />
      <input
        type="hidden"
        name={endName}
        value={endDateTime}
        required={required}
      />
    </div>
  );
}
