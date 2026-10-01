import React, { useState } from "react";
import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

export interface CategoryBarChartItem {
  name: string;
  percent: number;
  total_seconds?: number;
  text?: string;
}

interface Props {
  items: CategoryBarChartItem[];
  colors: string[];
}

const Y_AXIS_LABEL_WIDTH = 34;
const MAX_BAR_WIDTH = 34;
const MIN_BAR_WIDTH = 20;
const MIN_SPACING = 16;
const INITIAL_SPACING = 16;

const MAX_BARS_WITHOUT_SCROLL = 7;

const DIMMED_ALPHA = "66";

function truncate(name: string): string {
  return name.length > 10 ? `${name.slice(0, 9)}…` : name;
}

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function CategoryBarChart({ items, colors: barColors }: Props) {
  const c = useColors();
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!items.length) return null;

  const activeItem = activeIndex !== null ? items[activeIndex] : null;
  const activeTimeText =
    activeItem?.text ??
    (activeItem?.total_seconds !== undefined
      ? formatSeconds(activeItem.total_seconds)
      : null);

  const maxPercent = Math.max(...items.map((item) => item.percent), 1);
  const maxValue = Math.min(100, Math.ceil(maxPercent / 10) * 10 + 10);

  const data = items.map((item, i) => {
    const isActive = activeIndex === i;
    const baseColor = barColors[i % barColors.length] ?? c.primary;
    const frontColor =
      activeIndex !== null && !isActive
        ? `${baseColor}${DIMMED_ALPHA}`
        : baseColor;

    return {
      value: item.percent,
      label: truncate(item.name),
      frontColor,
      topLabelComponent: () => (
        <Text
          style={[
            ct.text.caption,
            { color: c.onSurface, marginBottom: ct.space.xs },
          ]}
        >
          {item.percent.toFixed(0)}%
        </Text>
      ),
    };
  });

  const disableScroll = items.length <= MAX_BARS_WITHOUT_SCROLL;

  // When everything fits, size bars off the real available width so they're
  // evenly spread instead of using a one-size-fits-all constant that looks
  // cramped with many bars and needlessly tight with few.
  let barWidth = 26;
  let spacing = 22;

  if (disableScroll && containerWidth > 0) {
    const chartAreaWidth =
      containerWidth - Y_AXIS_LABEL_WIDTH - INITIAL_SPACING * 2;
    const n = data.length;
    // width = n * barWidth + (n - 1) * spacing, with spacing kept close to
    // (but not smaller than) barWidth so bars read as separated columns
    // rather than a solid block.
    const perSlot = chartAreaWidth / n;
    barWidth = Math.max(MIN_BAR_WIDTH, Math.min(MAX_BAR_WIDTH, perSlot * 0.55));
    spacing = Math.max(MIN_SPACING, perSlot - barWidth);
  }

  const handleBarPress = (_item: any, index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <View onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
      {/* Detail row for the tapped bar — full (untruncated) name + time,
          since the x-axis label alone is truncated and shows percent only. */}
      <View
        style={{
          alignItems: "center",
          justifyContent: "center",
          minHeight: ct.size.tooltip,
          marginBottom: ct.space.sm,
        }}
      >
        {activeItem ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: ct.space.sm,
            }}
          >
            <Text
              style={{
                fontSize: ct.fontSize.md,
                fontFamily: ct.fontFamily.semibold,
                color: c.onSurface,
              }}
              numberOfLines={1}
            >
              {activeItem.name}
            </Text>
            {activeTimeText ? (
              <>
                <View
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: c.outline,
                  }}
                />
                <Text
                  style={{
                    fontSize: ct.fontSize.md,
                    fontFamily: ct.fontFamily.medium,
                    color: c.onSurfaceVariant,
                  }}
                >
                  {activeTimeText}
                </Text>
              </>
            ) : null}
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: c.outline,
              }}
            />
            <Text
              style={{
                fontSize: ct.fontSize.md,
                fontFamily: ct.fontFamily.medium,
                color: c.onSurfaceVariant,
                fontVariant: ["tabular-nums"],
              }}
            >
              {activeItem.percent.toFixed(1)}%
            </Text>
          </View>
        ) : (
          <Text
            style={{
              fontSize: ct.fontSize.xs,
              fontFamily: ct.fontFamily.regular,
              color: c.onSurfaceVariant,
            }}
          >
            Tap a bar for details
          </Text>
        )}
      </View>

      {containerWidth > 0 && (
        <BarChart
          data={data}
          height={140}
          barWidth={barWidth}
          spacing={spacing}
          initialSpacing={INITIAL_SPACING}
          roundedTop
          maxValue={maxValue}
          noOfSections={4}
          yAxisThickness={0}
          yAxisTextStyle={{
            color: c.onSurfaceVariant,
            fontSize: ct.fontSize.xs,
          }}
          yAxisLabelSuffix="%"
          yAxisLabelWidth={Y_AXIS_LABEL_WIDTH}
          xAxisThickness={1}
          xAxisColor={c.outlineVariant}
          xAxisLabelTextStyle={{
            color: c.onSurfaceVariant,
            fontSize: ct.fontSize.xs,
            fontFamily: ct.fontFamily.medium,
          }}
          rulesColor={c.outlineVariant}
          rulesType="dashed"
          isAnimated
          animationDuration={500}
          disableScroll={disableScroll}
          showScrollIndicator={false}
          onPress={handleBarPress}
        />
      )}
    </View>
  );
}
