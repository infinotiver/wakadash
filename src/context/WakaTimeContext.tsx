import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_BASE_URL } from "../api/wakatime";

const STORAGE_KEY = "wakatime_api_key";
const BASE_URL_STORAGE_KEY = "wakatime_base_url";

interface WakaTimeContextValue {
  apiKey: string | null;
  baseUrl: string;
  isConfigured: boolean;
  authGeneration: number;
  setBaseUrl: (url: string) => Promise<void>;
  setApiKey: (key: string) => Promise<void>;
  clearApiKey: () => Promise<void>;
}

const WakaTimeContext = createContext<WakaTimeContextValue | null>(null);

// context provider for wakatime api key and auth
export function WakaTimeProvider({ children }: { children: React.ReactNode }) {
  // state for apiKey, baseUrl, authGeneration, and loaded
  const [baseUrl, setBaseUrlState] = useState<string>(DEFAULT_BASE_URL);
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [authGeneration, setAuthGeneration] = useState(0);
  const [loaded, setLoaded] = useState(false);

  // read SecureStore once and load the apiKey + baseUrl into state, then set loaded to true

  useEffect(() => {
    async function loadConfiguration() {
      try {
        const [apiKey, storedBaseUrl] = await Promise.all([
          SecureStore.getItemAsync(STORAGE_KEY),
          SecureStore.getItemAsync(BASE_URL_STORAGE_KEY),
        ]);

        setApiKeyState(apiKey);
        setBaseUrlState(storedBaseUrl || DEFAULT_BASE_URL);
        setAuthGeneration(1);
      } catch {
        setApiKeyState(null);
        setBaseUrlState(DEFAULT_BASE_URL);
      } finally {
        setLoaded(true);
      }
    }

    void loadConfiguration();
  }, []);

  const setApiKey = async (key: string) => {
    const trimmed = key.trim();
    await SecureStore.setItemAsync(STORAGE_KEY, trimmed);
    setApiKeyState(trimmed);

    // increment authGeneration counter bust cached queries that depend on the apiKey

    setAuthGeneration((generation) => generation + 1);
  };

  const setBaseUrl = async (url: string) => {
    // strip trailing slashes so path concatenation in wakFetch never double-slashes;
    // falling back to the default if the trimmed result is empty
    const trimmed = url.trim().replace(/\/+$/, "") || DEFAULT_BASE_URL;
    await SecureStore.setItemAsync(BASE_URL_STORAGE_KEY, trimmed);
    setBaseUrlState(trimmed);

    // baseUrl changes the server queries hit, so it busts the cache the same way apiKey does

    setAuthGeneration((generation) => generation + 1);
  };

  const clearApiKey = async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    setApiKeyState(null);
    setAuthGeneration((generation) => generation + 1);
  };

  return (
    <WakaTimeContext.Provider
      value={{
        apiKey: loaded ? apiKey : null, // expose apiKey as null until loaded to avoid flicker
        // this also leads to show a null state while apiKey is being loaded (TODO: rn this shows the SetupScreen)

        baseUrl, // no loading-gate needed here, DEFAULT_BASE_URL is always a safe fallback value
        isConfigured: loaded && !!apiKey, // expose isConfigured as true only if loaded and apiKey is not null
        authGeneration, // expose authGeneration to allow queries to be invalidated when apiKey/baseUrl changes
        setBaseUrl,
        setApiKey,
        clearApiKey,
      }}
    >
      {children}
    </WakaTimeContext.Provider>
  );
}

// hook to access the WakaTimeContext, throws if used outside of provider

export function useWakaTime() {
  const ctx = useContext(WakaTimeContext);
  if (!ctx) throw new Error("useWakaTime must be used inside WakaTimeProvider");
  return ctx;
}
