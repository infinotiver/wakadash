import type {
  WakaUser,
  WakaSummaryDay,
  WakaStats,
  WakaAllTime,
} from "@/src/types/wakatime";

const DEFAULT_BASE_URL = "https://wakatime.com/api/v1";

function authHeader(apiKey: string): string {
  const encoded =
    typeof btoa !== "undefined"
      ? btoa(apiKey + ":")
      : Buffer.from(apiKey + ":").toString("base64");
  return `Basic ${encoded}`;
}

async function wakFetch(
  path: string,
  apiKey: string,
  baseUrl = DEFAULT_BASE_URL,
) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: authHeader(apiKey) },
  });
  if (res.status === 401) throw new Error("Invalid API key");
  if (res.status === 202) throw new Error("Stats processing, retry shortly");
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

const fmt = (d: Date) => d.toISOString().split("T")[0];

export const wakatimeApi = {
  getUser: (apiKey: string, baseUrl?: string): Promise<WakaUser> =>
    wakFetch("/users/current", apiKey, baseUrl).then((d) => d.data),

  getTodaySummary: (
    apiKey: string,
    baseUrl?: string,
  ): Promise<WakaSummaryDay | null> => {
    const today = fmt(new Date());
    return wakFetch(
      `/users/current/summaries?start=${today}&end=${today}`,
      apiKey,
      baseUrl,
    ).then((d) => d.data?.[0] ?? null);
  },
  getWeekSummaries: (
    apiKey: string,
    baseUrl?: string,
  ): Promise<WakaSummaryDay[]> => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    return wakFetch(
      `/users/current/summaries?start=${fmt(start)}&end=${fmt(end)}`,
      apiKey,
      baseUrl,
    ).then((d) => d.data ?? []);
  },
  getAllTimeSinceToday: (
    apiKey: string,
    baseUrl?: string,
  ): Promise<WakaAllTime> =>
    wakFetch("/users/current/all_time_since_today", apiKey, baseUrl).then(
      (d) => d.data,
    ),

  getStats: (
    range: "last_7_days" | "last_30_days",
    apiKey: string,
    baseUrl?: string,
  ): Promise<WakaStats> =>
    wakFetch(`/users/current/stats/${range}`, apiKey, baseUrl).then(
      (d) => d.data,
    ),
};
