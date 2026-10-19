import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  wakatimeApi,
  WakaTimeApiError,
  type StatsRange,
} from "@/src/api/wakatime";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useEffect } from "react";
import { syncWidgets } from "@/src/widgets/syncWidgets";
import { postTodayNotification } from "../notifications/todayNotification";
// reusable math consts cuz I'll mess up them later

const FIVE_MIN = 5 * 60 * 1000;
const TEN_MIN = 10 * 60 * 1000;
const THIRTY_MIN = 30 * 60 * 1000;

// keys for react-query, so that we can invalidate them when the auth changes
export const wakaKeys = {
  all: ["wakatime"] as const,
  user: () => [...wakaKeys.all, "user"] as const,
  today: () => [...wakaKeys.all, "today"] as const,
  week: () => [...wakaKeys.all, "week"] as const,
  stats: (range: string) => [...wakaKeys.all, "stats", range] as const,
  allTime: () => [...wakaKeys.all, "allTime"] as const,
  goals: () => [...wakaKeys.all, "goals"] as const,
  goal: (id: string) => [...wakaKeys.all, "goal", id] as const,
};

function useWakaQueryScope() {
  // ts is important
  // ever query key ends with `...scope` so that if the auth generation changes, all queries will be invalidated and refetched
  // baseUrl changes bump authGeneration too now (see WakaTimeContext), so switching
  // servers busts the cache the same way rotating a key does

  const { authGeneration } = useWakaTime();
  return [authGeneration] as const;
}

export function useWakaUser() {
  const { apiKey, baseUrl, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.user(), ...scope],
    queryFn: () => wakatimeApi.getUser(apiKey!, baseUrl),
    enabled: isConfigured,
    staleTime: THIRTY_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}
export function useTodaySummary() {
  const { apiKey, baseUrl, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.today(), ...scope],
    queryFn: () => wakatimeApi.getTodaySummary(apiKey!, baseUrl),
    enabled: isConfigured,
    staleTime: FIVE_MIN,
    gcTime: TEN_MIN,
    retry: 1,
  });
}

export function useWeekSummaries() {
  const { apiKey, baseUrl, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.week(), ...scope],
    queryFn: () => wakatimeApi.getWeekSummaries(apiKey!, baseUrl),
    enabled: isConfigured,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}
export function useWindowSummaries(endDate: string) {
  const { apiKey, baseUrl, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.all, "window", endDate, ...scope],
    queryFn: () => wakatimeApi.getSummaryRange(7, apiKey!, baseUrl, endDate),
    enabled: isConfigured,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}
export function useSummaryRange(days: number) {
  const { apiKey, baseUrl, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.week(), "range", days, ...scope],
    queryFn: () => wakatimeApi.getSummaryRange(days, apiKey!, baseUrl),
    enabled: isConfigured,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}
export function useAllTimeSinceToday() {
  const { apiKey, baseUrl, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.all, "allTimeSinceToday", ...scope],
    queryFn: () => wakatimeApi.getAllTimeSinceToday(apiKey!, baseUrl),
    enabled: isConfigured,
    staleTime: THIRTY_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}
export function useWakaStats(range: StatsRange) {
  const { apiKey, baseUrl, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.stats(range), ...scope],
    queryFn: () => wakatimeApi.getStats(range, apiKey!, baseUrl),
    enabled: isConfigured,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    // 202 = WakaTime is still computing; keep polling instead of failing
    retry: (failureCount, error) =>
      error instanceof WakaTimeApiError && error.status === 202
        ? failureCount < 8
        : failureCount < 1,
    retryDelay: 3000,
  });
}

// the only public query endpoint that doesn't req an API key
// used to get programming langauge colors
export function useProgramLanguages() {
  return useQuery({
    queryKey: ["programLanguages"],
    queryFn: () => wakatimeApi.getProgramLanguages(),
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}

export function useSyncTodayNotification() {
  const todayQ = useTodaySummary();

  useEffect(() => {
    if (todayQ.isSuccess) postTodayNotification(todayQ.data);
  }, [todayQ.dataUpdatedAt]);
}

export function useSyncTodayPill() {
  const todayQ = useTodaySummary();
  const statsQ = useWakaStats("last_7_days");

  const today = todayQ.data?.grand_total?.text;
  const stats = statsQ.data;

  useEffect(() => {
    if (!today || todayQ.isError) return;

    syncWidgets({
      today,
      topLanguages: top(stats?.languages),
      topProjects: top(stats?.projects),
      topOS: top(stats?.operating_systems),
    });
  }, [today, stats, todayQ.isError]);
}

export function useGoals() {
  const { apiKey, baseUrl, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.goals(), ...scope],
    queryFn: () => wakatimeApi.getGoals(apiKey!, baseUrl),
    enabled: isConfigured,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}

export function useGoal(id: string) {
  const { apiKey, baseUrl, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.goal(id), ...scope],
    queryFn: () => wakatimeApi.getGoal(id, apiKey!, baseUrl),
    enabled: isConfigured,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}
export function useDaySummary(date: string) {
  const { apiKey, baseUrl, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.all, "day", date, ...scope],
    queryFn: () => wakatimeApi.getDaySummary(apiKey!, baseUrl, date),
    enabled: isConfigured,
    staleTime: FIVE_MIN, // past days rarely change, but late syncs can land
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}

function top(xs: { name: string; percent: number }[] = [], n = 3) {
  return xs.slice(0, n).map((x) => ({
    name: String(x?.name ?? "?"),
    percent: Number(x?.percent) || 0,
  }));
}
