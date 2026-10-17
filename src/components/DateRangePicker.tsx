import React from "react";
import { Pressable, Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { useDatePicker } from "@/src/hooks/useDatePicker";
import { ct } from "@/src/constants/styles.common";

interface Props {
  value: string; // "YYYY-MM-DD_YYYY-MM-DD"
  onChange: (value: string) => void;
}

export function DateRangePicker({ value, onChange }: Props) {
  const c = useColors();
  const { open, modal } = useDatePicker();
  const [start, end] = value.split("_");

  // ISO dates compare correctly as strings; keep start <= end
  const pick = (which: "start" | "end", key: string) => {
    if (which === "start") onChange(`${key}_${key > end ? key : end}`);
    else onChange(`${key < start ? key : start}_${key}`);
  };

  const fields = [
    ["start", "From", start],
    ["end", "To", end],
  ] as const;

  return (
    <>
      <View style={{ flexDirection: "row", gap: ct.space.sm }}>
        {fields.map(([which, label, v]) => (
          <View key={which} style={{ flex: 1, gap: ct.space.xs }}>
            <Text style={[ct.text.label, { color: c.onSurfaceVariant }]}>
              {label}
            </Text>
            <Pressable
              onPress={() =>
                open({
                  value: v,
                  title: which === "start" ? "Start date" : "End date",
                  onPick: (key) => pick(which, key),
                })
              }
              style={({ pressed }) => ({
                padding: ct.padding.lg,
                borderRadius: ct.radius.full,
                alignItems: "center",
                backgroundColor: c.surfaceContainerHigh,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <Text style={[ct.text.buttonText, { color: c.onSurface }]}>
                {v}
              </Text>
            </Pressable>
          </View>
        ))}
      </View>
      {modal}
    </>
  );
}
