import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import React, { ReactElement } from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";

import { DEFAULT_BASE_URL, wakatimeApi } from "@/src/api/wakatime";
import {
  EMPTY,
  TodayPillWidget,
  TopBreakdownWidget,
  type Slice,
  type StatKey,
  type WidgetData,
} from "./index";

const STORAGE_KEY = "wakatime_api_key";
const BASE_URL_STORAGE_KEY = "wakatime_base_url";
const CACHE_KEY = "wakadash.widget";
const STAT_KEY_PREFIX = "wakadash.widget.stat.";
const DEFAULT_STAT: StatKey = "languages";

// exported so WidgetConfigurationScreen writes to the same key
export const statKeyFor = (widgetId: number) => `${STAT_KEY_PREFIX}${widgetId}`;

export async function getSelectedStat(widgetId: number): Promise<StatKey> {
  try {
    const raw = await AsyncStorage.getItem(statKeyFor(widgetId));
    return (raw as StatKey | null) ?? DEFAULT_STAT;
  } catch {
    return DEFAULT_STAT;
  }
}

const top = (xs: { name: string; percent: number }[] = [], n = 3): Slice[] =>
  xs.slice(0, n).map((x) => ({
    name: String(x?.name ?? "?"),
    percent: Number(x?.percent ?? 0),
  }));

// last successful payload, so a cold render never shows an empty tile
// exported so the config screen can show a live preview
export async function readCache(): Promise<WidgetData> {
  try {
    const raw = await AsyncStorage.getItem(CACHE_KEY);
    return raw ? { ...EMPTY, ...JSON.parse(raw) } : EMPTY;
  } catch {
    return EMPTY;
  }
}

export async function fetchFresh(): Promise<WidgetData | null> {
  try {
    const apiKey = await SecureStore.getItemAsync(STORAGE_KEY);
    if (!apiKey) return null;
    const baseUrl =
      (await SecureStore.getItemAsync(BASE_URL_STORAGE_KEY)) ??
      DEFAULT_BASE_URL;

    const [day, stats] = await Promise.all([
      wakatimeApi.getTodaySummary(apiKey, baseUrl),
      wakatimeApi.getStats("last_7_days", apiKey, baseUrl),
    ]);

    return {
      today: day?.grand_total?.text ?? "—",
      topLanguages: top(stats?.languages),
      topProjects: top(stats?.projects),
      topOS: top(stats?.operating_systems),
    };
  } catch {
    return null;
  }
}

async function renderFor(
  props: WidgetTaskHandlerProps,
  data: WidgetData,
): Promise<ReactElement | null> {
  const { widgetName, widgetId } = props.widgetInfo;

  if (widgetName === "TodayPill") return <TodayPillWidget data={data} />;

  if (widgetName === "TopBreakdown") {
    const stat = await getSelectedStat(widgetId);
    return <TopBreakdownWidget data={data} stat={stat} />;
  }

  return null;
}

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  // keep the old data on screen if the network call fails
  const refresh = async (cached: WidgetData) => {
    const fresh = await fetchFresh();
    if (fresh) await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(fresh));
    const element = await renderFor(props, fresh ?? cached);
    if (element) props.renderWidget(element);
  };

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_RESIZED": {
      const cached = await readCache();
      const element = await renderFor(props, cached);
      if (element) props.renderWidget(element);
      break;
    }

    case "WIDGET_UPDATE":
      await refresh(await readCache());
      break;

    case "WIDGET_CLICK":
      if (props.clickAction === "REFRESH") {
        const cached = await readCache();
        // instant feedback, the fetch takes a moment
        const loading = await renderFor(props, { ...cached, today: "…" });
        if (loading) props.renderWidget(loading);
        await refresh(cached);
      }
      break;

    default:
      break;
  }
}
