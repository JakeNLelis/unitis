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

// Election state resolution utilities

/** Determine if an election is upcoming, active, or ended based on current date.
 *  Uses deterministic YYYY-MM-DD string comparison to avoid timezone issues. */
export function getElectionState(
  startDate: string | Date,
  endDate: string | Date,
  today: string = getTodayStr(),
): ElectionState {
  const start = toDateStr(startDate);
  const end = toDateStr(endDate);

  if (today < start) {
    return "upcoming";
  } else if (today <= end) {
    return "active";
  } else {
    return "ended";
  }
}

/** Check if an election is currently active.
 *  Active: today >= start_date AND today <= end_date */
export function isElectionActive(
  startDate: string | Date,
  endDate: string | Date,
  today: string = getTodayStr(),
): boolean {
  return getElectionState(startDate, endDate, today) === "active";
}

/** Check if an election is upcoming (not yet started). */
export function isElectionUpcoming(
  startDate: string | Date,
  today: string = getTodayStr(),
): boolean {
  const start = toDateStr(startDate);
  return today < start;
}

/** Check if an election has ended (past end_date). */
export function isElectionEnded(
  endDate: string | Date,
  today: string = getTodayStr(),
): boolean {
  const end = toDateStr(endDate);
  return today > end;
}
