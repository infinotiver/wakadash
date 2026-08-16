import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "wakatime_api_key";

interface WakaTimeContextValue {
  apiKey: string | null;
  isConfigured: boolean;
  authGeneration: number;
  setApiKey: (key: string) => Promise<void>;
  clearApiKey: () => Promise<void>;
}

const WakaTimeContext = createContext<WakaTimeContextValue | null>(null);

export function WakaTimeProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [authGeneration, setAuthGeneration] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function loadConfiguration() {
      try {
        const apiKey = await SecureStore.getItemAsync(STORAGE_KEY);

        setApiKeyState(apiKey);
        setAuthGeneration(1);
      } catch {
        setApiKeyState(null);
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
        apiKey: loaded ? apiKey : null,
        isConfigured: loaded && !!apiKey,
        authGeneration,
        setApiKey,
        clearApiKey,
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
