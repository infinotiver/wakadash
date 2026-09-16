import { useQuery } from "@tanstack/react-query";
import { wakatimeApi } from "@/src/api/wakatime";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useEffect } from "react";
import { syncTodayPill } from "@/src/widgets/syncTodayPill";

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
export function useWakaStats(
  range:
    | "last_7_days"
    | "last_30_days"
    | "last_6_months"
    | "last_year"
    | "all_time",
) {
  const { apiKey, baseUrl, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.stats(range), ...scope],
    queryFn: () => wakatimeApi.getStats(range, apiKey!, baseUrl),
    enabled: isConfigured,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
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

export function useSyncTodayPill() {
  const todayQ = useTodaySummary();
  const text = todayQ.data?.grand_total?.text;

  useEffect(() => {
    if (!text || todayQ.isError) return;
    syncTodayPill(text);
  }, [text, todayQ.isError]);
}