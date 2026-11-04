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
  /** Fraction of container width the donut's outer diameter takes (default 0.8). */
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

  const chartColors = seriesColors ?? [
    colors.accent.violet.color,
    colors.accent.amber.color,
    colors.accent.teal.color,
    colors.accent.coral.color,
    colors.accent.green.color,
  ];

  const radius =
    containerWidth > 0 ? Math.floor((containerWidth * radiusRatio) / 2) : 120;
  const innerRadius = Math.floor(radius * 0.72);

  // Widest box that fits inside the hole (inscribed square), so text never
  // touches the ring. adjustsFontSizeToFit shrinks overflow within this box.
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
    focused: activeIndex === i,
  }));

  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const totalSeconds = items.reduce((s, item) => s + item.total_seconds, 0);
  const centerLabel = formatDuration(
    activeItem ? activeItem.total_seconds : totalSeconds,
  );
  const centerSub = activeItem ? activeItem.name : totalLabel;

  const toggleIndex = (_item: unknown, index: number) => {
    Animated.sequence([
      Animated.timing(labelOpacity, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(labelOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(
      () => setActiveIndex((prev) => (prev === index ? null : index)),
      100,
    );
  };

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      {containerWidth > 0 && (
        <View style={{ alignItems: "center", marginVertical: ct.space.md }}>
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
