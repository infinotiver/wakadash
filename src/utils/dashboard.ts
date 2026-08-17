import type { WakaSummaryDay } from "@/src/types/wakatime";

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
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
