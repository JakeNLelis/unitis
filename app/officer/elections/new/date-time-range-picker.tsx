"use client";

import { useMemo, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Clock3 } from "lucide-react";

import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="border-t pt-4 space-y-4">
      <div className="space-y-1">
        <h3 className="font-medium">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <Card className="p-0">
        <CardContent className="p-0">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            numberOfMonths={2}
            className="w-full"
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor={`${startName}_time`}>{startLabel}</Label>
          <div className="relative">
            <Input
              id={`${startName}_time`}
              type="time"
              step="60"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="pr-9 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              required={required}
            />
            <Clock3 className="size-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${endName}_time`}>{endLabel}</Label>
          <div className="relative">
            <Input
              id={`${endName}_time`}
              type="time"
              step="60"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="pr-9 appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
              required={required}
            />
            <Clock3 className="size-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
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
