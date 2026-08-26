import { Tabs } from "expo-router";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Platform } from "react-native";
import { SymbolView } from "expo-symbols";
import { useColors } from "@/src/hooks/useColors";


const isIOS = Platform.OS === "ios";

export default function TabLayout() {
  const colors = useColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: colors.surfaceContainerLow,
          borderTopWidth: 0,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "chart.bar.fill" : "chart.bar"}
                tintColor={color}
                size={22}
              />
            ) : (
              <MaterialCommunityIcons
                name={focused ? "view-dashboard" : "view-dashboard-outline"}
                size={22}
                color={color}
              />
            ),
        }}
      />
      <Tabs.Screen
        name="breakdown"
        options={{
          title: "Breakdown",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "chart.pie.fill" : "chart.pie"}
                tintColor={color}
                size={22}
              />
            ) : (
              <MaterialIcons
                name={
                  focused
                    ? "pie-chart-outline"
                    : "pie-chart" 
                }
                size={22}
                color={color}
              />
            ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView
                name={focused ? "gearshape.fill" : "gearshape"}
                tintColor={color}
                size={22}
              />
            ) : (
              <MaterialCommunityIcons
                name={focused ? "cog" : "cog-outline"}
                size={22}
                color={color}
              />
            ),
        }}
      />
    </Tabs>
  );
}
