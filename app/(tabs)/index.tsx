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
import { Feather } from "@expo/vector-icons";
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
  const chartColors = [
    colors.accent.violet.color,
    colors.accent.amber.color,
    colors.accent.teal.color,
    colors.accent.coral.color,
    colors.accent.green.color,
  ];

  const weekAvg = averageSummarySeconds(week);
  const loading = todayQ.isLoading || weekQ.isLoading || allTimeQ.isLoading;

  return (
    <View style={[ct.styles.flex, { backgroundColor: colors.background }]}>
      <AppBar
        title="WakaDash"
        variant="center"
        leadingIcon="menu"
        leadingLabel="Open breakdown"
        onLeadingPress={() => router.push("/(tabs)/breakdown")}
        actions={[
          {
            icon: "settings",
            label: "Open settings",
            onPress: () => router.push("/(tabs)/settings"),
          },
        ]}
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
              {
                backgroundColor: colors.errorContainer,
                borderColor: colors.error,
              },
            ]}
          >
            <Text
              style={[styles.errorText, { color: colors.onErrorContainer }]}
            >
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
            <View style={[styles.row, { gap: ct.padding.md }]}>
              <StatCard
                value={formatDuration(weekAvg)}
                subtitle="weekly avg"
                accent="violet"
                icon={(tint) => <Feather name="clock" size={20} color={tint} />}
              />
              <StatCard
                subtitle={today?.projects?.[0]?.name ?? "-"}
                value={today?.projects?.[0]?.text}
                accent="green"
                icon={(tint) => (
                  <Feather name="folder" size={20} color={tint} />
                )}
              />
            </View>
            <DashboardBreakdownSection
              title="Languages"
              chartColors={chartColors}
              items={(today?.languages ?? []).slice(0, 4).map((item) => ({
                name: item.name,
                percent: item.percent,
                trailingText: item.text,
              }))}
            />
            <DashboardBreakdownSection
              title="Editors"
              chartColors={chartColors}
              items={(today?.editors ?? []).slice(0, 4).map((item) => ({
                name: item.name,
                percent: item.percent,
                trailingText: item.text,
              }))}
            />
            <DashboardBreakdownSection
              title="Projects"
              chartColors={chartColors}
              items={(today?.projects ?? []).slice(0, 4).map((item) => ({
                name: item.name,
                percent: item.percent,
                trailingText: item.text,
              }))}
            />
            <DashboardBreakdownSection
              title="Operating Systems"
              chartColors={chartColors}
              items={(today?.operating_systems ?? [])
                .slice(0, 4)
                .map((item) => ({
                  name: item.name,
                  percent: item.percent,
                  trailingText: item.text,
                }))}
            />
            <View
              style={[
                styles.section,
                {
                  backgroundColor: colors.surfaceContainerHigh,
                  borderColor: colors.outlineVariant,
                },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>
                Last 7 Days
              </Text>
              {week.length ? (
                <WeeklyChart days={week} />
              ) : (
                <Text
                  style={[styles.empty, { color: colors.onSurfaceVariant }]}
                >
                  No data available
                </Text>
              )}
            </View>
            {allTime ? (
              <View
                style={[
                  styles.section,
                  {
                    backgroundColor: colors.surfaceContainerHigh,
                    borderColor: colors.outlineVariant,
                  },
                ]}
              >
                <Text
                  style={[styles.sectionTitle, { color: colors.onSurface }]}
                >
                  All Time Stats
                </Text>
                <View style={{ gap: ct.sm }}>
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.heroSub,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Total Time
                    </Text>
                    <Text style={[styles.heroSub, { color: colors.onSurface }]}>
                      {allTime.text ?? "-"}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.heroSub,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Daily Avg
                    </Text>
                    <Text style={[styles.heroSub, { color: colors.onSurface }]}>
                      {formatDuration(allTime.daily_average)}
                    </Text>
                  </View>
                  <View style={styles.row}>
                    <Text
                      style={[
                        styles.heroSub,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      Data Since
                    </Text>
                    <Text style={[styles.heroSub, { color: colors.onSurface }]}>
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
