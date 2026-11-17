import React, { useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";
import { formatDuration } from "@/src/utils/dashboard";

interface CategoryItem {
  name: string;
  percent: number;
  total_seconds: number;
  text: string;
}

interface Props {
  items: CategoryItem[];
  primaryColor?: string;
  backgroundColor?: string;
  seriesColors?: string[];
  totalLabel?: string;
  radiusRatio?: number;
}

const clamp = (v: number, min: number, max: number) =>
  Math.min(max, Math.max(min, v));

export function CategoryPieChart({
  items,
  primaryColor,
  backgroundColor,
  seriesColors,
  totalLabel = "total today",
  radiusRatio = 0.88,
}: Props) {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const labelOpacity = useRef(new Animated.Value(1)).current;

  const foreground = primaryColor ?? colors.onSurface;
  const cardBg = backgroundColor ?? colors.surfaceContainerHigh;

  const chartColors = seriesColors ?? colors.chart.categories;

  const radius =
    containerWidth > 0 ? Math.floor((containerWidth * radiusRatio) / 2) : 120;

  const innerRadius = Math.floor(radius * 0.72);
  const labelWidth = Math.floor(innerRadius * 1.833);
  const valueSize = clamp(Math.round(innerRadius * 0.32), 14, 32);
  const subSize = clamp(
    Math.round(innerRadius * 0.16),
    ct.fontSize.xs,
    ct.fontSize.md,
  );

  const pieData = items.map((item, i) => ({
    value: item.percent,
    color: chartColors[i % chartColors.length] ?? colors.primary,
  }));

  const activeItem = activeIndex !== null ? (items[activeIndex] ?? null) : null;

  const totalSeconds = items.reduce((sum, item) => sum + item.total_seconds, 0);

  const centerLabel = formatDuration(
    activeItem ? activeItem.total_seconds : totalSeconds,
  );

  const centerSub = activeItem?.name ?? totalLabel;

  const toggleIndex = (_item: unknown, index: number) => {
    Animated.timing(labelOpacity, {
      toValue: 0,
      duration: 100,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;

      setActiveIndex((prev) => (prev === index ? null : index));

      Animated.timing(labelOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      {containerWidth > 0 && (
        <View
          style={{
            alignItems: "center",
            marginVertical: ct.space.md,
            gap: ct.space.md,
          }}
        >
          <PieChart
            data={pieData}
            donut
            radius={radius}
            innerRadius={innerRadius}
            innerCircleColor={cardBg}
            focusOnPress={false}
            toggleFocusOnPress={false}
            onPress={toggleIndex}
            centerLabelComponent={() => (
              <Animated.View
                style={{
                  width: labelWidth,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: labelOpacity,
                }}
              >
                <Text
                  style={{
                    width: "100%",
                    color: foreground,
                    fontFamily: ct.fontFamily.semibold,
                    fontSize: valueSize,
                    fontVariant: ["tabular-nums"],
                    lineHeight: Math.round(valueSize * 1.2),
                    textAlign: "center",
                    includeFontPadding: false,
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.6}
                >
                  {centerLabel}
                </Text>

                <Text
                  style={{
                    color: colors.onSurfaceVariant,
                    fontFamily: ct.fontFamily.regular,
                    fontSize: subSize,
                    lineHeight: Math.round(subSize * 1.3),
                    textAlign: "center",
                    includeFontPadding: false,
                  }}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                >
                  {centerSub}
                </Text>
              </Animated.View>
            )}
          />
        </View>
      )}
    </View>
  );
}
