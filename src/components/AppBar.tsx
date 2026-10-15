import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface AppBarAction {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

interface AppBarProps {
  title: string;
  variant?: "small" | "center";
  elevated?: boolean;
  leadingIcon?: IconName;
  leadingLabel?: string;
  onLeadingPress?: () => void;
  actions?: AppBarAction[];
  onTitlePress?: () => void;
  titleHint?: string;
}

const BAR_HEIGHT = 64;
const BUTTON_SIZE = 48;
const ICON_SIZE = 24;
const EDGE_PADDING = ct.space.xs;
const TITLE_INSET = ct.space.sm;
const PRESSED_OPACITY = 0.1;
const DISABLED_OPACITY = 0.38;

function IconButton({
  icon,
  label,
  onPress,
  disabled,
  color,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  disabled?: boolean;
  color: string;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.iconButton, disabled && { opacity: DISABLED_OPACITY }]}
    >
      {({ pressed }) => (
        <>
          {pressed ? (
            <View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius: BUTTON_SIZE / 2,
                  backgroundColor: colors.onSurfaceVariant,
                  opacity: PRESSED_OPACITY,
                },
              ]}
            />
          ) : null}
          <MaterialCommunityIcons name={icon} size={ICON_SIZE} color={color} />
        </>
      )}
    </Pressable>
  );
}

export function AppBar({
  title,
  variant = "small",
  elevated = false,
  leadingIcon = "arrow-left",
  leadingLabel = "Go back",
  onLeadingPress,
  actions = [],
  onTitlePress,
  titleHint,
}: AppBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const isCenter = variant === "center";

  // Equal-width sides keep a centered title truly centered.
  const sideWidth = BUTTON_SIZE * Math.max(1, actions.length);

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: elevated ? colors.surfaceContainer : colors.surface,
        paddingTop: Platform.OS === "web" ? ct.space.sm : insets.top,
      }}
    >
      <View style={styles.row}>
        {onLeadingPress ? (
          <View style={isCenter ? { width: sideWidth } : undefined}>
            <IconButton
              icon={leadingIcon}
              label={leadingLabel}
              onPress={onLeadingPress}
              color={colors.onSurface}
            />
          </View>
        ) : isCenter ? (
          <View style={{ width: sideWidth }} />
        ) : null}

        <Pressable
          disabled={!onTitlePress}
          onPress={onTitlePress}
          accessibilityRole={onTitlePress ? "button" : undefined}
          accessibilityLabel={title}
          accessibilityHint={onTitlePress ? titleHint : undefined}
          style={({ pressed }) => [
            styles.titleTouch,
            {
              paddingLeft: !isCenter && !onLeadingPress ? TITLE_INSET : 0,
              opacity: onTitlePress && pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text
            numberOfLines={1}
            style={[
              styles.title,
              {
                color: colors.onSurface,
                fontFamily: ct.fontFamily.medium ?? ct.fontFamily.regular,
                textAlign: isCenter ? "center" : "left",
              },
            ]}
          >
            {title}
          </Text>
        </Pressable>

        {actions.length > 0 ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              width: isCenter ? sideWidth : undefined,
            }}
          >
            {actions.map((action) => (
              <IconButton
                key={action.label}
                icon={action.icon}
                label={action.label}
                onPress={action.onPress}
                disabled={action.disabled}
                color={colors.onSurfaceVariant}
              />
            ))}
          </View>
        ) : isCenter ? (
          <View style={{ width: sideWidth }} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: BAR_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: EDGE_PADDING,
  },
  iconButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  titleTouch: {
    flex: 1,
    height: "100%",
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    lineHeight: 28,
  },
});
