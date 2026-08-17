import React, { useCallback } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { AppBar } from "@/src/components/AppBar";
import { DashboardBreakdownSection } from "@/src/components/DashboardBreakdownSection";
import { StatCard } from "@/src/components/StatCard";
import { WeeklyChart } from "@/src/components/WeeklyChart";
import { SetupScreen } from "@/src/components/SetupScreen";
import { CategoryPieChart } from "@/src/components/CategoryPieChart";
import { ct } from "@/src/constants/styles.common";
import { averageSummarySeconds, formatDuration } from "@/src/utils/dashboard";
import {
  useAllTimeSinceToday,
  useTodaySummary,
  useWeekSummaries,
} from "@/src/hooks/useWakaTimeQueries";

const styles = ct.styles.overview;

export default function OverviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isConfigured } = useWakaTime();
  const todayQ = useTodaySummary();
  const weekQ = useWeekSummaries();
  const allTimeQ = useAllTimeSinceToday();

  const refetch = useCallback(async () => {
    await Promise.all([todayQ.refetch(), weekQ.refetch(), allTimeQ.refetch()]);
  }, [todayQ, weekQ, allTimeQ]);

  if (!isConfigured) return <SetupScreen />;

  const today = todayQ.data;
  const week = weekQ.data ?? [];
  const allTime = allTimeQ.data;
  const chartColors = colors.chartColors as string[];
  const weekAvg = averageSummarySeconds(week);
  const loading = todayQ.isLoading || weekQ.isLoading || allTimeQ.isLoading;

  return (
    <View style={[ct.styles.flex, { backgroundColor: colors.background }]}>
      <AppBar
        title="WakaDash"
        leftIcon="menu"
        leftLabel="Open breakdown"
        onLeftPress={() => router.push("/(tabs)/breakdown")}
        rightIcon="settings"
        rightLabel="Open settings"
        onRightPress={() => router.push("/(tabs)/settings")}
      />
      <ScrollView
        style={ct.styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: insets.bottom + ct.lg },
        ]}
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
            style={{ marginTop: ct.layout.loading }}
          />
        ) : todayQ.isError || weekQ.isError || allTimeQ.isError ? (
          <View
            style={[
              styles.errorCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              Failed to load
            </Text>
          </View>
        ) : (
          <>
            {(today?.categories?.length ?? 0) > 0 ? (
              <CategoryPieChart
                items={(today?.categories ?? []).slice(0, 5).map((item) => ({
                  name: item.name,
                  percent: item.percent,
                  total_seconds: item.total_seconds,
                  text: item.text,
                }))}
              />
            ) : null}
            <View style={[styles.row, {gap:ct.padding.md}]}>
              <StatCard
                value={formatDuration(weekAvg)}
                subtitle="weekly avg"
                icon={<Feather name="clock" size={20} color={colors.primary} />}
              />
              <StatCard
                label="Top project"
                value={today?.projects?.[0]?.name ?? "-"}
                subtitle={today?.projects?.[0]?.text}
                icon={
                  <Feather name="folder" size={20} color={colors.primary} />
                }
              />
            </View>
            <DashboardBreakdownSection
              title="Languages"
              chartColors={chartColors}
              items={
                (today?.languages ?? [])
                  .slice(0, 4)
                  .map((item) => ({ name: item.name, percent: item.percent }))
              }
            />
            <DashboardBreakdownSection
              title="Editors"
              chartColors={chartColors}
              items={
                (today?.editors ?? [])
                  .slice(0, 4)
                  .map((item) => ({ name: item.name, percent: item.percent }))
              }
            />
            <DashboardBreakdownSection
              title="Projects"
              chartColors={chartColors}
              items={
                (today?.projects ?? [])
                  .slice(0, 4)
                  .map((item) => ({ name: item.name, percent: item.percent }))
              }
            />
            <DashboardBreakdownSection
              title="Operating Systems"
              chartColors={chartColors}
              items={
                (today?.operating_systems ?? [])
                  .slice(0, 4)
                  .map((item) => ({ name: item.name, percent: item.percent }))
              }
            />
            {/*
            {renderSection(
              "Languages",
              (today?.languages ?? [])
                .slice(0, 4)
                .map((item) => ({ name: item.name, percent: item.percent })),
            )}
            {renderSection(
              "Editors",
              (today?.editors ?? [])
                .slice(0, 4)
                .map((item) => ({ name: item.name, percent: item.percent })),
            )}
            {renderSection(
              "Projects",
              (today?.projects ?? [])
                .slice(0, 4)
                .map((item) => ({ name: item.name, percent: item.percent })),
            )}
            {renderSection(
              "Operating Systems",
              (today?.operating_systems ?? [])
                .slice(0, 4)
                .map((item) => ({ name: item.name, percent: item.percent })),
            )} */}
            <View
              style={[
                styles.section,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Last 7 Days
              </Text>
              {week.length ? (
                <WeeklyChart days={week} />
              ) : (
                <Text style={[styles.empty, { color: colors.mutedForeground }]}>
                  No data available
                </Text>
              )}
            </View>
            {allTime ? (
              <View
                style={[
                  styles.section,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                <Text
                  style={[styles.sectionTitle, { color: colors.foreground }]}
                >
                  All Time Stats
                </Text>
                <View style={{ gap: ct.sm }}>
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.heroSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Total Time
                    </Text>
                    <Text
                      style={[styles.heroSub, { color: colors.foreground }]}
                    >
                      {allTime.text ?? "-"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.heroSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Daily Avg
                    </Text>
                    <Text
                      style={[styles.heroSub, { color: colors.foreground }]}
                    >
                      {formatDuration(allTime.daily_average)}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.heroSub,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Data Since
                    </Text>
                    <Text
                      style={[styles.heroSub, { color: colors.foreground }]}
                    >
                      {allTime.range?.start_text}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}
