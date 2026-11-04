import React, { useState } from "react";
import { Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

interface Props {
  aiAdditions: number;
  aiDeletions: number;
  humanAdditions: number;
  humanDeletions: number;
}

const BAR = 26;
const INNER_GAP = 4;
const GROUP_GAP = 24;
const CHART_HEIGHT = 100;
const PAIR_WIDTH = BAR * 2 + INNER_GAP;

const compact = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact" }).format(n);

export function AiChangesChart({
  aiAdditions,
  aiDeletions,
  humanAdditions,
  humanDeletions,
}: Props) {
  const colors = useColors();
  const [width, setWidth] = useState(0);

  const addColor = colors.accent.green.color;
  const delColor = colors.accent.coral.color;

  const totalBars = PAIR_WIDTH * 2 + GROUP_GAP;
  const sidePad = Math.max(0, (width - totalBars) / 2);

  const values = [
    { value: aiAdditions, color: addColor, spacing: INNER_GAP },
    { value: aiDeletions, color: delColor, spacing: GROUP_GAP },
    { value: humanAdditions, color: addColor, spacing: INNER_GAP },
    { value: humanDeletions, color: delColor, spacing: 0 },
  ];

  const max = Math.max(1, ...values.map((item) => item.value));

  const data = values.map(({ value, color, spacing }) => ({
    value,
    frontColor: color,
    spacing,
    topLabelComponent: () => (
      <Text
        style={{
          color: colors.onSurfaceVariant,
          fontFamily: ct.fontFamily.medium,
          fontSize: 10,
          textAlign: "center",
          width: BAR + 12,
          marginBottom: 1,
        }}
        numberOfLines={1}
      >
        {compact(value)}
      </Text>
    ),
  }));

  if (max === 1 && values.every((item) => item.value === 0)) return null;

  return (
    <View
      style={{ gap: ct.space.xs }}
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <>
          <BarChart
            data={data}
            width={width}
            height={CHART_HEIGHT}
            maxValue={max * 1.2}
            noOfSections={3}
            barWidth={BAR}
            initialSpacing={sidePad}
            endSpacing={0}
            barBorderRadius={5}
            disableScroll
            hideYAxisText
            yAxisThickness={0}
            yAxisLabelWidth={0}
            xAxisThickness={0}
            rulesColor={colors.outlineVariant}
            rulesType="solid"
            backgroundColor="transparent"
            isAnimated
          />

          <View
            style={{
              flexDirection: "row",
              paddingLeft: sidePad,
              gap: GROUP_GAP,
            }}
          >
            {["AI", "Human"].map((label) => (
              <Text
                key={label}
                style={{
                  width: PAIR_WIDTH,
                  textAlign: "center",
                  color: colors.onSurface,
                  fontFamily: ct.fontFamily.semibold,
                  fontSize: ct.fontSize.sm,
                }}
              >
                {label}
              </Text>
            ))}
          </View>
        </>
      )}

      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: ct.space.md,
        }}
      >
        {[
          { label: "Additions", color: addColor },
          { label: "Deletions", color: delColor },
        ].map((item) => (
          <View
            key={item.label}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 5,
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                backgroundColor: item.color,
              }}
            />
            <Text style={[ct.text.caption, { color: colors.onSurfaceVariant }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
