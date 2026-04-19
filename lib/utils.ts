import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ElectionState } from "./types/election";

export const hasEnvVars = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Extract YYYY-MM-DD from any date/timestamp string or Date object.
 *  Uses local time to avoid UTC timezone mismatch. */
export function toDateStr(value: string | Date): string {
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  // DB may return "2026-02-27" or "2026-02-27T00:00:00+00:00" — take first 10 chars
  return value.slice(0, 10);
}

/** Get today's date as YYYY-MM-DD string using local time. */
export function getTodayStr(): string {
  return toDateStr(new Date());
}

const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toBoundaryDateTime(
  value: string | Date,
  boundary: "start" | "end",
): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const input = value.trim();
  if (!input) {
    return null;
  }

  // For legacy date-only values, interpret as full local day.
  const normalized = DATE_ONLY_PATTERN.test(input)
    ? `${input}${boundary === "start" ? "T00:00:00.000" : "T23:59:59.999"}`
    : input;

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export type DateTimeWindowStatus =
  | "not_configured"
  | "not_started"
  | "open"
  | "ended";

export function getDateTimeWindowStatus(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  now: Date = new Date(),
): DateTimeWindowStatus {
  if (!startDate || !endDate) {
    return "not_configured";
  }

  const start = toBoundaryDateTime(startDate, "start");
  const end = toBoundaryDateTime(endDate, "end");

  if (!start || !end) {
    return "not_configured";
  }

  const nowMs = now.getTime();
  if (Number.isNaN(nowMs)) {
    return "not_configured";
  }

  if (nowMs < start.getTime()) {
    return "not_started";
  }

  if (nowMs <= end.getTime()) {
    return "open";
  }

  return "ended";
}

export function isDateTimeWindowOpen(
  startDate: string | Date | null | undefined,
  endDate: string | Date | null | undefined,
  now: Date = new Date(),
): boolean {
  return getDateTimeWindowStatus(startDate, endDate, now) === "open";
}

function toReferenceDateTime(value: Date | string): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const input = value.trim();
  if (!input) {
    return null;
  }

  // Keep backward compatibility for date-only references by resolving to
  // end-of-day local time.
  return toBoundaryDateTime(input, "end");
}

// Election state resolution utilities

/** Determine if an election is upcoming, active, or ended based on full
 *  start/end timestamps. */
export function getElectionState(
  startDate: string | Date,
  endDate: string | Date,
  reference: Date | string = new Date(),
): ElectionState {
  const start = toBoundaryDateTime(startDate, "start");
  const end = toBoundaryDateTime(endDate, "end");
  const now = toReferenceDateTime(reference);

  if (!start || !end || !now) {
    return "ended";
  }

  const nowMs = now.getTime();
  const startMs = start.getTime();
  const endMs = end.getTime();

  if (nowMs < startMs) {
    return "upcoming";
  } else if (nowMs <= endMs) {
    return "active";
  } else {
    return "ended";
  }
}

/** Check if an election is currently active.
 *  Active: now >= start_date AND now <= end_date */
export function isElectionActive(
  startDate: string | Date,
  endDate: string | Date,
  reference: Date | string = new Date(),
): boolean {
  return getElectionState(startDate, endDate, reference) === "active";
}

/** Check if an election is upcoming (not yet started). */
export function isElectionUpcoming(
  startDate: string | Date,
  reference: Date | string = new Date(),
): boolean {
  const start = toBoundaryDateTime(startDate, "start");
  const now = toReferenceDateTime(reference);

  if (!start || !now) {
    return false;
  }

  return now.getTime() < start.getTime();
}

/** Check if an election has ended (past end_date). */
export function isElectionEnded(
  endDate: string | Date,
  reference: Date | string = new Date(),
): boolean {
  const end = toBoundaryDateTime(endDate, "end");
  const now = toReferenceDateTime(reference);

  if (!end || !now) {
    return false;
  }

  return now.getTime() > end.getTime();
}
