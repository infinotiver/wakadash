import React from "react";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";
import {
  API_KEY_STORAGE_KEY,
  OAUTH_EXPIRES_AT_STORAGE_KEY,
  OAUTH_REFRESH_TOKEN_STORAGE_KEY,
} from "../constants/storage";

WebBrowser.maybeCompleteAuthSession();

export type WakaTimeOAuthTokens = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
};

type TokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

const CLIENT_ID = process.env.EXPO_PUBLIC_WAKATIME_CLIENT_ID ?? "";
const PROXY_URL = (process.env.EXPO_PUBLIC_WAKATIME_OAUTH_PROXY_URL ?? "").replace(/\/+$/, "");
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: "wakadash", path: "oauth" });
const discovery = {
  authorizationEndpoint: "https://wakatime.com/oauth/authorize",
  tokenEndpoint: "https://wakatime.com/oauth/token",
};
let refreshInFlight: Promise<string> | null = null;

async function proxyRequest(path: string, body: Record<string, string>): Promise<TokenResponse> {
  if (!PROXY_URL) throw new Error("OAuth Worker URL is not configured");
  const response = await fetch(`${PROXY_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await response.json().catch(() => ({}))) as TokenResponse;
  if (!response.ok || data.error) {
    throw new Error(data.error_description || data.error || `OAuth request failed (${response.status})`);
  }
  return data;
}

function toTokens(data: TokenResponse): WakaTimeOAuthTokens {
  if (!data.access_token || !data.refresh_token) {
    throw new Error("WakaTime did not return both access and refresh tokens");
  }
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

export async function exchangeWakaTimeCode(code: string): Promise<WakaTimeOAuthTokens> {
  return toTokens(await proxyRequest("/oauth/token", {
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
  }));
}

export async function persistWakaTimeTokens(tokens: WakaTimeOAuthTokens): Promise<void> {
  const writes = [
    SecureStore.setItemAsync(API_KEY_STORAGE_KEY, tokens.accessToken),
    SecureStore.setItemAsync(OAUTH_REFRESH_TOKEN_STORAGE_KEY, tokens.refreshToken),
  ];
  if (tokens.expiresIn) {
    writes.push(SecureStore.setItemAsync(OAUTH_EXPIRES_AT_STORAGE_KEY, String(Date.now() + tokens.expiresIn * 1000)));
  } else {
    writes.push(SecureStore.deleteItemAsync(OAUTH_EXPIRES_AT_STORAGE_KEY));
  }
  await Promise.all(writes);
}

export async function getWakaTimeAccessToken(): Promise<string | null> {
  const [accessToken, refreshToken, expiresAt] = await Promise.all([
    SecureStore.getItemAsync(API_KEY_STORAGE_KEY),
    SecureStore.getItemAsync(OAUTH_REFRESH_TOKEN_STORAGE_KEY),
    SecureStore.getItemAsync(OAUTH_EXPIRES_AT_STORAGE_KEY),
  ]);
  if (!accessToken?.startsWith("waka_tok_") || !refreshToken) return accessToken;
  if (expiresAt && Number(expiresAt) <= Date.now() + 60_000) {
    return refreshWakaTimeAccessToken(refreshToken);
  }
  return accessToken;
}

export async function refreshWakaTimeAccessToken(refreshToken?: string): Promise<string> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    const token = refreshToken ?? await SecureStore.getItemAsync(OAUTH_REFRESH_TOKEN_STORAGE_KEY);
    if (!token) throw new Error("WakaTime sign-in expired; reconnect from Settings");
    const tokens = toTokens(await proxyRequest("/oauth/token", {
      grant_type: "refresh_token",
      refresh_token: token,
      redirect_uri: REDIRECT_URI,
    }));
    await persistWakaTimeTokens(tokens);
    return tokens.accessToken;
  })().finally(() => { refreshInFlight = null; });
  return refreshInFlight;
}

export async function revokeWakaTimeToken(token: string): Promise<void> {
  if (!token || !PROXY_URL) return;
  try {
    await proxyRequest("/oauth/revoke", { token });
  } catch {
    // Disconnect must still clear local credentials when the network is unavailable.
  }
}

export function useWakaTimeOAuth(onTokens: (tokens: WakaTimeOAuthTokens) => void, onError?: (error: Error) => void) {
  const [request, response, promptAsync] = AuthSession.useAuthRequest({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT_URI,
    scopes: ["read_summaries", "read_stats", "read_goals"],
    responseType: AuthSession.ResponseType.Code,
    usePKCE: false,
  }, discovery);

  React.useEffect(() => {
    if (response?.type !== "success") return;
    const code = response.params.code;
    if (!code) {
      onError?.(new Error("WakaTime did not return an authorization code"));
      return;
    }
    void exchangeWakaTimeCode(code).then(onTokens).catch((error: unknown) => {
      onError?.(error instanceof Error ? error : new Error("WakaTime sign-in failed"));
    });
  }, [response]);

  return {
    signIn: () => promptAsync(),
    ready: !!request && !!CLIENT_ID && !!PROXY_URL,
  };
}
