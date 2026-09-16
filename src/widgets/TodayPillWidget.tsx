import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

interface TodayPillWidgetProps {
  todayText: string;
}

export function TodayPillWidget({ todayText }: TodayPillWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#252b2c",
        borderRadius: 28,
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text={todayText}
        style={{
          fontSize: 20,
          fontFamily: "Inter_700Bold",
          color: "#dee3e5",
        }}
      />
      <TextWidget
        text="Today's time"
        style={{
          fontSize: 11,
          fontFamily: "Inter_600SemiBold",
          color: "#bfc8ca",
        }}
      />
    </FlexWidget>
  );
}
