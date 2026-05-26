import React from "react";
import { View } from "react-native";
import type { DimensionValue } from "react-native";

export type StackedBarSegment = {
  value: number;
  color: string;
  key?: string;
};

interface HorizontalStackedBarProps {
  segments: StackedBarSegment[];
  height?: number;
  radius?: number;
  backgroundColor?: string;
  separatorColor?: string;
}

export function HorizontalStackedBar({
  segments,
  height = 12,
  radius = 999,
  backgroundColor = "transparent",
  separatorColor,
}: HorizontalStackedBarProps) {
  const visibleSegments = segments.filter((segment) => (segment.value ?? 0) > 0);
  const totalValue = visibleSegments.reduce(
    (sum, segment) => sum + segment.value,
    0,
  );

  if (!visibleSegments.length || totalValue <= 0) {
    return <View style={{ height, borderRadius: radius, backgroundColor }} />;
  }

  return (
    <View
      style={{
        height,
        width: "100%",
        flexDirection: "row",
        alignItems: "stretch",
        borderRadius: radius,
        overflow: "hidden",
        backgroundColor,
      }}
    >
      {visibleSegments.map((segment, index) => {
        const segmentWidth = `${(segment.value / totalValue) * 100}%` as DimensionValue;
        const showSeparator =
          index < visibleSegments.length - 1 && separatorColor != null;

        return (
          <View
            key={segment.key ?? `${segment.color}-${index}`}
            style={{
              width: segmentWidth,
              height: "100%",
              backgroundColor: segment.color,
              borderRightWidth: showSeparator ? 1 : 0,
              borderRightColor: separatorColor,
            }}
          />
        );
      })}
    </View>
  );
}
