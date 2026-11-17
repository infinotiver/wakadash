import { Text, TouchableOpacity, View } from "react-native";

import { ct } from "@/src/constants/styles.common";
import { useThemeChoice } from "@/src/context/DynamicColorContext";
import { useColors } from "@/src/hooks/useColors";

const SEEDS = [
  "#6750A4",
  "#0061A4",
  "#386A20",
  "#8D4E29",
  "#B3261E",
  "#705D0D",
];

export function ThemeSettings() {
  const colors = useColors();
  const { choice, setChoice, supported } = useThemeChoice();

  const modes = [
    ...(supported ? [{ label: "System", value: "system" }] : []),
    { label: "Default", value: "default" },
  ];

  return (
    <View
      style={[
        ct.styles.settings.section,
        { backgroundColor: colors.surfaceContainerHigh },
      ]}
    >
      <Text style={[ct.text.sectionTitle, { color: colors.onSurface }]}>
        Theme
      </Text>

      <View
        style={{ flexDirection: "row", flexWrap: "wrap", gap: ct.space.xs }}
      >
        {modes.map((m) => {
          const selected = choice === m.value;
          return (
            <TouchableOpacity
              key={m.value}
              activeOpacity={0.7}
              onPress={() => setChoice(m.value)}
              style={{
                paddingVertical: ct.space.sm,
                paddingHorizontal: ct.space.md,
                borderRadius: ct.radius.full,
                borderWidth: 1,
                borderColor: selected
                  ? colors.secondaryContainer
                  : colors.outlineVariant,
                backgroundColor: selected
                  ? colors.secondaryContainer
                  : "transparent",
              }}
            >
              <Text
                style={[
                  ct.text.bodyMedium,
                  {
                    color: selected
                      ? colors.onSecondaryContainer
                      : colors.onSurfaceVariant,
                  },
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ flexDirection: "row", gap: ct.space.md }}>
        {SEEDS.map((seed) => (
          <TouchableOpacity
            key={seed}
            activeOpacity={0.8}
            onPress={() => setChoice(seed)}
            style={{
              width: 36,
              height: 36,
              borderRadius: ct.radius.full,
              backgroundColor: seed,
              borderWidth: choice === seed ? 3 : 0,
              borderColor: colors.onSurface,
            }}
          />
        ))}
      </View>
    </View>
  );
}
