import { useEffect } from "react";
import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: "https://wakatime.com/oauth/authorize",
  tokenEndpoint: "https://wakatime.com/oauth/token",
  revocationEndpoint: "https://wakatime.com/oauth/revoke",
};

const CLIENT_ID = process.env.EXPO_PUBLIC_WAKATIME_CLIENT_ID ?? "";

// scopes map to the endpoints: summaries, stats/all_time, and goals
const SCOPES = ["read_summaries", "read_stats", "read_goals"];

export function useWakaTimeOAuth(onToken: (token: string) => void) {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "wakadash",
    path: "oauth",
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: CLIENT_ID,
      redirectUri,
      scopes: SCOPES,
      responseType: AuthSession.ResponseType.Token, // implicit: no secret needed
      usePKCE: false, // WakaTime's docs don't mention PKCE
    },
    discovery,
  );

  useEffect(() => {
    if (response?.type === "success") {
      const token = response.params.access_token;
      if (token) onToken(token);
    }
  }, [response]);

  return { signIn: () => promptAsync(), ready: !!request };
}
