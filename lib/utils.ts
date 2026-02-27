import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
