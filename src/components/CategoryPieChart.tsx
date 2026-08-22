import React, { useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
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
}: Props) {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const labelOpacity = useRef(new Animated.Value(1)).current;

  const foreground = primaryColor ?? colors.onSurface;

  const cardBg = backgroundColor ?? colors.surfaceContainerHigh;

  const chartColors = [
    colors.accent.violet.color,
    colors.accent.amber.color,
    colors.accent.teal.color,
    colors.accent.coral.color,
    colors.accent.green.color,
  ];

  const radius =
    containerWidth > 0 ? Math.floor((containerWidth * 0.8) / 2) : 120;

  const innerRadius = Math.floor(radius * 0.7);

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
  const centerSub = activeItem ? activeItem.name : "total today";

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
          <View style={{ alignItems: "center", marginVertical: ct.md }}>
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
                        fontSize: ct.fontSize["4xl"],
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
                      { color: colors.onSurfaceVariant, marginTop: ct.xs / 2 },
                    ]}
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
