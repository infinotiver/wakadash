import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Keyboard,
  Platform,
  Pressable,
  Text,
  View,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { SymbolView } from "expo-symbols";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";
type SymbolName = React.ComponentProps<typeof SymbolView>["name"];
type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

const isIOS = Platform.OS === "ios";
const isIOS26 = isIOS && parseInt(Platform.Version.toString(), 10) >= 26;

const BAR_HEIGHT = 64;
const MAX_ITEM_WIDTH = 84; // shrinks on narrow screens, see FloatingTabBar
const ITEM_HEIGHT = 56;
const ICON_SIZE = 20;

// Pages hosted under the More tab; they keep More highlighted.
const MORE_ROUTES = [
  "settings",
  "languages",
  "editors",
  "projects",
  "operating-systems",
];

// [inactive, active] icon pairs
const TABS: {
  name: string;
  label: string;
  sf: [SymbolName, SymbolName];
  md: [IconName, IconName];
  nativeMd: string;
  also?: string[];
}[] = [
  {
    name: "index",
    label: "Overview",
    sf: ["chart.bar", "chart.bar.fill"],
    md: ["view-dashboard-outline", "view-dashboard"],
    nativeMd: "dashboard",
    also: ["goals"],
  },
  {
    name: "today",
    label: "Today",
    sf: ["calendar", "calendar"],
    md: ["calendar-today-outline", "calendar-today"],
    nativeMd: "today",
  },
  {
    name: "breakdown",
    label: "Breakdown",
    sf: ["chart.pie", "chart.pie.fill"],
    md: ["chart-pie-outline", "chart-pie"],
    nativeMd: "pie_chart",
  },
  {
    name: "more",
    label: "More",
    sf: ["ellipsis.circle", "ellipsis.circle.fill"],
    md: ["dots-horizontal-circle-outline", "dots-horizontal-circle"],
    nativeMd: "more_horiz",
    also: MORE_ROUTES,
  },
];

function withAlpha(hex: string, opacity: number) {
  return (
    hex +
    Math.round(opacity * 255)
      .toString(16)
      .padStart(2, "0")
  );
}

function TabItem({
  tab,
  focused,
  width,
  onPress,
}: {
  tab: (typeof TABS)[number];
  focused: boolean;
  width: number;
  onPress: () => void;
}) {
  const colors = useColors();
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: focused ? 1 : 0,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [focused, progress]);

  const color = focused ? colors.onSecondaryContainer : colors.onSurface;
  const i = focused ? 1 : 0;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={tab.label}
      accessibilityState={{ selected: focused }}
      style={{
        width,
        height: ITEM_HEIGHT,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={{
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: ct.radius.full,
          backgroundColor:
            colors.secondaryContainer ?? colors.surfaceContainerHighest,
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
      {isIOS ? (
        <SymbolView name={tab.sf[i]} tintColor={color} size={ICON_SIZE} />
      ) : (
        <MaterialCommunityIcons
          name={tab.md[i]}
          size={ICON_SIZE}
          color={color}
        />
      )}
      <Text
        numberOfLines={1}
        style={{
          fontSize: ct.fontSize.xs,
          fontFamily: focused ? ct.fontFamily.semibold : ct.fontFamily.medium,
          color,
        }}
      >
        {tab.label}
      </Text>
    </Pressable>
  );
}

function FloatingTabBar({ state, navigation }: any) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const [keyboardVisible, setKeyboardVisible] = useState(false);

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

  // Items shrink on narrow screens so the pill keeps a screen-edge margin:
  // screen - side margins - pill padding - 1px border on each side.
  const itemWidth = Math.min(
    MAX_ITEM_WIDTH,
    (screenWidth - 2 * ct.space.lg - 2 * ct.space.xs - 2) / TABS.length,
  );

  const active: string = state.routes[state.index]?.name;
  const bottomOffset = Math.max(insets.bottom, 16);
  const scrimHeight = BAR_HEIGHT + bottomOffset + 32;

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: scrimHeight,
        justifyContent: "flex-end",
        alignItems: "center",
        paddingBottom: bottomOffset,
      }}
    >
      <View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFill,
          {
            experimental_backgroundImage: `linear-gradient(to bottom, ${withAlpha(
              colors.background,
              0,
            )} 0%, ${withAlpha(colors.background, 0.7)} 50%, ${withAlpha(
              colors.background,
              0.95,
            )} 100%)`,
          } as any,
        ]}
      />
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          height: BAR_HEIGHT,
          paddingHorizontal: ct.space.xs,
          borderRadius: BAR_HEIGHT / 2,
          backgroundColor: colors.surfaceContainerHigh,
          // faint edge border
          borderWidth: 1,
          borderColor: withAlpha(colors.outlineVariant, 0.4),
          // stronger iOS shadow
          shadowColor: "#000000",
          shadowOpacity: isIOS ? 0.25 : 0.4,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 6 },
          // Elevated rounded shadow on Android
          elevation: 12,
        }}
      >
        {TABS.map((tab) => (
          <TabItem
            key={tab.name}
            tab={tab}
            width={itemWidth}
            focused={active === tab.name || !!tab.also?.includes(active)}
            onPress={() => active !== tab.name && navigation.navigate(tab.name)}
          />
        ))}
      </View>
    </View>
  );
}

function NativeTabLayout() {
  const { NativeTabs, Icon } = require("expo-router/unstable-native-tabs");
  const colors = useColors();

  return (
    <NativeTabs tintColor={colors.onSurface}>
      {TABS.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          <Icon
            sf={{ default: tab.sf[0], selected: tab.sf[1] }}
            md={tab.nativeMd}
          />
        </NativeTabs.Trigger>
      ))}
      {MORE_ROUTES.map((name) => (
        <NativeTabs.Trigger key={name} name={name} hidden />
      ))}
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  return (
    <Tabs
      tabBar={(props) => <FloatingTabBar {...props} />}
      screenOptions={{ headerShown: false }}
      backBehavior="history"
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.label }}
        />
      ))}
      {MORE_ROUTES.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ href: null }} />
      ))}
    </Tabs>
  );
}

export default function TabLayout() {
  return isIOS26 ? <NativeTabLayout /> : <ClassicTabLayout />;
}
