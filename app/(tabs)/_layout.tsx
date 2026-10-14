import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Keyboard, Platform, Pressable, View } from "react-native";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/src/hooks/useColors";

// Props type taken from <Tabs> itself so it always matches expo-router's own types.
// Avoids importing bottom bar for props which lead to a conflict
type TabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>
>[0];

// iOS 26+ uses the system (liquid glass) tab bar; everything else gets the floating bar.
const isIOS26 =
  Platform.OS === "ios" && parseInt(Platform.Version.toString(), 10) >= 26;

// Sizes follow the M3 floating toolbar: 64 bar, 48 round buttons.
const TAB_BAR_HEIGHT = 64;
const ICON_BUTTON_SIZE = 48;
const ITEM_WIDTH = 56; // button slot: 48 circle + 4 spare on each side
const BAR_PADDING = 4; // + the 4 spare above = 8 gap between circle and pill edge

// The three tabs shown in the bar.
// Settings is not shown as a tab
const BAR_TABS = ["index", "today", "breakdown"];

// Tab icon: fill icon on active
function TabIcon({
  focused,
  render,
}: {
  focused: boolean;
  render: (color: string) => React.ReactNode;
}) {
  const colors = useColors();
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  // Spring the fill in/out when selection changes.
  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [focused, progress]);

  return (
    <View
      style={{
        width: ICON_BUTTON_SIZE,
        height: ICON_BUTTON_SIZE,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Always mounted, only opacity/scale animate, so the circle never flashes square. */}
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: ICON_BUTTON_SIZE,
          height: ICON_BUTTON_SIZE,
          borderRadius: ICON_BUTTON_SIZE / 2,
          backgroundColor: colors.primary,
          opacity: progress,
          transform: [
            {
              scale: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.6, 1],
              }),
            },
          ],
        }}
      />
      {render(focused ? colors.onPrimary : colors.onPrimaryContainer)}
    </View>
  );
}

// Floating centered pill that replaces default tab bar
// The outer view is full-width and centers the pill, so it is always centered.
function FloatingTabBar({ state, descriptors, navigation }: TabBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  // Hide the bar while the keyboard is open (custom bars don't get this for free lmao).
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  if (keyboardVisible) return null;

  return (
    // box-none: the empty space around the pill stays touchable for the screen below.
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: Math.max(insets.bottom, 16),
        alignItems: "center",
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: TAB_BAR_HEIGHT,
          paddingHorizontal: BAR_PADDING,
          borderRadius: TAB_BAR_HEIGHT / 2,
          backgroundColor: colors.primaryContainer,
          elevation: 3,
          shadowColor: colors.shadow,
          shadowOpacity: 0.2,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        {state.routes.map((route, index) => {
          if (!BAR_TABS.includes(route.name)) return null;

          const { options } = descriptors[route.key];
          const focused = state.index === index;

          // Standard tab press: let listeners cancel it, then navigate.
          const onPress = () => {
            const event = navigation.emit({
              type: "tabPress",
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={
                options.tabBarAccessibilityLabel ?? options.title
              }
              onPress={onPress}
              onLongPress={() =>
                navigation.emit({ type: "tabLongPress", target: route.key })
              }
              style={{
                width: ITEM_WIDTH,
                height: TAB_BAR_HEIGHT,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Icon comes from each screen's tabBarIcon option below. */}
              {options.tabBarIcon?.({ focused, color: "", size: 22 })}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// iOS 26+: system tab bar (liquid glass)
function NativeTabLayout() {
  const { NativeTabs, Icon } = require("expo-router/unstable-native-tabs");
  const colors = useColors();

  return (
    <NativeTabs tintColor={colors.primary}>
      <NativeTabs.Trigger name="index">
        <Icon
          sf={{ default: "chart.bar", selected: "chart.bar.fill" }}
          md="dashboard"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="today">
        <Icon sf={{ default: "calendar", selected: "calendar" }} md="today" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="breakdown">
        <Icon
          sf={{ default: "chart.pie", selected: "chart.pie.fill" }}
          md="pie_chart"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings" hidden />
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const isIOS = Platform.OS === "ios";

  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Overview",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              render={(color) =>
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
                )
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="today"
        options={{
          title: "Today",
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              render={(color) =>
                isIOS ? (
                  <SymbolView name="calendar" tintColor={color} size={22} />
                ) : (
                  <MaterialCommunityIcons
                    name={focused ? "calendar-today" : "calendar-today-outline"}
                    size={22}
                    color={color}
                  />
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
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              render={(color) =>
                isIOS ? (
                  <SymbolView
                    name={focused ? "chart.pie.fill" : "chart.pie"}
                    tintColor={color}
                    size={22}
                  />
                ) : (
                  <MaterialCommunityIcons
                    name={focused ? "chart-pie" : "chart-pie-outline"}
                    size={22}
                    color={color}
                  />
                )
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: "Settings", href: null }} // no need for an icon
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return isIOS26 ? <NativeTabLayout /> : <ClassicTabLayout />;
}
