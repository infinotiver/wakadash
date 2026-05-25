import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { wakatimeApi } from "@/src/api/wakatime";
import type { WakaUser } from "@/src/types/wakatime";

const STORAGE_KEY = "wakatime_api_key";
const CUSTOM_URL_KEY = "wakatime_custom_url";

interface WakaTimeContextValue {
  apiKey: string | null;
  customApiUrl: string | null;
  isConfigured: boolean;
  isUsingCustomUrl: boolean;
  setApiKey: (key: string) => Promise<void>;
  clearApiKey: () => Promise<void>;
  setCustomApiUrl: (url: string) => Promise<void>;
  clearCustomApiUrl: () => Promise<void>;
  fetchUser: () => Promise<WakaUser>;
}

const WakaTimeContext = createContext<WakaTimeContextValue | null>(null);

export function WakaTimeProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [customApiUrl, setCustomApiUrlState] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(CUSTOM_URL_KEY),
    ])
      .then(([key, url]) => {
        setApiKeyState(key);
        setCustomApiUrlState(url);
      })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  const setApiKey = async (key: string) => {
    const trimmed = key.trim();
    await AsyncStorage.setItem(STORAGE_KEY, trimmed);
    setApiKeyState(trimmed);
  };

  const clearApiKey = async () => {
    await AsyncStorage.removeItem(STORAGE_KEY);
    setApiKeyState(null);
  };

  const setCustomApiUrl = async (url: string) => {
    const normalized = url.trim().replace(/\/+$/, "");
    await AsyncStorage.setItem(CUSTOM_URL_KEY, normalized);
    setCustomApiUrlState(normalized);
  };

  const clearCustomApiUrl = async () => {
    await AsyncStorage.removeItem(CUSTOM_URL_KEY);
    setCustomApiUrlState(null);
  };

  const fetchUser = async () => {
    if (!apiKey) throw new Error("API key not configured");
    return wakatimeApi.getUser(apiKey, customApiUrl ?? undefined);
  };

  return (
    <WakaTimeContext.Provider
      value={{
        apiKey: loaded ? apiKey : null,
        customApiUrl,
        isConfigured: loaded && !!apiKey,
        isUsingCustomUrl: !!customApiUrl,
        setApiKey,
        clearApiKey,
        setCustomApiUrl,
        clearCustomApiUrl,
        fetchUser,
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
