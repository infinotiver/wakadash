import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { useColors } from "@/src/hooks/useColors";
import type { WakaSummaryDay } from "@/src/types/wakatime";
import { ct } from "@/src/constants/styles.common";
import { formatDuration } from "@/src/utils/dashboard";

interface Props {
  days: WakaSummaryDay[];
}

const CELL = 20;
const GAP = 4;
const CELL_RADIUS = 5;
const LEGEND_CELL = 14;
const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

// Intensity thresholds as a fraction of the busiest day in the range.
// Used by both the grid and the legend so they can't disagree.
const HIGH = 0.7;
const MID = 0.35;

function dateLabel(date?: string): string {
  if (!date) return "Unknown date";
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// 0 = no activity, 1 = low, 2 = medium, 3 = high
function levelFor(seconds: number, maxSeconds: number): 0 | 1 | 2 | 3 {
  if (seconds <= 0) return 0;
  const intensity = seconds / maxSeconds;
  if (intensity > HIGH) return 3;
  if (intensity > MID) return 2;
  return 1;
}

type Slot = { day: WakaSummaryDay; index: number } | null;

export function SummaryHeatmap({ days }: Props) {
  const colors = useColors();
  const scrollRef = useRef<ScrollView>(null);
  const [selectedIndex, setSelectedIndex] = useState(
    Math.max(0, days.length - 1),
  );

  const levelColors = [
    colors.surfaceContainerHighest,
    colors.secondaryContainer,
    colors.primaryContainer,
    colors.primary,
  ];

  const maxSeconds = useMemo(
    () =>
      Math.max(1, ...days.map((day) => day.grand_total?.total_seconds ?? 0)),
    [days],
  );

  const selectedDay = days[selectedIndex];
  const selectedSeconds = selectedDay?.grand_total?.total_seconds ?? 0;

  // Every week is exactly 7 slots (Sun–Sat): leading and trailing gaps are
  // padded with nulls so all columns have identical height.
  const weeks = useMemo(() => {
    if (!days.length) return [] as Slot[][];

    const firstDate = days[0]?.range?.date;
    const leading = firstDate ? new Date(`${firstDate}T12:00:00`).getDay() : 0;

    const slots: Slot[] = [
      ...Array.from({ length: leading }, () => null),
      ...days.map((day, index) => ({ day, index })),
    ];
    while (slots.length % 7 !== 0) slots.push(null);

    return Array.from({ length: slots.length / 7 }, (_, w) =>
      slots.slice(w * 7, w * 7 + 7),
    );
  }, [days]);

  useEffect(() => {
    setSelectedIndex(Math.max(0, days.length - 1));
  }, [days]);

  const legendCaption = `Relative to your busiest day (${formatDuration(maxSeconds)})`;

  const monthLabels = weeks.map((week) => {
    const firstDay = week.find((slot) => slot)?.day;
    if (!firstDay?.range?.date) return "";
    return new Date(`${firstDay.range.date}T12:00:00`).toLocaleDateString(
      undefined,
      { month: "short" },
    );
  });

  return (
    <View style={{ gap: ct.space.md }}>
      <View style={{ alignItems: "center", gap: ct.space.xs }}>
        <Text
          style={{
            color: colors.onSurface,
            fontFamily: ct.fontFamily.bold,
            fontSize: ct.fontSize["2xl"],
          }}
        >
          {formatDuration(selectedSeconds)}
        </Text>
        <Text
          style={{
            color: colors.onSurfaceVariant,
            fontFamily: ct.fontFamily.medium,
            fontSize: ct.fontSize.sm,
          }}
        >
          {dateLabel(selectedDay?.range?.date)}
        </Text>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: false })
        }
        // grows to full width when content is narrow, so short ranges center
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          gap: GAP,
        }}
      >
        <View style={{ flexDirection: "row", gap: GAP }}>
          <View style={{ width: CELL, gap: GAP }}>
            <View style={{ height: 20 }} />
            {WEEKDAY_LABELS.map((label, index) => (
              <View
                key={`${label}-${index}`}
                style={{ width: CELL, height: CELL, justifyContent: "center" }}
              >
                {index === 1 || index === 3 || index === 5 ? (
                  <Text
                    style={{
                      color: colors.onSurfaceVariant,
                      fontSize: ct.fontSize.xs,
                      fontFamily: ct.fontFamily.semibold,
                      textAlign: "center",
                    }}
                  >
                    {label}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} style={{ gap: GAP }}>
              <View style={{ height: 20, justifyContent: "center" }}>
                {weekIndex === 0 ||
                monthLabels[weekIndex] !== monthLabels[weekIndex - 1] ? (
                  <Text
                    style={{
                      color: colors.onSurface,
                      fontSize: ct.fontSize.xs,
                      fontFamily: ct.fontFamily.semibold,
                    }}
                  >
                    {monthLabels[weekIndex]}
                  </Text>
                ) : null}
              </View>
              {week.map((slot, dayIndex) => {
                if (!slot) {
                  return (
                    <View
                      key={`empty-${weekIndex}-${dayIndex}`}
                      style={{ width: CELL, height: CELL }}
                    />
                  );
                }

                const { day, index } = slot;
                const seconds = day.grand_total?.total_seconds ?? 0;
                const selected = index === selectedIndex;
                const backgroundColor =
                  levelColors[levelFor(seconds, maxSeconds)];

                return (
                  <Pressable
                    key={day.range?.date ?? index}
                    onPress={() => setSelectedIndex(index)}
                    accessibilityRole="button"
                    accessibilityLabel={`${dateLabel(day.range?.date)}, ${formatDuration(seconds)}`}
                    accessibilityState={{ selected }}
                    style={{
                      width: CELL,
                      height: CELL,
                      borderRadius: CELL_RADIUS,
                      backgroundColor,
                      borderWidth: selected ? 2 : 0,
                      borderColor: colors.onSurface,
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Key */}
      <View style={{ alignItems: "center", gap: ct.space.xs }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: ct.space.sm,
          }}
        >
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: ct.fontFamily.medium,
              fontSize: ct.fontSize.sm,
            }}
          >
            Less
          </Text>
          <View style={{ flexDirection: "row", gap: GAP }}>
            {levelColors.map((color, i) => (
              <View
                key={i}
                style={{
                  width: LEGEND_CELL,
                  height: LEGEND_CELL,
                  borderRadius: CELL_RADIUS - 1,
                  backgroundColor: color,
                }}
              />
            ))}
          </View>
          <Text
            style={{
              color: colors.onSurfaceVariant,
              fontFamily: ct.fontFamily.medium,
              fontSize: ct.fontSize.sm,
            }}
          >
            More
          </Text>
        </View>
        <Text
          style={{
            color: colors.onSurfaceVariant,
            fontFamily: ct.fontFamily.regular,
            fontSize: ct.fontSize.xs,
          }}
        >
          {legendCaption}
        </Text>
      </View>
    </View>
  );
}
