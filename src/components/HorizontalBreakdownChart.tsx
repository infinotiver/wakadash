import React from "react";
import { Text, View } from "react-native";
import { HorizontalStackedBar } from "@/src/components/HorizontalStackedBar";
import { commonStyles, RADIUS, SPACING, t } from "@/src/constants/styles.common";

export type HorizontalBreakdownChartItem = {
  key?: string;
  label: string;
  percent: number;
  color: string;
  secondaryText?: string;
  trailingText?: string;
};

interface HorizontalBreakdownChartProps {
  items: HorizontalBreakdownChartItem[];
  textColor: string;
  mutedTextColor: string;
  trackColor: string;
  separatorColor?: string;
}

export function HorizontalBreakdownChart({
  items,
  textColor,
  mutedTextColor,
  trackColor,
  separatorColor,
}: HorizontalBreakdownChartProps) {
  const visibleItems = items.filter((item) => item.percent > 0);

  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <View style={{ gap: 10 }}>
      <HorizontalStackedBar
        segments={visibleItems.map((item) => ({
          key: item.key ?? item.label,
          value: item.percent,
          color: item.color,
        }))}
        height={12}
        radius={999}
        backgroundColor={trackColor}
        separatorColor={separatorColor ?? trackColor}
      />

      <View style={{ gap: 10 }}>
        {visibleItems.map((item) => (
          <View
            key={item.key ?? item.label}
            style={[commonStyles.row, { alignItems: "flex-start", gap: SPACING.sm }]}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: RADIUS.full,
                backgroundColor: item.color,
                marginTop: 5,
              }}
            />
            <Text
              style={[
                t.body,
                {
                  flex: 1,
                  minWidth: 0,
                  color: textColor,
                },
              ]}
            >
              {item.label}
            </Text>
            <View
              style={[
                commonStyles.row,
                {
                  flexShrink: 0,
                  alignItems: "center",
                  gap: SPACING.sm,
                },
              ]}
            >
              {item.secondaryText ? (
                <Text
                  style={[
                    t.body,
                    {
                      color: mutedTextColor,
                      textAlign: "right",
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.secondaryText}
                </Text>
              ) : null}
              {item.trailingText ? (
                <Text
                  style={[
                    t.body,
                    {
                      minWidth: 48,
                      textAlign: "right",
                      color: mutedTextColor,
                      fontVariant: ["tabular-nums"],
                    },
                  ]}
                  numberOfLines={1}
                >
                  {item.trailingText}
                </Text>
              ) : null}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
