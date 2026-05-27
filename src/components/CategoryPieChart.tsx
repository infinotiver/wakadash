import React, { useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { PieChart } from "react-native-gifted-charts";
import { useColors } from "@/src/hooks/useColors";
import { FONT_SIZES, SPACING, t } from "@/src/constants/styles.common";

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

function LegendRow({
  item,
  isActive,
  dotColor,
  onPress,
  colors,
}: {
  item: CategoryItem;
  isActive: boolean;
  dotColor: string;
  onPress: () => void;
  colors: ReturnType<typeof useColors>;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const bg = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 0.97,
        useNativeDriver: true,
        speed: 40,
        bounciness: 0,
      }),
      Animated.timing(bg, {
        toValue: 1,
        duration: 120,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 20,
        bounciness: 4,
      }),
      Animated.timing(bg, {
        toValue: isActive ? 1 : 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const backgroundColor = bg.interpolate({
    inputRange: [0, 1],
    outputRange: ["transparent", colors.primary + "14"],
  });

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <Animated.View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: SPACING.sm,
          paddingVertical: SPACING.sm,
          paddingHorizontal: SPACING.sm,
          borderRadius: 10,
          transform: [{ scale }],
          backgroundColor,
        }}
      >
        <View
          style={{
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: dotColor,
          }}
        />
        <Text
          style={[
            t.body,
            {
              flex: 1,
              color: isActive ? colors.foreground : colors.foreground + "BB",
              fontFamily: isActive ? "Inter_500Medium" : "Inter_400Regular",
            },
          ]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={[
            t.caption,
            { color: colors.mutedForeground, marginRight: SPACING.xs },
          ]}
        >
          {item.text}
        </Text>
        <Text
          style={[
            t.caption,
            {
              color: isActive ? colors.primary : colors.mutedForeground,
              fontFamily: "Inter_500Medium",
              width: 36,
              textAlign: "right",
            },
          ]}
        >
          {item.percent.toFixed(1)}%
        </Text>
      </Animated.View>
    </Pressable>
  );
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

  const foreground = primaryColor ?? colors.foreground;
  const cardBg = backgroundColor ?? colors.card;

  const chartColors = primaryColor
    ? [
        foreground,
        foreground + "DD",
        foreground + "BB",
        foreground + "77",
        foreground + "44",
      ]
    : colors.chartColors;

  // Derive radius from measured container width
  // Use a single behavior (no compact view): diameter is 90% of width
  const radius =
    containerWidth > 0 ? Math.floor((containerWidth * 0.9) / 2) : 120;

  const innerRadius = Math.floor(radius * 0.62);

  const pieData = items.map((item, i) => ({
    value: item.percent,
    color: chartColors[i % chartColors.length] ?? colors.primary,
    focused: activeIndex === i,
  }));

  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const totalSeconds = items.reduce((s, item) => s + item.total_seconds, 0);
  const centerLabel = activeItem ? activeItem.name : formatTime(totalSeconds);
  const centerSub = activeItem
    ? `${activeItem.percent.toFixed(1)}%`
    : "total today";

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

  const handlePiePress = (_item: any, index: number) => {
    animateLabel(() => {
      setActiveIndex((prev) => (prev === index ? null : index));
    });
  };


  return (
    <View
      onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
      style={{ gap: SPACING.md }}
    >
      {/* Only render chart once we have a measured width */}
      {containerWidth > 0 && (
        <>
          <View style={{ alignItems: "center", marginVertical: SPACING.md }}>
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
                    paddingHorizontal: 10,
                    opacity: labelOpacity,
                    width: innerRadius * 2 - 8,
                  }}
                >
                  <Text
                    style={[
                      t.body,
                      {
                        color: foreground,
                        fontFamily: "Inter_600SemiBold",
                        textAlign: "center",
                        fontSize: FONT_SIZES["4xl"],
                      },
                    ]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                  >
                    {centerLabel}
                  </Text>
                  <Text
                    style={[
                      t.body,
                      { color: colors.mutedForeground, marginTop: 2 },
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
