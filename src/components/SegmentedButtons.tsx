import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

export interface SegmentedButtonItem<T extends string> {
  label: string;
  value: T;
}

interface SegmentedButtonsProps<T extends string> {
  items: SegmentedButtonItem<T>[];
  value: T;
  onChange: (value: T) => void;
}

const HEIGHT = 40;
const ICON_SIZE = 18;

export function SegmentedButtons<T extends string>({
  items,
  value,
  onChange,
}: SegmentedButtonsProps<T>) {
  const c = useColors();

  return (
    <View
      style={[
        styles.track,
        {
          height: HEIGHT,
          borderRadius: HEIGHT / 2,
          borderColor: c.outline,
        },
      ]}
    >
      {items.map((item, index) => {
        const selected = item.value === value;

        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={({ pressed }) => [
              styles.segment,
              {
                borderLeftWidth: index === 0 ? 0 : 1,
                borderColor: c.outline,
                backgroundColor: selected
                  ? c.secondaryContainer
                  : "transparent",
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            {selected ? (
              <MaterialCommunityIcons
                name="check"
                size={ICON_SIZE}
                color={c.onSecondaryContainer}
                style={{ marginRight: ct.space.xs }}
              />
            ) : null}
            <Text
              numberOfLines={1}
              style={[
                ct.text.buttonText,
                {
                  fontSize: ct.fontSize.sm,
                  color: selected ? c.onSecondaryContainer : c.onSurface,
                },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    alignSelf: "center",
    borderWidth: 1,
    overflow: "hidden",
  },

  segment: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: ct.space.md,
  },
});
