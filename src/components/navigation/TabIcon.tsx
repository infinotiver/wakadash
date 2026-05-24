import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { tabIconStyles } from "@/src/constants/styles.components";

interface TabIconProps {
  focused: boolean;
  color: string;
  label?: string;
  colors: ReturnType<typeof useColors>;
  icon: React.ReactNode;
}

export function TabIcon({ focused, color, label, colors, icon }: TabIconProps) {
  return (
    <View style={tabIconStyles.container}>
      <View
        style={[
          tabIconStyles.iconWrap,
          focused ? { backgroundColor: colors.primary + "20" } : undefined,
        ]}
      >
        {icon}
      </View>

      <Text
        style={[
          tabIconStyles.label,
          {
            color: focused ? color : colors.mutedForeground,
            opacity: focused ? 1 : 0,
          },
        ]}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {label ?? ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: tabIconStyles.container,
  iconWrap: tabIconStyles.iconWrap,
  label: tabIconStyles.label,
});
