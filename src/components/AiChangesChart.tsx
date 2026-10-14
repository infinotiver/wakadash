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

const BAR = 32;
const INNER_GAP = 6; // between + and - bars in a pair
const GROUP_GAP = 36; // between AI pair and Human pair
const CHART_HEIGHT = 120;
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

  const topLabel = (value: number) => () => (
    <Text
      style={{
        color: colors.onSurfaceVariant,
        fontFamily: ct.fontFamily.medium,
        fontSize: ct.fontSize.xs,
        textAlign: "center",
        width: BAR + 16,
        marginBottom: 2,
      }}
      numberOfLines={1}
    >
      {compact(value)}
    </Text>
  );

  const bar = (value: number, color: string, spacing: number) => ({
    value,
    frontColor: color,
    spacing,
    topLabelComponent: topLabel(value),
  });

  const data = [
    bar(aiAdditions, addColor, INNER_GAP),
    bar(aiDeletions, delColor, GROUP_GAP),
    bar(humanAdditions, addColor, INNER_GAP),
    bar(humanDeletions, delColor, 0),
  ];

  const max = Math.max(
    1,
    aiAdditions,
    aiDeletions,
    humanAdditions,
    humanDeletions,
  );

  const groupLabel = {
    width: PAIR_WIDTH,
    textAlign: "center" as const,
    color: colors.onSurface,
    fontFamily: ct.fontFamily.semibold,
    fontSize: ct.fontSize.md,
  };

  return (
    <View
      style={{ gap: ct.space.sm }}
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
            barBorderRadius={6}
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

          {/* group names, aligned under each pair */}
          <View
            style={{
              flexDirection: "row",
              paddingLeft: sidePad,
              gap: GROUP_GAP,
            }}
          >
            <Text style={groupLabel}>AI</Text>
            <Text style={groupLabel}>Human</Text>
          </View>
        </>
      )}

      {/* key */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          gap: ct.space.lg,
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
              gap: ct.space.xs,
            }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                borderRadius: 3,
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
