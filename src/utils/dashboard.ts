import type { WakaSummaryDay, WakaProgramLanguage } from "@/src/types/wakatime";

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

const numberFormatter = new Intl.NumberFormat("en-US");

export function formatDuration(
  totalSeconds: number,
  options: { showSeconds?: boolean } = {},
): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  const parts: string[] = [];

  if (hours > 0) parts.push(`${numberFormatter.format(hours)}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (options.showSeconds && remainder > 0) parts.push(`${remainder}s`);

  return parts.length ? parts.join(" ") : "0m";
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

function parseDate(value: string): Date {
  return new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value,
  );
}

export function formatLongDate(value?: string | null): string {
  if (!value) return "Unknown date";
  const date = parseDate(value);
  if (isNaN(date.getTime())) return "Unknown date";
  return `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatShortDate(value?: string | null): string {
  if (!value) return "Unknown date";
  const date = parseDate(value);
  if (isNaN(date.getTime())) return "Unknown date";
  return `${WEEKDAYS[date.getDay()]}, ${date.getDate()} ${MONTHS[date.getMonth()]}`;
}

export function formatMonth(value?: string | null): string {
  if (!value) return "";
  const date = parseDate(value);
  return isNaN(date.getTime()) ? "" : MONTHS[date.getMonth()];
}

export function formatDateRange(
  start?: string | null,
  end?: string | null,
): string {
  if (!start || !end) return "Unknown date";
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime()))
    return "Unknown date";
  return `${startDate.getDate()} ${MONTHS[startDate.getMonth()]} – ${endDate.getDate()} ${MONTHS[endDate.getMonth()]}`;
}

export function sumSummarySeconds(days: WakaSummaryDay[]): number {
  return days.reduce(
    (sum, day) => sum + (day.grand_total?.total_seconds ?? 0),
    0,
  );
}

export function averageSummarySeconds(days: WakaSummaryDay[]): number {
  return days.length ? sumSummarySeconds(days) / days.length : 0;
}

export function buildLanguageColorMap(languages: WakaProgramLanguage[] = []) {
  return new Map(languages.map((l) => [l.name.toLowerCase(), l.color]));
}

// Local-time YYYY-MM-DD
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Noon avoids DST edge cases when adding days.
export function shiftDateKey(key: string, days: number): string {
  const d = new Date(`${key}T12:00:00`);
  d.setDate(d.getDate() + days);
  return toDateKey(d);
}

export function dayHeading(key: string, todayKey: string): string {
  const short = formatLongDate(key);
  if (key === todayKey) return `Today, ${short}`;
  if (key === shiftDateKey(todayKey, -1)) return `Yesterday, ${short}`;
  const weekday = WEEKDAYS[new Date(`${key}T12:00:00`).getDay()];
  return `${weekday}, ${short}`;
}
