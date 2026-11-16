import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/src/hooks/useColors";
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
import { SummaryHeatmap } from "@/src/components/charts/SummaryHeatmap";
import { WeeklyChart } from "@/src/components/charts/WeeklyChart";
import { ct } from "@/src/constants/styles.common";
import { formatWakaTimeError } from "@/src/api/wakatime";
import {
  averageSummarySeconds,
  formatDateRange,
  formatDuration,
  formatPercentage,
  formatShortDate,
  sumSummarySeconds,
} from "@/src/utils/dashboard";
import { GoalCard } from "@/src/components/goals/GoalCard";
import { isGoalActive } from "@/src/utils/goals";
import { AiChangesChart } from "@/src/components/charts/AiChangesChart";

const HEATMAP_DAYS = 3 * 30;

export default function OverviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedWeekDate, setSelectedWeekDate] = React.useState<
    string | undefined
  >();
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

  const week = weekQ.data ?? [];
  const allTime = allTimeQ.data;
  const stats = statsQ.data;
  const todaySeconds = todayQ.data?.grand_total.total_seconds ?? 0;
  const dailyAverage = allTime?.daily_average ?? averageSummarySeconds(week);
  const weeklyAverage = averageSummarySeconds(week);
  const dailyAverageProgress =
    weeklyAverage > 0 ? (todaySeconds / weeklyAverage) * 100 : 0;
  const isOverDailyAverage = dailyAverageProgress > 100;
  const todayTextColor = isOverDailyAverage
    ? colors.onErrorContainer
    : colors.onSurface;
  const latestWeekDay = week[week.length - 1];
  const selectedWeekDay =
    week.find((day) => day.range?.date === selectedWeekDate) ?? latestWeekDay;
  const chartSelectedDate = selectedWeekDay?.range?.date;
  const selectedWeekSeconds = selectedWeekDay?.grand_total?.total_seconds ?? 0;
  const selectedWeekTime = formatDuration(selectedWeekSeconds);
  const aiAdditions = stats?.ai_additions ?? 0;
  const aiDeletions = stats?.ai_deletions ?? 0;
  const humanAdditions = stats?.human_additions ?? 0;
  const humanDeletions = stats?.human_deletions ?? 0;
  const aiTotal = aiAdditions + humanAdditions;
  const loading = todayQ.isLoading || allTimeQ.isLoading;
  const failed = todayQ.isError || allTimeQ.isError;
  const failure = todayQ.error ?? allTimeQ.error;
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
              {formatWakaTimeError(failure)} - tap to retry
            </Text>
          </Pressable>
        ) : (
          <>
            <View style={{ flexDirection: "column", gap: ct.space.sm }}>
              <Pressable
                onPress={() => router.push("/today")}
                accessibilityRole="button"
                accessibilityLabel="Today"
                style={({ pressed }) => ({
                  position: "relative",
                  overflow: "hidden",
                  paddingHorizontal: ct.space.xl,
                  paddingVertical: ct.space.md,
                  borderRadius: ct.radius.full,
                  backgroundColor: isOverDailyAverage
                    ? colors.errorContainer
                    : colors.surfaceContainerHigh,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <View
                  pointerEvents="none"
                  style={{
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    width: `${Math.min(Math.max(isOverDailyAverage ? 100 : dailyAverageProgress, 0), 100)}%`,
                    backgroundColor: isOverDailyAverage
                      ? colors.errorContainer
                      : colors.accent.teal.colorContainer,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: ct.space.sm,
                  }}
                >
                  <View style={{ gap: 0 }}>
                    <Text
                      style={[ct.text.buttonText, { color: todayTextColor }]}
                    >
                      Today
                    </Text>
                    <Text
                      style={{
                        color: todayTextColor,
                        fontFamily: ct.fontFamily.semibold,
                        fontSize: ct.fontSize.lg,
                        lineHeight: ct.fontSize["2xl"],
                      }}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      {formatDuration(todaySeconds)}
                    </Text>
                  </View>
                  <Text
                    style={[ct.text.caption, { color: todayTextColor }]}
                    numberOfLines={1}
                  >
                    Weekly avg · {formatDuration(weeklyAverage)}
                  </Text>
                </View>
              </Pressable>
              <DashboardWidget title="All time" hero>
                <View style={{ gap: ct.space.xs }}>
                  <Text
                    style={{
                      color: colors.onPrimaryContainer,
                      fontFamily: ct.fontFamily.semibold,
                      fontSize: ct.fontSize.xl,
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
                    numberOfLines={1}
                  >
                    {allTime?.range?.start_text
                      ? `Since ${allTime.range.start_text} · `
                      : ""}
                    {formatDuration(dailyAverage)} all-time avg
                  </Text>
                </View>
              </DashboardWidget>
            </View>

            {allGoals.length > 0 && (
              <DashboardWidget
                title="Goals"
                onPress={() => router.push("/goals")}
              >
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

            <DashboardWidget title="Activity">
              {heatQ.isError ? (
                <Text
                  style={[ct.text.body, { color: colors.onSurfaceVariant }]}
                >
                  Chart data unavailable
                </Text>
              ) : (
                <SummaryHeatmap days={heatQ.data ?? []} />
              )}
            </DashboardWidget>

            <DashboardWidget title="Past 7 Days">
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: ct.space.sm,
                }}
              >
                <View style={{ flex: 0, gap: ct.space.xs }}>
                  <Text
                    style={{
                      color: colors.onSurface,
                      fontFamily: ct.fontFamily.semibold,
                      fontSize: ct.fontSize["3xl"],
                    }}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {formatDuration(sumSummarySeconds(week))}
                  </Text>
                  <Text
                    style={[
                      ct.text.caption,
                      { color: colors.onSurfaceVariant },
                    ]}
                    numberOfLines={1}
                  >
                    {selectedWeekDay?.range?.date
                      ? formatShortDate(selectedWeekDay.range.date)
                      : "Selected day"}
                    {" · "}
                    {selectedWeekTime}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <WeeklyChart
                    days={week}
                    compact
                    selectedDate={chartSelectedDate}
                    onSelectDate={setSelectedWeekDate}
                  />
                </View>
              </View>
            </DashboardWidget>

            {topProject || topLanguage ? (
              <View style={{ flexDirection: "row", gap: ct.space.sm }}>
                {topProject ? (
                  <DashboardWidget
                    title="Top project"
                    half
                    onPress={() =>
                      router.push({
                        pathname: "/breakdown",
                        params: { category: "projects" },
                      })
                    }
                    backgroundFill={{
                      percent: topProject.percent,
                      color: colors.accent.violet.colorContainer,
                      backgroundColor: colors.surfaceContainerHigh,
                      foregroundColor: colors.onSurface,
                    }}
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
                      {formatDuration(topProject.total_seconds)} ·{" "}
                      {formatPercentage(topProject.percent)}
                    </Text>
                  </DashboardWidget>
                ) : null}
                {topLanguage ? (
                  <DashboardWidget
                    title="Top language"
                    half
                    onPress={() =>
                      router.push({
                        pathname: "/breakdown",
                        params: { category: "languages" },
                      })
                    }
                    backgroundFill={{
                      percent: topLanguage.percent,
                      color: colors.accent.teal.colorContainer,
                      backgroundColor: colors.surfaceContainerHigh,
                      foregroundColor: colors.onSurface,
                    }}
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
                      {formatDuration(topLanguage.total_seconds)} ·{" "}
                      {formatPercentage(topLanguage.percent)}
                    </Text>
                  </DashboardWidget>
                ) : null}
              </View>
            ) : null}
            {aiTotal > 0 ? (
              <DashboardWidget
                title="All-time AI vs human"
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
              </DashboardWidget>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
