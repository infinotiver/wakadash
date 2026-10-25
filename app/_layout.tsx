import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { useWakaTime, WakaTimeProvider } from "@/src/context/WakaTimeContext";
import { useSyncTodayNotification } from "@/src/hooks/useWakaTimeQueries";
import * as Notifications from "expo-notifications";
import {
  refreshTodayNotification,
  SYNC_ACTION,
} from "@/src/notifications/todayNotification";

import { useQueryClient } from "@tanstack/react-query";
import { wakaKeys } from "@/src/hooks/useWakaTimeQueries";
import { SetupScreen } from "@/src/components/SetupScreen";
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { isConfigured } = useWakaTime();
  useSyncTodayNotification();
  const queryClient = useQueryClient();

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener(
      async (response) => {
        if (response.actionIdentifier !== SYNC_ACTION) return;
        await refreshTodayNotification().catch(() => {});
        // also refresh what's on screen
        queryClient.invalidateQueries({ queryKey: wakaKeys.all });
      },
    );
    return () => sub.remove();
  }, [queryClient]);
  if (!isConfigured) return <SetupScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <WakaTimeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </WakaTimeProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}
