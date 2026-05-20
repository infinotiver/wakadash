import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";

interface BreakdownItemProps {
  name: string;
  text: string;
  percent: number;
  color: string;
  index?: number;
}

export function BreakdownItem({
  name,
  text,
  percent,
  color,
  index = 0,
}: BreakdownItemProps) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: percent / 100,
      duration: 600,
      delay: index * 60,
      useNativeDriver: false,
    }).start();
  }, [percent, index]);

  const width = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text
          style={[styles.name, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {name}
        </Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>
          {text}
        </Text>
        <Text style={[styles.percent, { color: colors.mutedForeground }]}>
          {percent.toFixed(1)}%
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.secondary }]}>
        <Animated.View
          style={[styles.fill, { backgroundColor: color, width }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  percent: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    width: 44,
    textAlign: "right",
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
});
