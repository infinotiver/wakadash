import React, { useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

export interface ButtonGroupItem<T extends string> {
  label: string;
  value: T;
}

interface ButtonGroupProps<T extends string> {
  items: ButtonGroupItem<T>[];
  value: T;
  onChange: (value: T) => void;
  /** "sm" shrinks padding/font for use alongside other controls (e.g. a section header). Defaults to "md". */
  size?: "sm" | "md";
  /** Pushes the pills to the right when they don't fill the available width. Defaults to "left". */
  align?: "left" | "right";
}

export function ButtonGroup<T extends string>({
  items,
  value,
  onChange,
  size = "md",
  align = "left",
}: ButtonGroupProps<T>) {
  const c = useColors();
  const isSmall = size === "sm";
  const scrollRef = useRef<ScrollView>(null);
  const [viewportWidth, setViewportWidth] = useState(0);
  const itemLayouts = useRef<Record<string, { x: number; width: number }>>({});

  const centerItem = (itemValue: T) => {
    const layout = itemLayouts.current[itemValue];
    if (!layout || viewportWidth === 0) return;

    scrollRef.current?.scrollTo({
      x: Math.max(0, layout.x - (viewportWidth - layout.width) / 2),
      animated: true,
    });
  };

  useEffect(() => {
    centerItem(value);
  }, [value, viewportWidth]);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      onLayout={(event) => setViewportWidth(event.nativeEvent.layout.width)}
      contentContainerStyle={[
        styles.container,
        align === "right" && styles.containerRight,
      ]}
    >
      {items.map((item) => {
        const selected = item.value === value;

        return (
          <Pressable
            key={item.value}
            onPress={() => {
              onChange(item.value);
              centerItem(item.value);
            }}
            onLayout={(event) => {
              itemLayouts.current[item.value] = {
                x: event.nativeEvent.layout.x,
                width: event.nativeEvent.layout.width,
              };
            }}
            style={({ pressed }) => [
              styles.button,
              isSmall && styles.buttonSmall,
              {
                backgroundColor: selected
                  ? c.secondary
                  : c.surfaceContainerHigh,
                borderRadius: selected ? ct.radius.full : ct.radius.lg,
                paddingHorizontal: isSmall ? 14 : selected ? 20 : 16,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[
                isSmall ? ct.text.captionMedium : ct.text.buttonText,
                {
                  color: selected ? c.onPrimary : c.onSurfaceVariant,
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: ct.padding.xs,
  },

  containerRight: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },

  button: {
    alignItems: "center",
    padding: ct.padding.md,
    justifyContent: "center",
  },

  buttonSmall: {
    paddingVertical: ct.padding.sm,
  },
});
