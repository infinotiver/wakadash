import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import type { WakaSummaryDay } from "@/src/types/wakatime";
import { weeklyChartStyles as styles } from "@/src/constants/styles.components";

interface Props {
  days: WakaSummaryDay[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ChartItem = {
  seconds: number;
  percent: number;
  label: string;
  dateLabel: string;
  frontColor: string;
};

export function WeeklyChart({ days }: Props) {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const formatExactTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m${seconds > 0 ? ` ${seconds}s` : ""}`;
    }

    if (minutes > 0) {
      return `${minutes}m${seconds > 0 ? ` ${seconds}s` : ""}`;
    }

    return `${seconds}s`;
  };

  const formatDayLabel = (date: string) =>
    new Date(date).toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });

  const maxSeconds = useMemo(
    () => Math.max(1, ...days.map((d) => d.grand_total?.total_seconds ?? 0)),
    [days],
  );

  const data: ChartItem[] = useMemo(
    () =>
      days.map((day, index) => {
        const seconds = day.grand_total?.total_seconds ?? 0;
        const percent = seconds / maxSeconds;
        const dayDate = new Date(day.range?.date ?? "");
        const label = DAY_LABELS[dayDate.getDay()] ?? "—";
        const isActive = activeIndex === index;
        const dateLabel = day.range?.date
          ? formatDayLabel(day.range.date)
          : "Unknown date";

        return {
          seconds,
          percent,
          label,
          dateLabel,
          frontColor: isActive ? colors.primary : colors.primary + "55",
        };
      }),
    [activeIndex, colors.primary, days, maxSeconds],
  );

  const activeDay = activeIndex !== null ? days[activeIndex] : undefined;
  const activeSeconds = activeDay?.grand_total?.total_seconds ?? 0;
  const activeDateLabel = activeDay?.range?.date
    ? formatDayLabel(activeDay.range.date)
    : "Hover a bar";
  const activeDayLabel = activeIndex !== null ? data[activeIndex]?.label : "";

  return (
    <View style={styles.container}>
      <View style={styles.bars}>
        {data.map((item, index) => {
          const isActive = activeIndex === index;
          const heightPercent = Math.max(8, Math.round(item.percent * 100));

          return (
            <Pressable
              key={days[index]?.range?.date ?? index}
              style={styles.barCol}
              onHoverIn={() => setActiveIndex(index)}
              onHoverOut={() => setActiveIndex(null)}
              onPressIn={() => setActiveIndex(index)}
              onPressOut={() => setActiveIndex(null)}
              accessibilityRole="button"
              accessibilityLabel={`${item.label}, ${item.dateLabel}, ${formatExactTime(item.seconds)}`}
            >
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.barFill,
                    {
                      height: `${heightPercent}%`,
                      backgroundColor: isActive
                        ? colors.primary
                        : item.frontColor,
                      opacity: isActive ? 1 : 0.85,
                    },
                  ]}
                />
              </View>
              <Text
                style={[
                  styles.dayLabel,
                  {
                    color: isActive ? colors.primary : colors.mutedForeground,
                    fontFamily: isActive
                      ? "Inter_600SemiBold"
                      : "Inter_400Regular",
                  },
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <View
        style={{
          marginTop: 12,
          paddingHorizontal: 12,
          paddingVertical: 10,
          
        }}
      >
        
        <Text
          style={{
            marginTop: 4,
            color: colors.mutedForeground,
            fontSize: 12,
            textAlign: "center",
            fontFamily: "Inter_400Regular",
          }}
        >
          {activeIndex !== null
            ? `${activeDateLabel} • ${formatExactTime(activeSeconds)}`
            : "hover a bar to see date and exact time"}
        </Text>
      </View>
    </View>
  );
}
