import { useColors } from "@/src/hooks/useColors";
import React from "react";
import { View } from "react-native";
interface TabIconProps {
  focused: boolean;
  color: string;
  colors: ReturnType<typeof useColors>;
  icon: React.ReactNode;
}

export function TabIcon({ focused, colors, icon }: TabIconProps) {
  return (
    <View
      style={{
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 6,
        backgroundColor: focused ? colors.primary + "22" : "transparent",
        borderRadius: 20,
        paddingHorizontal: focused ? 16 : 12,
        paddingVertical: 6,
        minWidth: 48,
      }}
    >
      {icon}
      
    </View>
  );
}
