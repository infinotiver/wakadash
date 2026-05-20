import { useQuery } from "@tanstack/react-query";
import { useWakaTime } from "@/src/context/WakaTimeContext";

export function useWakaUser() {
  const { fetchUser, isConfigured } = useWakaTime();
  return useQuery({
    queryKey: ["wakatime", "user"],
    queryFn: fetchUser,
    enabled: isConfigured,
  });
}

export function useTodaySummary() {
  const { fetchTodaySummary, isConfigured } = useWakaTime();
  return useQuery({
    queryKey: ["wakatime", "today"],
    queryFn: fetchTodaySummary,
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWeekSummaries() {
  const { fetchWeekSummaries, isConfigured } = useWakaTime();
  return useQuery({
    queryKey: ["wakatime", "week"],
    queryFn: fetchWeekSummaries,
    enabled: isConfigured,
    staleTime: 10 * 60 * 1000,
  });
}

export function useWakaStats(range: "last_7_days" | "last_30_days") {
  const { fetchStats, isConfigured } = useWakaTime();
  return useQuery({
    queryKey: ["wakatime", "stats", range],
    queryFn: () => fetchStats(range),
    enabled: isConfigured,
    staleTime: 10 * 60 * 1000,
  });
}
