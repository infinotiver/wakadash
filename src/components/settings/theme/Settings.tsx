import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  createMaterial3Theme,
  getMaterial3Theme,
} from "@pchmn/expo-material3-theme";
import { useMemo, useState } from "react";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Button } from "@/src/components/Button";
import staticColors from "@/src/constants/colors";
import { ct } from "@/src/constants/styles.common";
import { useThemeChoice } from "@/src/context/DynamicColorContext";
import { useColors } from "@/src/hooks/useColors";

const styles = ct.styles.settings;
const TILE = 56;

type Preview = {
  primary: string;
  onPrimary: string;
};

const PRESETS = [
  { label: "Violet", hex: "#6750A4" },
  { label: "Blue", hex: "#0061A4" },
  { label: "Green", hex: "#386A20" },
  { label: "Orange", hex: "#8D4E29" },
  { label: "Red", hex: "#B3261E" },
  { label: "Gold", hex: "#705D0D" },
];

export function ThemeSettings() {
  const c = useColors();
  const { choice, setChoice, supported } = useThemeChoice();

  const [showCustom, setShowCustom] = useState(false);
  const [customHex, setCustomHex] = useState("");

  const isCustom =
    choice.startsWith("#") && !PRESETS.some((p) => p.hex === choice);

  const closeCustom = () => {
    setShowCustom(false);
    setCustomHex("");
  };

  const tiles = useMemo(() => {
    const make = (hex: string) => createMaterial3Theme(hex).light as Preview;

    return [
      ...(supported
        ? [
            {
              id: "system",
              label: "Dynamic",
              scheme: getMaterial3Theme().light as Preview,
            },
          ]
        : []),
      {
        id: "default",
        label: "Default",
        scheme: staticColors.light as Preview,
      },
      ...PRESETS.map((p) => ({
        id: p.hex,
        label: p.label,
        scheme: make(p.hex),
      })),
    ];
  }, [supported]);

  const hex = customHex.trim().replace(/^#?/, "#").toUpperCase();
  const validHex = /^#[0-9A-F]{6}$/.test(hex);

  const Tile = ({
    label,
    selected,
    scheme,
    onPress,
  }: {
    label: string;
    selected: boolean;
    scheme?: Preview;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={{
        alignItems: "center",
        gap: ct.space.xs,
      }}
    >
      <View
        style={{
          width: TILE,
          height: TILE,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: selected ? ct.radius.full : ct.radius.xl,
          backgroundColor: scheme?.primary ?? c.surfaceContainerHighest,
          borderWidth: selected ? 2 : 1,
          borderColor: selected ? c.primary : c.outlineVariant,
        }}
      >
        <MaterialCommunityIcons
          name={scheme ? "check" : "plus"}
          size={24}
          color={scheme?.onPrimary ?? c.onSurfaceVariant}
          style={{ opacity: scheme && !selected ? 0 : 1 }}
        />
      </View>

      <Text
        style={[
          ct.text.body,
          {
            color: selected ? c.onSurface : c.onSurfaceVariant,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.section, { backgroundColor: c.surfaceContainerHigh }]}>
      <Text style={[styles.sectionTitle, { color: c.onSurface }]}>Theme</Text>

      <View style={{ padding: ct.space.md }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            gap: ct.space.md,
            paddingVertical: ct.space.xs,
          }}
        >
          {tiles.map((t) => (
            <Tile
              key={t.id}
              label={t.label}
              scheme={t.scheme}
              selected={choice === t.id}
              onPress={() => {
                setChoice(t.id);
                closeCustom();
              }}
            />
          ))}

          <Tile
            label="Custom"
            selected={isCustom}
            scheme={
              isCustom
                ? (createMaterial3Theme(choice).light as Preview)
                : undefined
            }
            onPress={() => {
              if (showCustom) {
                closeCustom();
              } else {
                setShowCustom(true);
              }
            }}
          />
        </ScrollView>
      </View>

      {showCustom && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: ct.space.sm,
          }}
        >
          <View
            style={[
              styles.inputRow,
              {
                flex: 1,
                borderWidth: 1,
                borderColor:
                  customHex && !validHex ? c.error : c.outlineVariant,
                borderRadius: ct.radius.lg,
                paddingHorizontal: ct.space.md,
              },
            ]}
          >
            <View
              style={{
                width: 20,
                height: 20,
                borderRadius: ct.radius.full,
                backgroundColor: validHex ? hex : c.surfaceContainerHighest,
                borderWidth: 1,
                borderColor: c.outlineVariant,
              }}
            />

            <TextInput
              style={[
                styles.input,
                {
                  flex: 1,
                  color: c.onSurface,
                  fontFamily: ct.fontFamily.regular,
                },
              ]}
              value={customHex}
              onChangeText={setCustomHex}
              placeholder="#6750A4"
              placeholderTextColor={c.onSurfaceVariant}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={7}
              returnKeyType="done"
              onSubmitEditing={() => {
                if (validHex) {
                  setChoice(hex);
                  closeCustom();
                }
              }}
            />
          </View>

          <View style={{ flexDirection: "row", gap: ct.space.xs }}>
            <Button label="Cancel" variant="outlined" onPress={closeCustom} />

            <Button
              label="Apply"
              icon={({ color, size }) => (
                <MaterialCommunityIcons
                  name="check"
                  size={size}
                  color={color}
                />
              )}
              disabled={!validHex}
              onPress={() => {
                setChoice(hex);
                closeCustom();
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
}
