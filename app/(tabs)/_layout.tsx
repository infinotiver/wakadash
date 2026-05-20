import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { TabIcon } from "@/src/components/navigation/TabIcon";

export default function TabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarIconStyle: { marginBottom: 0 },
        tabBarItemStyle: { paddingVertical: 8 },
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.background,
          borderTopWidth: isWeb ? 1 : StyleSheet.hairlineWidth,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              colors={colors}
              icon={
                isIOS ? (
                  <SymbolView
                    name={focused ? "chart.bar.fill" : "chart.bar"}
                    tintColor={color}
                    size={22}
                  />
                ) : (
                  <Feather name="bar-chart-2" size={22} color={color} />
                )
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="breakdown"
        options={{
          title: "Breakdown",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              colors={colors}
              icon={
                isIOS ? (
                  <SymbolView
                    name={focused ? "chart.pie.fill" : "chart.pie"}
                    tintColor={color}
                    size={22}
                  />
                ) : (
                  <Feather name="pie-chart" size={22} color={color} />
                )
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              colors={colors}
              icon={
                isIOS ? (
                  <SymbolView
                    name={focused ? "calendar.badge.clock" : "calendar"}
                    tintColor={color}
                    size={22}
                  />
                ) : (
                  <Feather name="calendar" size={22} color={color} />
                )
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              colors={colors}
              icon={
                isIOS ? (
                  <SymbolView
                    name={focused ? "gearshape.fill" : "gearshape"}
                    tintColor={color}
                    size={22}
                  />
                ) : (
                  <Feather name="settings" size={22} color={color} />
                )
              }
            />
          ),
        }}
      />
    </Tabs>
  );
}
