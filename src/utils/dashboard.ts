import type { WakaSummaryDay, WakaProgramLanguage } from "@/src/types/wakatime";

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

export function buildLanguageColorMap(languages: WakaProgramLanguage[] = []) {
  return new Map(languages.map((l) => [l.name.toLowerCase(), l.color]));
}

// Totals per rolling 7-day bucket, oldest first, ending today.
// The last bucket is the same "last 7 days" the This week number uses.
export function weeklyTotals(days: WakaSummaryDay[], weeks = 7): number[] {
  const totals: number[] = new Array(weeks).fill(0);
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (const day of days) {
    if (!day.range?.date) continue;
    const date = new Date(`${day.range.date}T12:00:00`);
    const daysAgo = Math.round((today.getTime() - date.getTime()) / 86400000);
    const bucket = Math.floor(daysAgo / 7); // 0 = most recent 7 days
    if (daysAgo >= 0 && bucket < weeks) {
      totals[weeks - 1 - bucket] += day.grand_total?.total_seconds ?? 0;
    }
  }
  return totals;
}