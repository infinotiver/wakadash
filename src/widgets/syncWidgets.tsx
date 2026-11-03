import AsyncStorage from "@react-native-async-storage/async-storage";
import { requestWidgetUpdate } from "react-native-android-widget";

import {
  EMPTY,
  TodayPillWidget,
  TopBreakdownWidget,
  type WidgetData,
} from "./index";
import { WIDGET_CACHE_KEY } from "@/src/constants/storage";

// single source of truth for both the app-side sync and the handler's cold-start read
export async function syncWidgets(data: WidgetData) {
  await AsyncStorage.setItem(WIDGET_CACHE_KEY, JSON.stringify(data));

  await requestWidgetUpdate({
    widgetName: "TodayPill",
    renderWidget: () => <TodayPillWidget data={data} />,
    widgetNotFound: () => {},
  });

  await requestWidgetUpdate({
    widgetName: "TopBreakdown",
    renderWidget: () => <TopBreakdownWidget data={data} />,
    widgetNotFound: () => {},
  });
}

export async function clearWidgetData() {
  await AsyncStorage.removeItem(WIDGET_CACHE_KEY);

  await requestWidgetUpdate({
    widgetName: "TodayPill",
    renderWidget: () => <TodayPillWidget data={EMPTY} />,
    widgetNotFound: () => {},
  });

  await requestWidgetUpdate({
    widgetName: "TopBreakdown",
    renderWidget: () => <TopBreakdownWidget data={EMPTY} stat="languages" />,
    widgetNotFound: () => {},
  });
}

export async function getCachedWidgetData(): Promise<WidgetData> {
  try {
    const raw = await AsyncStorage.getItem(WIDGET_CACHE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}
