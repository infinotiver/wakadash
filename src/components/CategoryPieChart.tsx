import React, { useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

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
  /**
   * Fraction of the container width the donut's outer diameter should take
   * up. Default (0.8) matches the dashboard's hero usage; pass something
   * smaller (e.g. 0.55) for a compact variant sitting alongside other charts.
   */
  radiusRatio?: number;
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export function CategoryPieChart({
  items,
  primaryColor,
  backgroundColor,
  seriesColors,
  totalLabel = "total today",
  radiusRatio = 0.8,
}: Props) {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const labelOpacity = useRef(new Animated.Value(1)).current;

  const foreground = primaryColor ?? colors.onSurface;

  const cardBg = backgroundColor ?? colors.surfaceContainerHigh;

  const defaultChartColors = [
    colors.accent.violet.color,
    colors.accent.amber.color,
    colors.accent.teal.color,
    colors.accent.coral.color,
    colors.accent.green.color,
  ];
  const chartColors = seriesColors ?? defaultChartColors;

  const radius =
    containerWidth > 0 ? Math.floor((containerWidth * radiusRatio) / 2) : 120;

  const innerRadius = Math.floor(radius * 0.7);

  // A shrunk donut needs a smaller center label or the text overruns it.
  const centerValueSize = radius < 90 ? ct.fontSize["2xl"] : ct.fontSize["3xl"];
  const centerSubSize = radius < 90 ? ct.fontSize.xs : ct.fontSize.md;

  const pieData = items.map((item, i) => ({
    value: item.percent,
    color: chartColors[i % chartColors.length] ?? colors.primary,
    focused: activeIndex === i,
  }));

  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const totalSeconds = items.reduce((s, item) => s + item.total_seconds, 0);
  const centerLabel = activeItem
    ? `${formatTime(activeItem.total_seconds)}`
    : formatTime(totalSeconds);
  const centerSub = activeItem ? activeItem.name : totalLabel;

  const animateLabel = (next: () => void) => {
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
    setTimeout(next, 100);
  };

  const toggleIndex = (index: number) => {
    animateLabel(() => {
      setActiveIndex((prev) => (prev === index ? null : index));
    });
  };

  const handlePiePress = (_item: any, index: number) => {
    toggleIndex(index);
  };

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      {containerWidth > 0 && (
        <>
          <View style={{ alignItems: "center", marginVertical: ct.space.md }}>
            <PieChart
              data={pieData}
              donut
              radius={radius}
              innerRadius={innerRadius}
              innerCircleColor={cardBg}
              focusOnPress={false}
              toggleFocusOnPress={false}
              onPress={handlePiePress}
              centerLabelComponent={() => (
                <Animated.View
                  style={{
                    alignItems: "center",
                    opacity: labelOpacity,
                    width: innerRadius * 2,
                  }}
                >
                  <Text
                    style={[
                      ct.text.body,
                      {
                        color: foreground,
                        fontFamily: ct.fontFamily.semibold,
                        textAlign: "center",
                        fontSize: centerValueSize,
                      },
                    ]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    {centerLabel}
                  </Text>
                  <Text
                    style={[
                      ct.text.body,
                      {
                        color: colors.onSurfaceVariant,
                        marginTop: ct.space.md / 2,
                        fontSize: centerSubSize,
                      },
                    ]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {centerSub}
                  </Text>
                </Animated.View>
              )}
            />
          </View>
        </>
      )}
    </View>
  );
}
