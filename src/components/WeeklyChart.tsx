import React, { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import type { WakaSummaryDay } from "@/src/context/WakaTimeContext";
import { styles } from "@/src/constants/weekly-chart.style";
interface Props {
  days: WakaSummaryDay[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeeklyChart({ days }: Props) {
  const colors = useColors();

  const secondsList = days.map((d) => d.grand_total?.total_seconds ?? 0);
  const maxSeconds = Math.max(1, ...secondsList);
  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {days.map((day, i) => {
          const seconds = secondsList[i];
          const ratio = seconds / maxSeconds;
          const dayDate = new Date(day.range?.date ?? "");
          const label = DAY_LABELS[dayDate.getDay()] ?? "—";
          const isToday = day.range?.date === todayStr;

          return (
            <BarItem
              key={day.range?.date ?? i}
              ratio={ratio}
              label={label}
              hours={seconds / 3600}
              isToday={isToday}
              color={colors.primary}
              textColor={colors.mutedForeground}
              activeTextColor={colors.primary}
              index={i}
            />
          );
        })}
      </View>
    </View>
  );
}

function BarItem({
  ratio,
  label,
  hours,
  isToday,
  color,
  textColor,
  activeTextColor,
  index,
}: {
  ratio: number;
  label: string;
  hours: number;
  isToday: boolean;
  color: string;
  textColor: string;
  activeTextColor: string;
  index: number;
}) {
  const anim = useRef(new Animated.Value(0)).current;
  const [active, setActive] = useState(false);

  useEffect(() => {
    Animated.timing(anim, {
      toValue: ratio,
      duration: 700,
      delay: index * 50,
      useNativeDriver: false,
    }).start();
  }, [ratio, index]);

  const height = anim.interpolate({
    inputRange: [0, 1],
    outputRange: ["2%", "100%"],
  });

  const h = Math.floor(hours);
  const m = Math.floor((hours - h) * 60);
  const tooltip =
    hours > 0 ? (h > 0 ? `${h}h${m > 0 ? `${m}m` : ""}` : `${m}m`) : "";

  const showLabel = active && hours > 0;

  return (
    <Pressable
      style={styles.barCol}
      onHoverIn={() => setActive(true)}
      onHoverOut={() => setActive(false)}
      onPressIn={() => setActive(true)}
      onPressOut={() => setActive(false)}
    >
      <Text
        style={[
          styles.tooltip,
          {
            color: isToday ? activeTextColor : textColor,
            opacity: showLabel ? 1 : 0,
          },
        ]}
        numberOfLines={1}
      >
        {tooltip}
      </Text>
      <View style={styles.barTrack}>
        <Animated.View
          style={[
            styles.barFill,
            {
              height,
              backgroundColor: active ? color : isToday ? color : color + "55",
            },
          ]}
        />
      </View>
      <Text
        style={[
          styles.dayLabel,
          {
            color: isToday ? activeTextColor : textColor,
            fontFamily: isToday ? "Inter_600SemiBold" : "Inter_400Regular",
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
