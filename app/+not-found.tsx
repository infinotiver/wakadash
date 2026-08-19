import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";

export default function NotFoundScreen() {
  const colors = useColors();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={[ct.styles.card, { backgroundColor: colors.background }]}>
        <Text style={[ct.styles.overview.title, { color: colors.onSurface }]}>
          This screen doesn&apos;t exist.
        </Text>

        <Link href="/" style={ct.text.body}>
          <Text style={[ct.text.body, { color: colors.primary }]}>
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}
