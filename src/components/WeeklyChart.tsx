import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import type { WakaSummaryDay } from "@/src/types/wakatime";
import { weeklyChartStyles as styles } from "@/src/constants/styles.components";
import { FONT_SIZES, SPACING } from "@/src/constants/styles.common";

interface Props {
  days: WakaSummaryDay[];
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function formatTime(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s > 0 ? `${s}s` : ""}`.trim();
  return `${s}s`;
}

function formatDateLabel(date: string): string {
  return new Date(date + "T12:00:00").toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}


export function WeeklyChart({ days }: Props) {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const maxSeconds = useMemo(
    () => Math.max(1, ...days.map((d) => d.grand_total?.total_seconds ?? 0)),
    [days],
  );

  // const yLabels = getYAxisLabels(maxSeconds);

  const activeDay = activeIndex !== null ? days[activeIndex] : null;
  const activeSeconds = activeDay?.grand_total?.total_seconds ?? 0;
  const activeDateLabel = activeDay?.range?.date
    ? formatDateLabel(activeDay.range.date)
    : null;

  return (
    <View>
      {/* Tooltip row */}
      <View
        style={{
          height: 32,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: SPACING.sm,
        }}
      >
        {activeIndex !== null && activeDateLabel ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: SPACING.sm,
              paddingHorizontal: SPACING.md,
              paddingVertical: SPACING.xs,
              backgroundColor: colors.primary + "18",
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                fontSize: FONT_SIZES.sm,
                fontFamily: "Inter_500Medium",
                color: colors.primary,
              }}
            >
              {activeDateLabel}
            </Text>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: 2,
                backgroundColor: colors.primary + "88",
              }}
            />
            <Text
              style={{
                fontSize: FONT_SIZES.sm,
                fontFamily: "Inter_600SemiBold",
                color: colors.primary,
              }}
            >
              {formatTime(activeSeconds)}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              fontSize: FONT_SIZES.xs,
              color: colors.mutedForeground,
              fontFamily: "Inter_400Regular",
            }}
          >
            Tap a bar for details
          </Text>
        )}
      </View>

      {/* Chart: Y-axis + bars */}
      <View style={{ flexDirection: "row" }}>
        {/* Y-axis
        <View
          style={{
            width: 30,
            justifyContent: "space-between",
            alignItems: "flex-end",
            paddingRight: SPACING.xs + 2,
            paddingBottom: 20,
          }}
        >
          {yLabels.map((label, i) => (
            <Text
              key={i}
              style={{
                fontSize: FONT_SIZES.xs,
                color: colors.mutedForeground,
                fontFamily: "Inter_400Regular",
                lineHeight: 12,
              }}
            >
              {label}
            </Text>
          ))}
        </View> */}

        {/* Grid + bars */}
        <View style={{ flex: 1 }}>
          {/* Horizontal grid lines */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 20,
            }}
          >
            {[1, 0.5, 0].map((pos) => (
              <View
                key={pos}
                style={{
                  position: "absolute",
                  top: `${(1 - pos) * 100}%` as any,
                  left: 0,
                  right: 0,
                  height: 0.5,
                  backgroundColor: colors.border,
                }}
              />
            ))}
          </View>

          {/* Bars */}
          <View style={styles.bars}>
            {days.map((day, index) => {
              const seconds = day.grand_total?.total_seconds ?? 0;
              const heightPercent = Math.max(
                2,
                Math.round((seconds / maxSeconds) * 100),
              );
              const isActive = activeIndex === index;
              const dayDate = new Date((day.range?.date ?? "") + "T12:00:00");
              const label = DAY_LABELS[dayDate.getDay()] ?? "—";

              return (
                <Pressable
                  key={day.range?.date ?? index}
                  style={styles.barCol}
                  onHoverIn={() => setActiveIndex(index)}
                  onHoverOut={() => setActiveIndex(null)}
                  onPressIn={() => setActiveIndex(index)}
                  onPressOut={() => setActiveIndex(null)}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}, ${formatTime(seconds)}`}
                >
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          height: `${heightPercent}%`,
                          backgroundColor: isActive
                            ? colors.primary
                            : colors.primary + "44",
                          borderRadius: 4,
                        },
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.dayLabel,
                      {
                        color: isActive
                          ? colors.primary
                          : colors.mutedForeground,
                        fontFamily: isActive
                          ? "Inter_600SemiBold"
                          : "Inter_400Regular",
                      },
                    ]}
                  >
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}
