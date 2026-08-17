import { Feather } from "@expo/vector-icons";
import { Platform, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

interface AppBarProps {
  title: string;
  leftIcon: keyof typeof Feather.glyphMap;
  leftLabel: string;
  onLeftPress: () => void;
  rightIcon?: keyof typeof Feather.glyphMap;
  rightLabel?: string;
  onRightPress?: () => void;
}

export function AppBar({
  title,
  leftIcon,
  leftLabel,
  onLeftPress,
  rightIcon,
  rightLabel,
  onRightPress,
}: AppBarProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        ct.styles.appBar,
        { paddingTop: Platform.OS === "web" ? ct.sm : insets.top },
      ]}
    >
      <Pressable
        accessibilityLabel={leftLabel}
        accessibilityRole="button"
        onPress={onLeftPress}
        style={ct.styles.appBarIcon}
      >
        <Feather name={leftIcon} size={22} color={colors.foreground} />
      </Pressable>
      <Text
        style={[
          ct.styles.appBarTitle,
          { color: colors.foreground, backgroundColor: colors.accent },
        ]}
      >
        {title}
      </Text>
      {rightIcon && onRightPress ? (
        <Pressable
          accessibilityLabel={rightLabel}
          accessibilityRole="button"
          onPress={onRightPress}
          style={ct.styles.appBarIcon}
        >
          <Feather name={rightIcon} size={21} color={colors.foreground} />
        </Pressable>
      ) : (
        <View style={ct.styles.appBarIcon} />
      )}
    </View>
  );
}
