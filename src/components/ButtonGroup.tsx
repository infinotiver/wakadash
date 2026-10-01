import React from "react";
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

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
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
            onPress={() => onChange(item.value)}
            style={({ pressed }) => [
              styles.button,
              isSmall && styles.buttonSmall,
              {
                backgroundColor: selected
                  ? c.secondary
                  : c.surfaceContainerHigh,
                borderRadius: selected ? ct.radius.lg : ct.radius.full,
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
    padding: ct.padding.lg,
    justifyContent: "center",
  },

  buttonSmall: {
    paddingVertical: ct.padding.sm,
  },
});
