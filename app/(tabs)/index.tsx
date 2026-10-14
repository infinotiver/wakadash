import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import {
  useAllTimeSinceToday,
  useGoals,
  useSummaryRange,
  useTodaySummary,
  useWakaStats,
  useWeekSummaries,
} from "@/src/hooks/useWakaTimeQueries";
import { AppBar } from "@/src/components/AppBar";
import { DashboardWidget } from "@/src/components/DashboardWidget";
import { MiniBars } from "@/src/components/MiniBars";
import { ShareBar } from "@/src/components/ShareBar";
import { SetupScreen } from "@/src/components/SetupScreen";
import { SummaryHeatmap } from "@/src/components/SummaryHeatmap";
import { ct } from "@/src/constants/styles.common";
import {
  averageSummarySeconds,
  formatDuration,
  sumSummarySeconds,
  weeklyTotals,
} from "@/src/utils/dashboard";
import { GoalCard } from "@/src/components/GoalCard";
import { isGoalActive } from "@/src/utils/goals";
import { AiChangesChart } from "@/src/components/AiChangesChart";

const HEATMAP_DAYS = 3 * 30;

export default function OverviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isConfigured } = useWakaTime();
  const todayQ = useTodaySummary();
  const weekQ = useWeekSummaries();
  const allTimeQ = useAllTimeSinceToday();
  const statsQ = useWakaStats("all_time");
  const heatQ = useSummaryRange(HEATMAP_DAYS);

  const goalsQ = useGoals();
  const allGoals = goalsQ.data ?? [];
  const topGoals = allGoals.filter(isGoalActive).slice(0, 3);

  const refetch = useCallback(async () => {
    await Promise.allSettled([
      todayQ.refetch(),
      weekQ.refetch(),
      allTimeQ.refetch(),
      statsQ.refetch(),
      heatQ.refetch(),
      goalsQ.refetch(),
    ]);
  }, [todayQ, weekQ, allTimeQ, statsQ, heatQ, goalsQ]);

  if (!isConfigured) return <SetupScreen />;

  const week = weekQ.data ?? [];
  const allTime = allTimeQ.data;
  const stats = statsQ.data;
  const todaySeconds = todayQ.data?.grand_total.total_seconds ?? 0;
  const dailyAverage = allTime?.daily_average ?? averageSummarySeconds(week);
  const activeDays = week.filter(
    (day) => (day.grand_total?.total_seconds ?? 0) > 0,
  ).length;
  const dailyValues = week.map((day) => day.grand_total?.total_seconds ?? 0);
  const weeklyValues = weeklyTotals(heatQ.data ?? []);
  const aiAdditions = stats?.ai_additions ?? 0;
  const aiDeletions = stats?.ai_deletions ?? 0;
  const humanAdditions = stats?.human_additions ?? 0;
  const humanDeletions = stats?.human_deletions ?? 0;
  const aiTotal = aiAdditions + humanAdditions;
  const hasChangeData = aiTotal + aiDeletions + humanDeletions > 0;
  const aiPercent = aiTotal ? (aiAdditions / aiTotal) * 100 : 0;
  const compact = (n: number) =>
    new Intl.NumberFormat("en-US", { notation: "compact" }).format(n);
  const loading = todayQ.isLoading || allTimeQ.isLoading;
  const failed = todayQ.isError || allTimeQ.isError;
  const topProject = stats?.projects?.[0];
  const topLanguage = stats?.languages?.[0];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <AppBar
        title="WakaDash"
        variant="center"
        elevated={false}
        actions={[
          {
            icon: "cog-outline",
            label: "Settings",
            onPress: () => router.push("/settings"),
          },
        ]}
      />
      <ScrollView
        style={ct.styles.scroll}
        contentContainerStyle={{
          paddingHorizontal: ct.space.lg,
          paddingBottom: insets.bottom + 64 + ct.space.xl,
          gap: ct.space.sm,
        }}
        refreshControl={
          <RefreshControl
            refreshing={
              todayQ.isFetching || weekQ.isFetching || allTimeQ.isFetching
            }
            onRefresh={refetch}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: ct.size.loading }}
          />
        ) : failed ? (
          <Pressable
            onPress={refetch}
            style={[
              ct.styles.card,
              { backgroundColor: colors.errorContainer, alignItems: "center" },
            ]}
          >
            <Text style={[ct.text.body, { color: colors.onErrorContainer }]}>
              Failed to load - tap to retry
            </Text>
          </Pressable>
        ) : (
          <>
            <View style={{ flexDirection: "row", gap: ct.space.sm }}>
              <DashboardWidget
                icon="trending-up"
                title="All time"
                hero
                flex={1.8}
              >
                <Text
                  style={{
                    color: colors.onPrimaryContainer,
                    fontFamily: ct.fontFamily.semibold,
                    fontSize: ct.fontSize.hero,
                  }}
                  numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatDuration(allTime?.total_seconds ?? 0)}
                </Text>
                <Text
                  style={[
                    ct.text.caption,
                    { color: colors.onPrimaryContainer },
                  ]}
                >
                  {allTime?.range?.start_text
                    ? `Since ${allTime.range.start_text} · `
                    : ""}
                  {formatDuration(dailyAverage)} all-time avg
                </Text>
              </DashboardWidget>

              <DashboardWidget
                icon="clock"
                title="Today"
                half
                onPress={() => router.push("/today")}
              >
                <Text
                  style={{
                    color: colors.onSurface,
                    fontFamily: ct.fontFamily.semibold,
                    fontSize: ct.fontSize.hero,
                  }}
                  // numberOfLines={1}
                  adjustsFontSizeToFit
                >
                  {formatDuration(todaySeconds)}
                </Text>
              </DashboardWidget>
            </View>

            <View
              style={{
                flexDirection: "row",
                gap: ct.space.sm,
              }}
            >
              {stats?.streak !== undefined ? (
                <DashboardWidget icon="zap" title="Streak" half>
                  <Text
                    style={{
                      color: colors.onSurface,
                      fontFamily: ct.fontFamily.semibold,
                      fontSize: ct.fontSize.display,
                    }}
                  >
                    {`${stats.streak} ${stats.streak === 1 ? "day" : "days"}`}
                  </Text>
                </DashboardWidget>
              ) : null}
              <DashboardWidget icon="calendar" title="Active days" half>
                <Text
                  style={{
                    color: colors.onSurface,
                    fontFamily: ct.fontFamily.semibold,
                    fontSize: ct.fontSize.display,
                  }}
                >
                  {activeDays}/7
                </Text>
                <Text
                  style={[ct.text.caption, { color: colors.onSurfaceVariant }]}
                >
                  Last 7 days
                </Text>
              </DashboardWidget>
            </View>

            <DashboardWidget icon="calendar" title="Activity">
              {heatQ.isError ? (
                <Text
                  style={[ct.text.body, { color: colors.onSurfaceVariant }]}
                >
                  Chart data unavailable
                </Text>
              ) : (
                <SummaryHeatmap days={heatQ.data ?? []} />
              )}
              <Text
                style={[ct.text.caption, { color: colors.onSurfaceVariant }]}
              >
                Last 3 Months
              </Text>
            </DashboardWidget>

            <View style={{ flexDirection: "row", gap: ct.space.sm }}>
              <DashboardWidget
                icon="activity"
                title="Daily average"
                variant="secondary"
                half
              >
                <Text
                  style={{
                    color: colors.onSurface,
                    fontFamily: ct.fontFamily.semibold,
                    fontSize: ct.fontSize.display,
                  }}
                >
                  {formatDuration(averageSummarySeconds(week))}
                </Text>
                <MiniBars values={dailyValues} />
              </DashboardWidget>
              <DashboardWidget
                icon="bar-chart-2"
                title="This week"
                half
                variant="tertiary"
              >
                <Text
                  style={{
                    color: colors.onSurface,
                    fontFamily: ct.fontFamily.semibold,
                    fontSize: ct.fontSize.display,
                  }}
                >
                  {formatDuration(sumSummarySeconds(week))}
                </Text>
                <MiniBars values={weeklyValues} />
              </DashboardWidget>
            </View>

            {topProject || topLanguage ? (
              <View style={{ flexDirection: "row", gap: ct.space.sm }}>
                {topProject ? (
                  <DashboardWidget
                    icon="folder"
                    title="Top project"
                    half
                    onPress={() =>
                      router.push({
                        pathname: "/breakdown",
                        params: { category: "projects" },
                      })
                    }
                  >
                    <Text
                      style={[
                        ct.text.sectionTitle,
                        { color: colors.onSurface },
                      ]}
                      numberOfLines={1}
                    >
                      {topProject.name}
                    </Text>
                    <Text
                      style={[
                        ct.text.caption,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {topProject.text ??
                        formatDuration(topProject.total_seconds)}{" "}
                      · {topProject.percent.toFixed(0)}%
                    </Text>
                    <ShareBar
                      percent={topProject.percent}
                      color={colors.accent.violet.color}
                    />
                  </DashboardWidget>
                ) : null}
                {topLanguage ? (
                  <DashboardWidget
                    icon="code"
                    title="Top language"
                    half
                    onPress={() =>
                      router.push({
                        pathname: "/breakdown",
                        params: { category: "languages" },
                      })
                    }
                  >
                    <Text
                      style={[
                        ct.text.sectionTitle,
                        { color: colors.onSurface },
                      ]}
                      numberOfLines={1}
                    >
                      {topLanguage.name}
                    </Text>
                    <Text
                      style={[
                        ct.text.caption,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {topLanguage.text ??
                        formatDuration(topLanguage.total_seconds)}{" "}
                      · {topLanguage.percent.toFixed(0)}%
                    </Text>
                    <ShareBar
                      percent={topLanguage.percent}
                      color={colors.accent.teal.color}
                    />
                  </DashboardWidget>
                ) : null}
              </View>
            ) : null}
            {allGoals.length > 0 && (
              <DashboardWidget
                icon="award"
                title="Goals"
                onPress={() => router.push("/goals")}
              >
                <View style={ct.styles.rowBetween}></View>
                <View style={{ gap: ct.space.sm }}>
                  {topGoals.length === 0 ? (
                    <Text
                      style={[ct.text.body, { color: colors.onSurfaceVariant }]}
                    >
                      No active goals
                    </Text>
                  ) : (
                    topGoals.map((g) => (
                      <GoalCard
                        key={g.id}
                        goal={g}
                        onPress={() =>
                          router.push({
                            pathname: "/goals/[id]",
                            params: { id: g.id },
                          })
                        }
                      />
                    ))
                  )}
                </View>
              </DashboardWidget>
            )}
            {aiTotal > 0 ? (
              <DashboardWidget
                icon="cpu"
                title="AI vs Human"
                onPress={() =>
                  router.push({
                    pathname: "/breakdown",
                    params: { category: "categories" },
                  })
                }
              >
                <AiChangesChart
                  aiAdditions={aiAdditions}
                  aiDeletions={aiDeletions}
                  humanAdditions={humanAdditions}
                  humanDeletions={humanDeletions}
                />
                <Text
                  style={[ct.text.caption, { color: colors.onSurfaceVariant }]}
                >
                  all time
                </Text>
              </DashboardWidget>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
