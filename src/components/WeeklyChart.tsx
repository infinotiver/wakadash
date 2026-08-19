import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import type { WakaSummaryDay } from "@/src/types/wakatime";
import { ct } from "@/src/constants/styles.common";

const styles = ct.styles.weeklyChart;

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
          height: ct.size.tooltipHeight,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: ct.sm,
        }}
      >
        {activeIndex !== null && activeDateLabel ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: ct.sm,
              paddingHorizontal: ct.md,
              paddingVertical: ct.xs,
              backgroundColor: colors.primary + "18",
              borderRadius: 999,
            }}
          >
            <Text
              style={{
                fontSize: ct.fontSize.sm,
                fontFamily: ct.fontFamily.medium,
                color: colors.primary,
              }}
            >
              {activeDateLabel}
            </Text>
            <View
              style={{
                width: 3,
                height: 3,
                borderRadius: ct.xs / 2,
                backgroundColor: colors.primary + "88",
              }}
            />
            <Text
              style={{
                fontSize: ct.fontSize.sm,
                fontFamily: ct.fontFamily.semibold,
                color: colors.primary,
              }}
            >
              {formatTime(activeSeconds)}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              fontSize: ct.fontSize.xs,
              color: colors.onSurfaceVariant,
              fontFamily: ct.fontFamily.regular,
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
            paddingRight: ct.xs + 2,
            paddingBottom: ct.size.chartBottom,
          }}
        >
          {yLabels.map((label, i) => (
            <Text
              key={i}
              style={{
                fontSize: ct.fontSize.xs,
                color: colors.onSurfaceVariant,
                fontFamily: ct.fontFamily.regular,
                lineHeight: ct.lineHeight.xs,
              }}ī
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
                  backgroundColor: colors.outline,
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
                            ? colors.accent.teal.color
                            : colors.accent.violet.color + "44",
                          borderRadius: ct.xs,
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
                          : colors.onSurfaceVariant,
                        fontFamily: isActive
                          ? ct.fontFamily.semibold
                          : ct.fontFamily.regular,
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
