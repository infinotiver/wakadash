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
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

export function WeeklyChart({ days }: Props) {
  const colors = useColors();
  const [activeIndex, setActiveIndex] = useState<number | null>(days.length - 1);

  const maxSeconds = useMemo(
    () =>
      Math.max(1, ...days.map((day) => day.grand_total?.total_seconds ?? 0)),
    [days],
  );

  const activeDay = activeIndex !== null ? days[activeIndex] : days[days.length - 1];
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
    maxSeconds > 0 ? `${((1 - avgSeconds / maxSeconds) * 100).toFixed(2)}%` : "0%";

  return (
    <View style={{ gap: ct.space.md }}>
      {activeIndex !== null && activeDateLabel ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: ct.space.sm,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: ct.space.sm }}>
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

            <Text
              style={{
                fontSize: ct.fontSize.xs,
                lineHeight: ct.lineHeight.xs,
                fontFamily: ct.fontFamily.semibold,
                color: deltaSeconds >= 0 ? colors.primary : colors.onSurfaceVariant,
              }}
            >
              {deltaText}
            </Text>
          </View>

          <Text
            style={{
              fontSize: ct.fontSize.md,
              lineHeight: ct.lineHeight.md,
              fontFamily: ct.fontFamily.semibold,
              color: colors.onSurface,
            }}
          >
            {formatTime(activeSeconds)}
          </Text>
        </View>
      ) : null}

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
            <View
              style={{
                position: "absolute",
                top: averageLineTop as any,
                left: 0,
                right: 0,
                height: 1,
                backgroundColor: colors.outlineVariant,
                opacity: 0.9,
              }}
            />
          </View>

          <View style={styles.bars}>
            {days.map((day, index) => {
              const seconds = day.grand_total?.total_seconds ?? 0;
              const heightPercent =
                seconds === 0 ? 0 : Math.max(6, (seconds / maxSeconds) * 100);
              const isActive = activeIndex === index;
              const date = day.range?.date
                ? new Date(`${day.range.date}T12:00:00`)
                : null;
              const label = date ? DAY_LABELS[date.getDay()] : "—";

              return (
                <Pressable
                  key={day.range?.date ?? index}
                  style={styles.barCol}
                  onPress={() => setActiveIndex(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}, ${formatTime(seconds)}`}
                  accessibilityState={{ selected: isActive }}
                >
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
                            ? colors.primary
                            : colors.tertiaryContainer,
                          borderRadius: 999,
                        }}
                      />
                    )}
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
