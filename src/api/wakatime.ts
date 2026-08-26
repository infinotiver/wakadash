import type {
  WakaUser,
  WakaSummaryDay,
  WakaStats,
  CodingAllTime,
  WakaProgramLanguage,
  HackaTimeStats,
} from "@/src/types/wakatime";
import {
  normalizeHackaTimeStats,
  normalizeWakaAllTime,
} from "../utils/normalize";

export const DEFAULT_BASE_URL = "https://wakatime.com/api/v1";

// just a basic error class
export class WakaTimeApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "WakaTimeApiError";
  }
}

// Hackatime authenticates via `Authorization: Bearer <key>`. WakaTime (and
// "custom", assumed WakaTime-shaped) uses Basic auth like WakaTime's own API.
function isHackatime(baseUrl: string): boolean {
  return baseUrl.includes("hackatime.hackclub.com");
}

function authHeader(apiKey: string, baseUrl: string): string {
  return isHackatime(baseUrl)
    ? `Bearer ${apiKey}`
    : `Basic ${btoa(`${apiKey}:`)}`;
}

// Thrown synchronously, before any request goes out, 
// API never returns 501, so this can't collide with a genuine server error.
function unsupported(what: string): never {
  throw new WakaTimeApiError(`${what} isn't available on this server`, 501);
}

async function wakFetch(path: string, apiKey: string, baseUrl: string) {
  const res = await fetch(`${baseUrl}${path}`, {
    headers: { Authorization: authHeader(apiKey, baseUrl) },
  });
  if (res.status === 401) throw new WakaTimeApiError("Invalid API key", 401);
  if (res.status === 202) {
    throw new WakaTimeApiError("Stats processing, retry shortly", 202);
  }
  if (!res.ok)
    throw new WakaTimeApiError(`API error ${res.status}`, res.status);
  return res.json();
}

// language reference data always comes from real WakaTime
async function wakFetchPublic(path: string) {
  const res = await fetch(`${DEFAULT_BASE_URL}${path}`);
  if (!res.ok)
    throw new WakaTimeApiError(`API error ${res.status}`, res.status);
  return res.json();
}

// not to be confused with the other user facing date formatter, wakatime requires a specific format for the API, which is YYYY-MM-DD. This function formats a Date object into that string format.

const fmt = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
// Hackatime's WakaTime-compatible endpoints live under /api/hackatime/v1 —
// that's what `baseUrl` normally points at. This one specific endpoint
// (native user stats, not WakaTime-shaped) lives under /api/v1 instead,
// so it needs its own fixed base regardless of the configured baseUrl.

const HACKATIME_NATIVE_BASE_URL = "https://hackatime.hackclub.com/api/v1";

export const wakatimeApi = {
  verifyKey: (apiKey: string, baseUrl: string): Promise<WakaUser> =>
    wakFetch("/users/current", apiKey, baseUrl).then((d) => d.data),
  getUser: (apiKey: string, baseUrl: string): Promise<WakaUser> =>
    wakFetch("/users/current", apiKey, baseUrl).then((d) => d.data),

  getTodaySummary: (
    apiKey: string,
    baseUrl: string,
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
    baseUrl: string,
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
    baseUrl: string,
  ): Promise<CodingAllTime> =>
    isHackatime(baseUrl)
      ? wakFetch("/users/my/stats", apiKey, HACKATIME_NATIVE_BASE_URL).then(
          (d) => normalizeHackaTimeStats(d),
        )
      : wakFetch("/users/current/all_time_since_today", apiKey, baseUrl).then(
          (d) => normalizeWakaAllTime(d.data),
        ),

  getStats: (
    range:
      | "last_7_days"
      | "last_30_days"
      | "last_6_months"
      | "last_year"
      | "all_time",
    apiKey: string,
    baseUrl: string,
  ): Promise<WakaStats | HackaTimeStats> =>
    isHackatime(baseUrl) && range !== "last_7_days"
      ? unsupported(`${range.replace(/_/g, " ")} stats`)
      : isHackatime(baseUrl)
        ? wakFetch("/users/current/stats/last_7_days", apiKey, baseUrl).then(
            (d) => d.data,
          )
        : wakFetch(`/users/current/stats/${range}`, apiKey, baseUrl).then(
            (d) => d.data,
          ),

  getProgramLanguages: (): Promise<WakaProgramLanguage[]> =>
    wakFetchPublic("/program_languages").then((d) => d.data),
};
