import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Platform } from "react-native";

const STORAGE_KEY = "wakatime_api_key";
const CUSTOM_URL_KEY = "wakatime_custom_url";

function getEnvApiKey(): string | null {
  return process.env.EXPO_PUBLIC_WAKATIME_API_KEY ?? null;
}

export interface WakaUser {
  username: string;
  display_name: string;
  human_readable_website: string;
  location: string;
  photo: string;
  created_at: string;
  last_plugin_name: string;
}

export interface WakaDuration {
  text: string;
  decimal: string;
  digital: string;
  hours: number;
  minutes: number;
  total_seconds: number;
}

export interface WakaEntry {
  name: string;
  text: string;
  total_seconds: number;
  percent: number;
  digital: string;
  decimal: string;
}

export interface WakaSummaryDay {
  range: { date: string; text: string };
  grand_total: WakaDuration;
  languages: WakaEntry[];
  editors: WakaEntry[];
  projects: WakaEntry[];
  operating_systems: WakaEntry[];
  machines: WakaEntry[];
}

export interface WakaStats {
  total_seconds: number;
  human_readable_total: string;
  daily_average: { text: string; total_seconds: number };
  languages: WakaEntry[];
  editors: WakaEntry[];
  operating_systems: WakaEntry[];
  projects: WakaEntry[];
  best_day: { date: string; text: string; total_seconds: number } | null;
  range: string;
}

interface WakaTimeContextValue {
  apiKey: string | null;
  setApiKey: (key: string) => Promise<void>;
  clearApiKey: () => Promise<void>;
  customApiUrl: string | null;
  setCustomApiUrl: (url: string) => Promise<void>;
  clearCustomApiUrl: () => Promise<void>;
  isConfigured: boolean;
  fetchUser: () => Promise<WakaUser>;
  fetchTodaySummary: () => Promise<WakaSummaryDay | null>;
  fetchWeekSummaries: () => Promise<WakaSummaryDay[]>;
  fetchStats: (range: "last_7_days" | "last_30_days") => Promise<WakaStats>;
}

const WakaTimeContext = createContext<WakaTimeContextValue | null>(null);

export function WakaTimeProvider({ children }: { children: React.ReactNode }) {
  const envKey = getEnvApiKey();
  const [apiKey, setApiKeyState] = useState<string | null>(envKey);
  const [loaded, setLoaded] = useState(!!envKey);
  const [customApiUrl, setCustomApiUrlState] = useState<string | null>(null);

  useEffect(() => {
    async function loadKey() {
      try {
        const [stored, storedUrl] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(CUSTOM_URL_KEY),
        ]);
        setApiKeyState(stored ?? envKey);
        setCustomApiUrlState(storedUrl);
      } catch {
      } finally {
        setLoaded(true);
      }
    }
    loadKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setApiKey = useCallback(async (key: string) => {
    await AsyncStorage.setItem(STORAGE_KEY, key);
    setApiKeyState(key);
  }, []);

  const clearApiKey = useCallback(async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    const envKey = getEnvApiKey();
    setApiKeyState(envKey);
  }, []);

  const setCustomApiUrl = useCallback(async (url: string) => {
    const normalized = url.replace(/\/+$/, "");
    await AsyncStorage.setItem(CUSTOM_URL_KEY, normalized);
    setCustomApiUrlState(normalized);
  }, []);

  const clearCustomApiUrl = useCallback(async () => {
    await AsyncStorage.removeItem(CUSTOM_URL_KEY);
    setCustomApiUrlState(null);
  }, []);

  const getAuthHeader = useCallback((key: string) => {
    const encoded =
      typeof btoa !== "undefined"
        ? btoa(key + ":")
        : Buffer.from(key).toString("base64");
    return `Basic ${encoded}`;
  }, []);

  const wakaFetch = useCallback(
    async (path: string) => {
      const key = apiKey;

      if (Platform.OS !== "web" && !key) {
        throw new Error("No API key configured");
      }

      let baseUrl: string;
      if (Platform.OS === "web") {
        const host =
          typeof window !== "undefined"
            ? window.location.host.replace(/^expo\./, "")
            : (process.env.EXPO_PUBLIC_DOMAIN ?? "");
        const proto =
          typeof window !== "undefined" ? window.location.protocol : "https:";
        baseUrl = `${proto}//${host}/api/wakatime`;
      } else {
        baseUrl = customApiUrl ?? "https://api.wakatime.com/api/v1";
      }

      const headers: Record<string, string> = {};
      if (key) headers["Authorization"] = getAuthHeader(key);

      const res = await fetch(`${baseUrl}${path}`, { headers });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid API key");
        throw new Error(`WakaTime API error: ${res.status}`);
      }
      return res.json();
    },
    [apiKey, customApiUrl, getAuthHeader],
  );

  const fetchUser = useCallback(async (): Promise<WakaUser> => {
    const data = await wakaFetch("/users/current");
    return data.data;
  }, [wakaFetch]);

  const fetchTodaySummary =
    useCallback(async (): Promise<WakaSummaryDay | null> => {
      const today = new Date().toISOString().split("T")[0];
      const data = await wakaFetch(
        `/users/current/summaries?start=${today}&end=${today}`,
      );
      return data.data?.[0] ?? null;
    }, [wakaFetch]);

  const fetchWeekSummaries = useCallback(async (): Promise<
    WakaSummaryDay[]
  > => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);
    const fmt = (d: Date) => d.toISOString().split("T")[0];
    const data = await wakaFetch(
      `/users/current/summaries?start=${fmt(start)}&end=${fmt(end)}`,
    );
    return data.data ?? [];
  }, [wakaFetch]);

  const fetchStats = useCallback(
    async (range: "last_7_days" | "last_30_days"): Promise<WakaStats> => {
      const data = await wakaFetch(`/users/current/stats/${range}`);
      return data.data;
    },
    [wakaFetch],
  );

  return (
    <WakaTimeContext.Provider
      value={{
        apiKey: loaded ? apiKey : null,
        setApiKey,
        clearApiKey,
        customApiUrl,
        setCustomApiUrl,
        clearCustomApiUrl,
        isConfigured: Platform.OS === "web" ? true : loaded && !!apiKey,
        fetchUser,
        fetchTodaySummary,
        fetchWeekSummaries,
        fetchStats,
      }}
    >
      {children}
    </WakaTimeContext.Provider>
  );
}

export function useWakaTime() {
  const ctx = useContext(WakaTimeContext);
  if (!ctx) throw new Error("useWakaTime must be used inside WakaTimeProvider");
  return ctx;
}
