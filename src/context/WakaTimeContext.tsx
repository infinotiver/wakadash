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

// context provider for wakatime api key and auth 
export function WakaTimeProvider({ children }: { children: React.ReactNode }) {
  // state for apiKey, authGeneration, and loaded

  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [authGeneration, setAuthGeneration] = useState(0);
  const [loaded, setLoaded] = useState(false);
 
  // read SecureStore once and load the apiKey into state, then set loaded to true

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

    // increment authGeneration counter bust cached queries that depend on the apiKey 

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

        isConfigured: loaded && !!apiKey, // expose isConfigured as true only if loaded and apiKey is not null
        authGeneration, // expose authGeneration to allow queries to be invalidated when apiKey changes
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
