import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import type { WakaSummaryDay } from "@/src/types/wakatime";
import { ct } from "@/src/constants/styles.common";

const styles = ct.styles.weeklyChart;

interface Props {
  days: WakaSummaryDay[];
  // Optional controlled selection (YYYY-MM-DD). When omitted, the chart
  // manages its own selection like before.
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const GRIDLINE_BOTTOM_INSET = ct.lineHeight.xs + ct.space.xs;

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
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function WeeklyChart({ days, selectedDate, onSelectDate }: Props) {
  const colors = useColors();

  // Used only when the parent isn't controlling selection.
  const [localIndex, setLocalIndex] = useState<number | null>(null);

  const maxSeconds = useMemo(
    () =>
      Math.max(1, ...days.map((day) => day.grand_total?.total_seconds ?? 0)),
    [days],
  );

  // Controlled: derive the highlighted bar from the date. If the selected
  // date is outside this window, nothing is highlighted.
  const controlled = selectedDate !== undefined;
  const controlledIndex = controlled
    ? days.findIndex((d) => d.range?.date === selectedDate)
    : -1;
  const activeIndex = controlled
    ? controlledIndex >= 0
      ? controlledIndex
      : null
    : localIndex;

  const select = (index: number) => {
    const date = days[index]?.range?.date;
    if (onSelectDate && date) onSelectDate(date);
    else setLocalIndex(index);
  };

  const activeDay = activeIndex !== null ? days[activeIndex] : null;
  const activeSeconds = activeDay?.grand_total?.total_seconds ?? 0;

  const activeDateLabel = activeDay?.range?.date
    ? formatDateLabel(activeDay.range.date)
    : null;
  const avgSeconds =
    days.reduce((sum, day) => sum + (day.grand_total?.total_seconds ?? 0), 0) /
    Math.max(1, days.length);
  const deltaSeconds = activeSeconds - avgSeconds;
  const deltaPercent =
    avgSeconds > 0 ? Math.round((deltaSeconds / avgSeconds) * 100) : 0;
  const deltaText =
    avgSeconds > 0
      ? `${deltaSeconds >= 0 ? "+" : "-"}${Math.abs(deltaPercent)}% vs avg`
      : "New";
  const averageLineTop =
    maxSeconds > 0
      ? `${((1 - avgSeconds / maxSeconds) * 100).toFixed(2)}%`
      : "0%";

  return (
    <View>
      {/* Selected-day details */}
      <View
        style={{
          minHeight: ct.size.tooltip,
          marginBottom: ct.space.sm,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: ct.fontSize["2xl"],
            lineHeight: ct.lineHeight.md,
            fontFamily: ct.fontFamily.bold,
            color: colors.onSurface,
          }}
        >
          {formatTime(activeSeconds)}
        </Text>
        
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
                marginHorizontal: ct.space.sm,
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
              {deltaText}
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
            Avg: {formatTime(avgSeconds)}
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
              bottom: GRIDLINE_BOTTOM_INSET,
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
                  onHoverIn={() => select(index)}
                  onPress={() => select(index)}
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
