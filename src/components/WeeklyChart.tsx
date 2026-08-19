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
  if (m > 0) return `${m}m${s > 0 ? ` ${s}s` : ""}`;
  return `${s}s`;
}

function formatDateLabel(date: string): string {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function WeeklyChart({ days }: Props) {
  const colors = useColors();

  // Persistent selection.
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const maxSeconds = useMemo(
    () =>
      Math.max(1, ...days.map((day) => day.grand_total?.total_seconds ?? 0)),
    [days],
  );

  const activeDay = activeIndex !== null ? days[activeIndex] : null;
  const activeSeconds = activeDay?.grand_total?.total_seconds ?? 0;

  const activeDateLabel = activeDay?.range?.date
    ? formatDateLabel(activeDay.range.date)
    : null;

  return (
    <View>
      {/* Selected-day details */}
      <View
        style={{
          minHeight: ct.size.tooltipHeight,
          marginBottom: ct.sm,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {activeIndex !== null && activeDateLabel ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: ct.fontSize.sm,
                lineHeight: ct.lineHeight.sm,
                fontFamily: ct.fontFamily.medium,
                color: colors.onSurfaceVariant,
              }}
            >
              {activeDateLabel}
            </Text>

            <View
              style={{
                width: 4,
                height: 4,
                marginHorizontal: ct.sm,
                borderRadius: 2,
                backgroundColor: colors.outline,
              }}
            />

            <Text
              style={{
                fontSize: ct.fontSize.sm,
                lineHeight: ct.lineHeight.sm,
                fontFamily: ct.fontFamily.semibold,
                color: colors.onSurface,
              }}
            >
              {formatTime(activeSeconds)}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              fontSize: ct.fontSize.xs,
              lineHeight: ct.lineHeight.xs,
              fontFamily: ct.fontFamily.regular,
              color: colors.onSurfaceVariant,
            }}
          >
            Tap a bar for details
          </Text>
        )}
      </View>

      {/* Chart */}
      <View style={{ flexDirection: "row" }}>
        <View style={{ flex: 1 }}>
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: ct.size.chartBottom,
            }}
          >
            {[0, 0.5, 1].map((position) => (
              <View
                key={position}
                style={{
                  position: "absolute",
                  top: `${position * 100}%`,
                  left: 0,
                  right: 0,
                  height: 1,
                  backgroundColor: colors.outlineVariant,
                  opacity: position === 1 ? 0.8 : 0.5,
                }}
              />
            ))}
          </View>

          <View style={styles.bars}>
            {days.map((day, index) => {
              const seconds = day.grand_total?.total_seconds ?? 0;

              const heightPercent =
                seconds === 0 ? 0 : Math.max(4, (seconds / maxSeconds) * 100);

              const isActive = activeIndex === index;

              const date = day.range?.date
                ? new Date(`${day.range.date}T12:00:00`)
                : null;

              const label = date ? DAY_LABELS[date.getDay()] : "—";

              return (
                <Pressable
                  key={day.range?.date ?? index}
                  style={styles.barCol}
                  onHoverIn={() => setActiveIndex(index)}
                  onHoverOut={() => {}}
                  onPress={() => setActiveIndex(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}, ${formatTime(seconds)}`}
                  accessibilityState={{
                    selected: isActive,
                  }}
                >
                  {/* Bar */}
                  <View
                    style={{
                      flex: 1,
                      width: "100%",
                      justifyContent: "flex-end",
                      alignItems: "center",
                    }}
                  >
                    {seconds > 0 && (
                      <View
                        style={{
                          width: "100%",
                          height: `${heightPercent}%`,
                          minHeight: 8,

                          backgroundColor: isActive
                            ? colors.tertiary
                            : colors.tertiaryContainer,

                          // Pill shape.
                          borderRadius: 999,
                        }}
                      />
                    )}
                  </View>

                  {/* Day label */}
                  <Text
                    style={[
                      styles.dayLabel,
                      {
                        color: isActive
                          ? colors.tertiary
                          : colors.onSurfaceVariant,

                        fontFamily: isActive
                          ? ct.fontFamily.semibold
                          : ct.fontFamily.medium,
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
