import type { useColors } from "@/src/hooks/useColors";
import type {
  GoalStatus,
  WakaGoal,
  WakaGoalChartPoint,
} from "@/src/types/wakatime";

export const goalTitle = (g: Pick<WakaGoal, "custom_title" | "title">) =>
  g.custom_title || g.title;

export const isGoalActive = (g: WakaGoal) => g.is_enabled && !g.is_snoozed;

export const currentPoint = (g: WakaGoal): WakaGoalChartPoint | undefined =>
  g.chart_data[g.chart_data.length - 1];

const isDone = (p: WakaGoalChartPoint) =>
  p.range_status === "success" || p.range_status === "fail";

const mean = (nums: number[]) =>
  nums.length ? nums.reduce((s, n) => s + n, 0) / nums.length : 0;

export interface GoalStats {
  streak: number;
  successRate: number | null;
  completed: number;
  best: WakaGoalChartPoint | null;
  avgActual: number;
  avgTarget: number;
  trendPct: number | null;
}

// Pending (in-progress) and ignored periods never break or extend a streak,
// and are excluded from rates; only success/fail periods count.
export function computeGoalStats(
  points: WakaGoalChartPoint[],
  isInverse: boolean,
): GoalStats {
  const done = points.filter(isDone);

  let streak = 0;
  for (let i = points.length - 1; i >= 0; i--) {
    const s = points[i].range_status;
    if (s === "pending" || s === "ignored") continue;
    if (s === "success") streak++;
    else break;
  }

  const successes = done.filter((p) => p.range_status === "success").length;

  const best = done.length
    ? done.reduce((b, p) =>
        (
          isInverse
            ? p.actual_seconds < b.actual_seconds
            : p.actual_seconds > b.actual_seconds
        )
          ? p
          : b,
      )
    : null;

  const window = Math.min(7, Math.floor(done.length / 2));
  let trendPct: number | null = null;
  if (window >= 2) {
    const recent = mean(done.slice(-window).map((p) => p.actual_seconds));
    const prev = mean(
      done.slice(-window * 2, -window).map((p) => p.actual_seconds),
    );
    if (prev > 0) trendPct = ((recent - prev) / prev) * 100;
  }

  return {
    streak,
    successRate: done.length ? successes / done.length : null,
    completed: done.length,
    best,
    avgActual: mean(done.map((p) => p.actual_seconds)),
    avgTarget: mean(done.map((p) => p.goal_seconds)),
    trendPct,
  };
}

export function statusMeta(
  status: GoalStatus,
  c: ReturnType<typeof useColors>,
) {
  switch (status) {
    case "success":
      return {
        label: "Met",
        color: c.accent.green.color,
        container: c.accent.green.colorContainer,
        onContainer: c.accent.green.onColorContainer,
      };
    case "fail":
      return {
        label: "Missed",
        color: c.error,
        container: c.errorContainer,
        onContainer: c.onErrorContainer,
      };
    case "pending":
      return {
        label: "In progress",
        color: c.tertiary,
        container: c.tertiaryContainer,
        onContainer: c.onTertiaryContainer,
      };
    default:
      return {
        label: "Ignored",
        color: c.outline,
        container: c.surfaceVariant,
        onContainer: c.onSurfaceVariant,
      };
  }
}

export function formatShortDate(iso?: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function timeAgo(iso?: string | null): string {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  if (isNaN(ms)) return "—";
  const min = Math.max(0, Math.floor(ms / 60000));
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function pointLabel(p: WakaGoalChartPoint): string {
  const raw = p.range.date ? `${p.range.date}T12:00:00` : p.range.start;
  const d = new Date(raw);
  return isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
