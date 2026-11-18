import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Circle, Polyline } from "react-native-svg";
import { useColors } from "@/src/hooks/useColors";
import type { WakaSummaryDay } from "@/src/types/wakatime";
import { ct } from "@/src/constants/styles.common";
import {
  formatDuration,
  formatShortDate,
  formatPercentage,
} from "@/src/utils/dashboard";

const styles = ct.styles.weeklyChart;

interface Props {
  days: WakaSummaryDay[];
  compact?: boolean;
  // Optional controlled selection (YYYY-MM-DD). When omitted, the chart
  // manages its own selection like before.
  selectedDate?: string;
  onSelectDate?: (date: string) => void;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Space reserved under the bars for the day-label row (label height + gap).
const GRIDLINE_BOTTOM_INSET = ct.lineHeight.xs + ct.space.xs;

const BARS_HEIGHT = 120; // must match styles.weeklyChart.bars.height
const PLOT_HEIGHT = BARS_HEIGHT - GRIDLINE_BOTTOM_INSET; // bar area, excluding labels
const LINE_PAD = 6; // keeps dots from clipping at the svg edges
const MIN_BAR_PERCENT = 4; // must match the bar height rule below

function formatDateLabel(date: string): string {
  return formatShortDate(date);
}

// Single source of truth for bar height so bars and line dots always agree.
function barPercent(seconds: number, maxSeconds: number): number {
  return seconds === 0
    ? 0
    : Math.max(MIN_BAR_PERCENT, (seconds / maxSeconds) * 100);
}

export function WeeklyChart({
  days,
  selectedDate,
  onSelectDate,
  compact = false,
}: Props) {
  const colors = useColors();

  // Used only when the parent isn't controlling selection.
  const [localIndex, setLocalIndex] = useState<number | null>(null);
  const [plotWidth, setPlotWidth] = useState(0);

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
      ? `${deltaSeconds >= 0 ? "+" : "-"}${formatPercentage(Math.abs(deltaPercent))} vs avg`
      : "New";

  // Line points in SVG coordinates. The SVG is offset by -LINE_PAD, so
  // y = LINE_PAD + (distance from top of the bar area).
  const linePoints = useMemo(() => {
    if (compact || plotWidth <= 0 || days.length === 0) return [];
    const gap = ct.space.xs; // same gap as styles.bars
    const colWidth = (plotWidth - gap * (days.length - 1)) / days.length;
    return days.map((day, i) => {
      const seconds = day.grand_total?.total_seconds ?? 0;
      const heightPx = (barPercent(seconds, maxSeconds) / 100) * PLOT_HEIGHT;
      return {
        x: i * (colWidth + gap) + colWidth / 2,
        y: LINE_PAD + PLOT_HEIGHT - heightPx,
      };
    });
  }, [compact, days, plotWidth, maxSeconds]);

  return (
    <View>
      {!compact ? (
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
              fontFamily: ct.fontFamily.semibold,
              fontVariant: ["tabular-nums"],
              color: colors.onSurface,
            }}
          >
            {formatDuration(activeSeconds, { showSeconds: true })}
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
                  fontVariant: ["tabular-nums"],
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
                fontVariant: ["tabular-nums"],
                color: colors.onSurfaceVariant,
              }}
            >
              Avg: {formatDuration(avgSeconds)}
            </Text>
          )}
        </View>
      ) : null}

      {/* Chart */}
      <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
        <View
          style={{ flex: 1, overflow: "visible" }}
          onLayout={(e) => setPlotWidth(e.nativeEvent.layout.width)}
        >
          {/* Gridlines */}
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
                  left: 0,
                  right: 0,
                  height: 1,
                  ...(position === 1
                    ? { bottom: 0 }
                    : { top: `${position * 100}%` }),
                  backgroundColor: colors.outlineVariant,
                  opacity: position === 1 ? 0.8 : 0.5,
                }}
              />
            ))}
          </View>

          {/* Bars */}
          <View style={[styles.bars, compact ? { height: 96 } : null]}>
            {days.map((day, index) => {
              const seconds = day.grand_total?.total_seconds ?? 0;
              const heightPercent = barPercent(seconds, maxSeconds);
              const isActive = activeIndex === index;

              const date = day.range?.date
                ? new Date(`${day.range.date}T12:00:00`)
                : null;

              const label = date
                ? compact
                  ? DAY_LABELS[date.getDay()][0]
                  : DAY_LABELS[date.getDay()]
                : "—";

              return (
                <Pressable
                  key={day.range?.date ?? index}
                  style={styles.barCol}
                  onHoverIn={() => select(index)}
                  onPress={() => select(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`${label}, ${formatDuration(seconds)}`}
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
                        height: ct.lineHeight.xs,
                        lineHeight: ct.lineHeight.xs,
                        includeFontPadding: false,
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

          {/* Line overlay (non-compact only). Drawn after the bars so it
              sits on top; pointerEvents none keeps the bars tappable. */}
          {!compact && linePoints.length > 1 ? (
            <Svg
              pointerEvents="none"
              width={plotWidth}
              height={PLOT_HEIGHT + LINE_PAD * 2}
              style={{ position: "absolute", top: -LINE_PAD, left: 0 }}
            >
              <Polyline
                points={linePoints.map((p) => `${p.x},${p.y}`).join(" ")}
                fill="none"
                stroke={colors.primary}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {linePoints.map((p, i) => (
                <Circle
                  key={days[i]?.range?.date ?? i}
                  cx={p.x}
                  cy={p.y}
                  r={i === activeIndex ? 5 : 3}
                  fill={
                    i === activeIndex
                      ? colors.primary
                      : colors.surfaceContainerHigh
                  }
                  stroke={colors.primary}
                  strokeWidth={2}
                />
              ))}
            </Svg>
          ) : null}
        </View>
      </View>
    </View>
  );
}
