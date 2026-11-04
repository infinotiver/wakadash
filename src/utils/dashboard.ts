import type { WakaSummaryDay, WakaProgramLanguage } from "@/src/types/wakatime";

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} hr${hours === 1 ? "" : "s"} ${minutes} min${minutes === 1 ? "" : "s"}`;
  }
  return `${minutes} min${minutes === 1 ? "" : "s"}`;
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
  const short = new Date(`${key}T12:00:00`).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  if (key === todayKey) return `Today, ${short}`;
  if (key === shiftDateKey(todayKey, -1)) return `Yesterday, ${short}`;
  const weekday = new Date(`${key}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
  });
  return `${weekday}, ${short}`;
}
