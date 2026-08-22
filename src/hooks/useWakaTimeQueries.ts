import { useQuery } from "@tanstack/react-query";
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
  allTime: () => [...wakaKeys.all, "allTime"] as const,
};

function useWakaQueryScope() {
  const { authGeneration } = useWakaTime();
  return [authGeneration] as const;
}
export function useWakaUser() {
  const { apiKey, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.user(), ...scope],
    queryFn: () => wakatimeApi.getUser(apiKey!),
    enabled: isConfigured,
    staleTime: THIRTY_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}
export function useTodaySummary() {
  const { apiKey, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.today(), ...scope],
    queryFn: () => wakatimeApi.getTodaySummary(apiKey!),
    enabled: isConfigured,
    staleTime: FIVE_MIN,
    gcTime: TEN_MIN,
    retry: 1,
  });
}

export function useWeekSummaries() {
  const { apiKey, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.week(), ...scope],
    queryFn: () => wakatimeApi.getWeekSummaries(apiKey!),
    enabled: isConfigured,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}
export function useAllTimeSinceToday() {
  const { apiKey, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.all, "allTimeSinceToday", ...scope],
    queryFn: () => wakatimeApi.getAllTimeSinceToday(apiKey!),
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
  const { apiKey, isConfigured } = useWakaTime();
  const scope = useWakaQueryScope();
  return useQuery({
    queryKey: [...wakaKeys.stats(range), ...scope],
    queryFn: () => wakatimeApi.getStats(range, apiKey!),
    enabled: isConfigured,
    staleTime: TEN_MIN,
    gcTime: THIRTY_MIN,
    retry: 1,
  });
}

export function useProgramLanguages() {
  return useQuery({
    queryKey: ["programLanguages"],
    queryFn: () => wakatimeApi.getProgramLanguages(),
    gcTime: 1000 * 60 * 60 * 24 * 7,
  });
}
