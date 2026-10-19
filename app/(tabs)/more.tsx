import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { AppBar } from "@/src/components/AppBar";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const ITEMS: { label: string; icon: IconName; href: Href }[] = [
  { label: "Settings", icon: "cog-outline", href: "/settings" },
  { label: "All Languages", icon: "code-tags", href: "/languages" },
  { label: "All Editors", icon: "application-edit-outline", href: "/editors" },
  { label: "All Projects", icon: "folder-outline", href: "/projects" },
  {
    label: "All Operating systems",
    icon: "laptop",
    href: "/operating-systems",
  }
];

export default function MoreScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBar title="More" variant="center" />
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: ct.space.lg,
          paddingBottom: insets.bottom + 56 + ct.space["3xl"],
        }}
      >
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
      </ScrollView>
    </View>
  );
}
