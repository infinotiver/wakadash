import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

import { useColors } from "@/src/hooks/useColors";
import { styles as sharedStyles } from "@/src/constants/style";
import { styles } from "@/src/constants/not-found.style";

export default function NotFoundScreen() {
  const colors = useColors();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View
        style={[sharedStyles.container, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          This screen doesn&apos;t exist.
        </Text>

        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: colors.primary }]}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}
