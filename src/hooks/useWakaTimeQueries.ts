import { useQuery, useQueryClient } from "@tanstack/react-query";
import { wakatimeApi } from "@/src/api/wakatime";
import { useWakaTime } from "@/src/context/WakaTimeContext";

const FIVE_MIN = 5 * 60 * 1000;
const TEN_MIN = 10 * 60 * 1000;
const THIRTY_MIN = 30 * 60 * 1000;

export const wakaKeys = {
  all: ["wakatime"] as const,
  user: () => [...wakaKeys.all, "user"] as const,
  today: () => [...wakaKeys.all, "today"] as const,
  week: () => [...wakaKeys.all, "week"] as const,
  stats: (range: string) => [...wakaKeys.all, "stats", range] as const,
  allTime: () => [...wakaKeys.all, "allTime"] as const, // add this
};

export function useWakaUser() {
  const { apiKey, customApiUrl, isConfigured } = useWakaTime();
  return useQuery({
    queryKey: [...wakaKeys.user(), apiKey],
    queryFn: () => wakatimeApi.getUser(apiKey!, customApiUrl ?? undefined),
    enabled: isConfigured,
    staleTime: THIRTY_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}

export function useTodaySummary() {
  const { apiKey, customApiUrl, isConfigured } = useWakaTime();
  return useQuery({
    queryKey: [...wakaKeys.today(), apiKey],
    queryFn: () =>
      wakatimeApi.getTodaySummary(apiKey!, customApiUrl ?? undefined),
    enabled: isConfigured,
    staleTime: FIVE_MIN,
    gcTime: TEN_MIN,
    retry: 1,
  });
}

export function useWeekSummaries() {
  const { apiKey, customApiUrl, isConfigured } = useWakaTime();
  return useQuery({
    queryKey: [...wakaKeys.week(), apiKey],
    queryFn: () =>
      wakatimeApi.getWeekSummaries(apiKey!, customApiUrl ?? undefined),
    enabled: isConfigured,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}
export function useAllTimeSinceToday() {
  const { apiKey, customApiUrl, isConfigured } = useWakaTime();
  return useQuery({
    queryKey: [...wakaKeys.all, "allTimeSinceToday", apiKey],
    queryFn: () =>
      wakatimeApi.getAllTimeSinceToday(apiKey!, customApiUrl ?? undefined),
    enabled: isConfigured,
    staleTime: THIRTY_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}
export function useWakaStats(range: "last_7_days" | "last_30_days") {
  const { apiKey, customApiUrl, isConfigured } = useWakaTime();
  return useQuery({
    queryKey: [...wakaKeys.stats(range), apiKey],
    queryFn: () =>
      wakatimeApi.getStats(range, apiKey!, customApiUrl ?? undefined),
    enabled: isConfigured,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}

export function useInvalidateWakaTime() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: wakaKeys.all });
}
