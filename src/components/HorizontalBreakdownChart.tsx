import React from "react";
import { Text, View } from "react-native";
import { HorizontalStackedBar } from "@/src/components/HorizontalStackedBar";
import { ct } from "@/src/constants/styles.common";

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
    <View style={{ gap: ct.layout.listGap }}>
      <HorizontalStackedBar
        segments={visibleItems.map((item) => ({
          key: item.key ?? item.label,
          value: item.percent,
          color: item.color,
        }))}
        height={20}
        backgroundColor={trackColor}
        separatorColor={separatorColor ?? trackColor}
      />

      <View style={{ gap: ct.sm }}>
        {visibleItems.map((item) => (
          <View
            key={item.key ?? item.label}
            style={[ct.styles.row, { alignItems: "flex-start", gap: ct.sm }]}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: ct.radius.full,
                backgroundColor: item.color,
                marginTop: ct.size.marker,
              }}
            />
            <Text
              style={[
                ct.text.body,
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
                ct.styles.row,
                {
                  flexShrink: 0,
                  alignItems: "center",
                  gap: ct.sm,
                },
              ]}
            >
              {item.secondaryText ? (
                <Text
                  style={[
                    ct.text.body,
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
                    ct.text.body,
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
