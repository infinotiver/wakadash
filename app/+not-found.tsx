import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

import { useColors } from "@/src/hooks/useColors";
import { commonStyles, t } from "@/src/constants/styles.common";
import { overviewScreenStyles} from "@/src/constants/styles.screens";

export default function NotFoundScreen() {
  const colors = useColors();

  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View style={[commonStyles.card, { backgroundColor: colors.background }]}>
        <Text
          style={[overviewScreenStyles.title, { color: colors.foreground }]}
        >
          This screen doesn&apos;t exist.
        </Text>

        <Link href="/" style={t.body}>
          <Text
            style={[t.body, { color: colors.primary }]}
          >
            Go to home screen!
          </Text>
        </Link>
      </View>
    </>
  );
}
