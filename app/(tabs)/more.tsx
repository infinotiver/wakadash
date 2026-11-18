import React from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBar } from "@/src/components/AppBar";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const REPO_URL = "https://github.com/infinotiver/wakadash";
const ISSUES_URL = `${REPO_URL}/issues`;

const ITEMS: { label: string; icon: IconName; href: Href }[] = [
  { label: "All Languages", icon: "code-tags", href: "/languages" },
  { label: "All Editors", icon: "application-edit-outline", href: "/editors" },
  { label: "All Projects", icon: "folder-outline", href: "/projects" },
  {
    label: "All Operating systems",
    icon: "laptop",
    href: "/operating-systems",
  },
];

function Tile({
  label,
  icon,
  onPress,
  bg,
  fg,
  tall = false,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
  bg: string;
  fg: string;
  tall?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: bg,
        borderRadius: ct.radius["2xl"],
        padding: ct.space.lg,
        justifyContent: tall ? "space-between" : "center",
        flexDirection: tall ? "column" : "row",
        alignItems: tall ? "flex-start" : "center",
        gap: ct.space.md,
        opacity: pressed ? 0.8 : 1,
      })}
    >
      <MaterialCommunityIcons name={icon} size={tall ? 32 : 22} color={fg} />
      <Text
        style={{
          color: fg,
          fontFamily: ct.fontFamily.semibold,
          fontSize: ct.fontSize["2xl"],
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const version = Constants.expoConfig?.version ?? "dev";

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBar title="More" variant="center" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: ct.space.lg,
          paddingBottom: insets.bottom + 56 + ct.space["3xl"],
          gap: ct.space.md,
        }}
      >
        {/* Top split: Settings | Source + Feedback */}
        <View style={{ flexDirection: "row", gap: ct.space.md, height: 168 }}>
          <Tile
            tall
            label="Settings"
            icon="cog-outline"
            onPress={() => router.push("/settings")}
            bg={colors.primaryContainer}
            fg={colors.onPrimaryContainer}
          />
          <View style={{ flex: 1, gap: ct.space.md }}>
            <Tile
              label="Source code"
              icon="github"
              onPress={() => Linking.openURL(REPO_URL)}
              bg={colors.secondaryContainer}
              fg={colors.onSecondaryContainer}
            />
            <Tile
              label="Feedback"
              icon="message-alert-outline"
              onPress={() => Linking.openURL(ISSUES_URL)}
              bg={colors.tertiaryContainer}
              fg={colors.onTertiaryContainer}
            />
          </View>
        </View>

        {/* View-all list */}
        <View
          style={{
            borderRadius: ct.radius.xl,
            backgroundColor: colors.surfaceContainerHigh,
            overflow: "hidden",
          }}
        >
          {ITEMS.map((item, i) => (
            <Pressable
              key={item.label}
              onPress={() => router.push(item.href)}
              style={({ pressed }) => ({
                flexDirection: "row",
                alignItems: "center",
                gap: ct.space.md,
                padding: ct.space.lg,
                borderTopWidth: i === 0 ? 0 : 1,
                borderTopColor: colors.outlineVariant,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={22}
                color={colors.onSurfaceVariant}
              />
              <Text
                style={{
                  flex: 1,
                  color: colors.onSurface,
                  fontFamily: ct.fontFamily.medium,
                  fontSize: ct.fontSize["2xl"],
                }}
              >
                {item.label}
              </Text>
              <MaterialCommunityIcons
                name="chevron-right"
                size={22}
                color={colors.onSurfaceVariant}
              />
            </Pressable>
          ))}
        </View>

        {/* Footer */}
        <View
          style={{
            alignItems: "center",
            gap: ct.space.xs,
            paddingTop: ct.space.sm,
          }}
        >
          <Text style={[ct.text.caption, { color: colors.onSurfaceVariant }]}>
            WakaDash v{version}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
