import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestWidgetUpdate } from "react-native-android-widget";
import { TodayPillWidget } from "./TodayPillWidget";

const STORAGE_KEY = "widget:todayTotalText";

export async function syncTodayPill(todayText: string) {
  await AsyncStorage.setItem(STORAGE_KEY, todayText);

  await requestWidgetUpdate({
    widgetName: "TodayPill",
    renderWidget: () => <TodayPillWidget todayText={todayText} />,
    widgetNotFound: () => {
      // no instance placed on the home screen yet, nothing to do
    },
  });
}

export async function getStoredTodayText(): Promise<string> {
  const stored = await AsyncStorage.getItem(STORAGE_KEY);
  return stored ?? "—";
}