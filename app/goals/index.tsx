import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBar } from "@/src/components/AppBar";
import { GoalCard } from "@/src/components/GoalCard";
import { SetupScreen } from "@/src/components/SetupScreen";
import { ct } from "@/src/constants/styles.common";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useGoals } from "@/src/hooks/useWakaTimeQueries";
import { isGoalActive } from "@/src/utils/goals";

export default function GoalsScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isConfigured, baseUrl } = useWakaTime();
  const goalsQ = useGoals();

  if (!isConfigured) return <SetupScreen />;

  const goals = goalsQ.data ?? [];
  const active = goals.filter(isGoalActive);
  const paused = goals.filter((g) => !isGoalActive(g));

  const open = (id: string) =>
    router.push({ pathname: "/goals/[id]", params: { id } });

  const renderGroup = (title: string, list: typeof goals) =>
    list.length === 0 ? null : (
      <>
        <Text
          style={[
            ct.text.label,
            { color: c.onSurfaceVariant, marginTop: ct.space.xs },
          ]}
        >
          {title}
        </Text>
        {list.map((g) => (
          <View
            key={g.id}
            style={[
              ct.styles.card,
              { backgroundColor: c.surfaceContainerHigh },
            ]}
          >
            <GoalCard goal={g} onPress={() => open(g.id)} />
          </View>
        ))}
      </>
    );

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppBar
        title="Goals"
        variant="small"
        elevated={false}
        leadingIcon="arrow-left"
        leadingLabel="Go back"
        onLeadingPress={() => router.back()}
        actions={[]}
      />
      <ScrollView
        style={ct.styles.scroll}
        contentContainerStyle={[
          ct.styles.breakdown.content,
          { paddingBottom: insets.bottom + ct.space.lg },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={goalsQ.isFetching}
            onRefresh={() => goalsQ.refetch()}
            tintColor={c.primary}
          />
        }
      >
        {goalsQ.isLoading ? (
          <ActivityIndicator
            color={c.primary}
            style={{ marginTop: ct.size.loading }}
          />
        ) : goalsQ.isError ? (
          <Text style={[ct.text.body, { color: c.error }]}>
            {goalsQ.error instanceof Error
              ? goalsQ.error.message
              : "Failed to load"}
          </Text>
        ) : goals.length === 0 ? (
          <Text style={[ct.text.body, { color: c.onSurfaceVariant }]}>
            No goals yet. Create one on wakatime.com and it will show up here.
          </Text>
        ) : (
          <>
            {renderGroup("Active", active)}
            {renderGroup("Paused", paused)}
          </>
        )}
      </ScrollView>
    </View>
  );
}
