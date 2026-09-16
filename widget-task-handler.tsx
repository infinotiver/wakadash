import React from "react";
import type { WidgetTaskHandlerProps } from "react-native-android-widget";
import { TodayPillWidget } from "./src/widgets/TodayPillWidget";
import { getStoredTodayText } from "./src/widgets/syncTodayPill";

const nameToWidget = {
  TodayPill: TodayPillWidget,
};

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const Widget =
    nameToWidget[props.widgetInfo.widgetName as keyof typeof nameToWidget];
  if (!Widget) return;

  switch (props.widgetAction) {
    case "WIDGET_ADDED":
    case "WIDGET_UPDATE":
    case "WIDGET_RESIZED": {
      const todayText = await getStoredTodayText();
      props.renderWidget(<Widget todayText={todayText} />);
      break;
    }
    case "WIDGET_DELETED":
    case "WIDGET_CLICK":
      break;
  }
}
