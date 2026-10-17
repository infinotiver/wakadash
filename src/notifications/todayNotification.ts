import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundTask from "expo-background-task";
import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";
import { Platform } from "react-native";

import { DEFAULT_BASE_URL, wakatimeApi } from "@/src/api/wakatime";
import type { StatsEntry, WakaSummaryDay } from "@/src/types/wakatime";
import { formatDuration } from "@/src/utils/dashboard";

const CONFIG_KEY = "notif:todayConfig";
const TASK = "today-notification-sync";
const ACTION_TASK = "today-notification-action";
const CHANNEL = "today-stats";
const CATEGORY = "today-stats";
const SYNC_ACTION = "sync";
const NOTIFICATION_ID = "today-stats";

// same SecureStore keys as WakaTimeContext (the headless task can't use the context)
const API_KEY = "wakatime_api_key";
const BASE_URL_KEY = "wakatime_base_url";

export type BreakdownKey =
  | "categories"
  | "languages"
  | "editors"
  | "projects"
  | "operating_systems";

export interface TodayNotificationConfig {
  enabled: boolean;
  show: BreakdownKey[];
}

const DEFAULT_CONFIG: TodayNotificationConfig = {
  enabled: false,
  show: ["languages"],
};

const LABELS: Record<BreakdownKey, string> = {
  categories: "Category",
  languages: "Language",
  editors: "Editor",
  projects: "Project",
  operating_systems: "OS",
};

// without this, local notifications are swallowed while the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: false,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

// periodic background refresh
TaskManager.defineTask(TASK, async () => {
  try {
    await refreshTodayNotification();
    return BackgroundTask.BackgroundTaskResult.Success;
  } catch {
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

// runs when the "Sync" action on the notification is tapped, even if the app isn't open
TaskManager.defineTask<Notifications.NotificationTaskPayload>(
  ACTION_TASK,
  async ({ data, error }) => {
    if (error || !data || !("actionIdentifier" in data)) return;
    if (data.actionIdentifier === SYNC_ACTION) {
      await refreshTodayNotification().catch(() => {});
    }
  },
);
Notifications.registerTaskAsync(ACTION_TASK);

export async function getConfig(): Promise<TodayNotificationConfig> {
  const raw = await AsyncStorage.getItem(CONFIG_KEY);
  return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
}

// persists the config and applies it; returns what actually got stored
// (enabled flips back to false if the notification permission is denied)
export async function saveConfig(
  config: TodayNotificationConfig,
): Promise<TodayNotificationConfig> {
  let final = config;

  if (Platform.OS === "android") {
    if (!config.enabled) {
      await Notifications.dismissNotificationAsync(NOTIFICATION_ID);
      if (await TaskManager.isTaskRegisteredAsync(TASK)) {
        await BackgroundTask.unregisterTaskAsync(TASK);
      }
    } else {
      const perm = await Notifications.requestPermissionsAsync();
      if (!perm.granted) {
        final = { ...config, enabled: false };
      } else {
        await Notifications.setNotificationChannelAsync(CHANNEL, {
          name: "Today's stats",
          importance: Notifications.AndroidImportance.LOW,
          showBadge: false,
          enableVibrate: false,
        });
        if (!(await TaskManager.isTaskRegisteredAsync(TASK))) {
          await BackgroundTask.registerTaskAsync(TASK, { minimumInterval: 15 });
        }
      }
    }
  }

  await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(final));
  if (final.enabled) await refreshTodayNotification();
  return final;
}

function top(entries?: StatsEntry[]) {
  return entries?.reduce<StatsEntry | null>(
    (best, e) => (!best || e.total_seconds > best.total_seconds ? e : best),
    null,
  );
}

export async function postTodayNotification(today: WakaSummaryDay | null) {
  if (Platform.OS !== "android") return;
  const config = await getConfig();
  if (!config.enabled) return;

  const total =
    today?.grand_total?.text ??
    formatDuration(today?.grand_total?.total_seconds ?? 0);

  const lines = config.show.flatMap((key) => {
    const item = top(today?.[key]);
    return item
      ? [
          `${LABELS[key]}: ${item.name} · ${item.text ?? formatDuration(item.total_seconds)}`,
        ]
      : [];
  });

  // action buttons hang off a category; set on every post so it survives restarts
  await Notifications.setNotificationCategoryAsync(CATEGORY, [
    {
      identifier: SYNC_ACTION,
      buttonTitle: "Sync",
      options: { opensAppToForeground: false },
    },
  ]);

  await Notifications.scheduleNotificationAsync({
    identifier: NOTIFICATION_ID, // same id = update in place
    content: {
      title: `Today · ${total}`,
      body: lines.join("\n") || undefined,
      subtitle: `Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
      categoryIdentifier: CATEGORY,
      sticky: true,
      autoDismiss: false,
      color: "#006874",
      priority: Notifications.AndroidNotificationPriority.LOW,
    },
    trigger: { channelId: CHANNEL },
  });
}

// fetch + post; used by the background task and the Sync action
export async function refreshTodayNotification() {
  const config = await getConfig();
  if (!config.enabled) return;

  const [apiKey, baseUrl] = await Promise.all([
    SecureStore.getItemAsync(API_KEY),
    SecureStore.getItemAsync(BASE_URL_KEY),
  ]);
  if (!apiKey) return;

  const today = await wakatimeApi.getTodaySummary(
    apiKey,
    baseUrl || DEFAULT_BASE_URL,
  );
  await postTodayNotification(today);
}
