import type {
  WakaUser,
  WakaSummaryDay,
  WakaStats,
  WakaAllTime,
} from "@/src/types/wakatime";

export const DEFAULT_BASE_URL = "https://wakatime.com/api/v1";

export class WakaTimeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "WakaTimeApiError";
  }
}

function authHeader(apiKey: string): string {
  const encoded = btoa(`${apiKey}:`);
  return `Basic ${encoded}`;
}

async function wakFetch(
  path: string,
  apiKey: string,
) {
  const res = await fetch(`${DEFAULT_BASE_URL}${path}`, {
    headers: { Authorization: authHeader(apiKey) },
  });
  if (res.status === 401) throw new WakaTimeApiError("Invalid API key", 401);
  if (res.status === 202) {
    throw new WakaTimeApiError("Stats processing, retry shortly", 202);
  }
  if (!res.ok) throw new WakaTimeApiError(`API error ${res.status}`, res.status);
  return res.json();
}

const fmt = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const wakatimeApi = {
  verifyKey: (apiKey: string): Promise<WakaUser> =>
    wakFetch("/users/current", apiKey).then((d) => d.data),
  getUser: (apiKey: string): Promise<WakaUser> =>
    wakFetch("/users/current", apiKey).then((d) => d.data),

  getTodaySummary: (
    apiKey: string,
  ): Promise<WakaSummaryDay | null> => {
    const today = fmt(new Date());
    return wakFetch(
      `/users/current/summaries?start=${today}&end=${today}`,
      apiKey,
    ).then((d) => d.data?.[0] ?? null);
  },
  getWeekSummaries: (
    apiKey: string,
  ): Promise<WakaSummaryDay[]> => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return wakFetch(
      `/users/current/summaries?start=${fmt(start)}&end=${fmt(end)}`,
      apiKey,
    ).then((d) => d.data ?? []);
  },
  getAllTimeSinceToday: (
    apiKey: string,
  ): Promise<WakaAllTime> =>
    wakFetch("/users/current/all_time_since_today", apiKey).then(
      (d) => d.data,
    ),

  getStats: (
    range: "last_7_days" | "last_30_days",
    apiKey: string,
  ): Promise<WakaStats> =>
    wakFetch(`/users/current/stats/${range}`, apiKey).then(
      (d) => d.data,
    ),
};
