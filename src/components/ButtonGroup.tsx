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
}

export function ButtonGroup<T extends string>({
  items,
  value,
  onChange,
}: ButtonGroupProps<T>) {
  const c = useColors();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {items.map((item) => {
        const selected = item.value === value;

        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: selected
                  ? c.secondary
                  : c.surfaceContainerHigh,
                borderRadius: selected ? ct.radius.lg : ct.radius.full,
                paddingHorizontal: selected ? 20 : 16,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              style={[
                ct.text.buttonText,
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

  button: {
    alignItems: "center",
    padding: ct.padding.lg,
    justifyContent: "center",
  },
});
