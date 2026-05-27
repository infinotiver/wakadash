import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { HorizontalBreakdownChart } from "@/src/components/HorizontalBreakdownChart";
import { StatCard } from "@/src/components/StatCard";
import { WeeklyChart } from "@/src/components/WeeklyChart";
import { SetupScreen } from "@/src/components/SetupScreen";
import { commonStyles } from "@/src/constants/styles.common";
import { overviewScreenStyles as styles } from "@/src/constants/styles.screens";
import {
  useAllTimeSinceToday,
  useTodaySummary,
  useWeekSummaries,
} from "@/src/hooks/useWakaTimeQueries";
import { CategoryPieChart } from "@/src/components/CategoryPieChart";
export default function OverviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isConfigured } = useWakaTime();
  const todayQ = useTodaySummary();
  const weekQ = useWeekSummaries();
  const allTimeSinceTodayQ = useAllTimeSinceToday();

  const refetch = useCallback(async () => {
    await Promise.all([todayQ.refetch(), weekQ.refetch()]);
  }, [todayQ, weekQ]);

  if (!isConfigured) return <SetupScreen />;

  const today = todayQ.data;
  const allTimeSinceToday = allTimeSinceTodayQ.data;
  const week = weekQ.data ?? [];
  const topLang = today?.languages?.[0];
  const topProject = today?.projects?.[0];

  const weekTotal = week.reduce(
    (sum, day) => sum + (day.grand_total?.total_seconds ?? 0),
    0,
  );
  const weekAvg = week.length ? weekTotal / week.length : 0;
  const chartColors = colors.chartColors as string[];
  const loading = todayQ.isLoading && weekQ.isLoading;

  function fmtSeconds(seconds: number) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  const renderSection = (
    title: string,
    items: Array<{ name: string; percent: number }>,
  ) => {
    if (items.length === 0) return null;

    return (
      <View
        style={[
          styles.section,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
          {title}
        </Text>

        <View style={{ marginTop: 8 }}>
          <HorizontalBreakdownChart
            items={items.map((item, index) => ({
              key: `${title}-${item.name}`,
              label: item.name,
              percent: item.percent,
              secondaryText: `${item.percent.toFixed(1)}%`,
              color: chartColors[index % chartColors.length] ?? "#8a79ab",
            }))}
            textColor={colors.foreground}
            mutedTextColor={colors.mutedForeground}
            trackColor={colors.secondary}
            separatorColor={colors.card}
          />
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={[commonStyles.scroll, { backgroundColor: colors.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 80,
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={todayQ.isFetching || weekQ.isFetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Overview
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : todayQ.isError ? (
        <View
          style={[
            styles.errorCard,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={[styles.errorText, { color: colors.destructive }]}>
            {todayQ.error instanceof Error
              ? todayQ.error.message
              : "Failed to load"}
          </Text>
        </View>
      ) : (
        <>
          {(today?.categories?.length ?? 0) > 0 && (
            <View>
              <CategoryPieChart
                items={(today?.categories ?? []).slice(0, 5).map((item) => ({
                  name: item.name,
                  percent: item.percent,
                  total_seconds: item.total_seconds,
                  text: item.text,
                }))}
              />
            </View>
          )}
          <View style={styles.row}>
            <StatCard
              label="Weekly avg"
              value={fmtSeconds(weekAvg)}
              subtitle="per day"
            />
            <StatCard
              label="Top project"
              value={topProject?.name ?? "-"}
              subtitle={topProject?.text}
            />
          </View>
          {renderSection(
            "Languages",
            (today?.languages ?? []).slice(0, 4).map((item) => ({
              name: item.name,
              percent: item.percent,
            })),
          )}
          {renderSection(
            "Editors",
            (today?.editors ?? []).slice(0, 4).map((item) => ({
              name: item.name,
              percent: item.percent,
            })),
          )}
          {renderSection(
            "Projects",
            (today?.projects ?? []).slice(0, 4).map((item) => ({
              name: item.name,
              percent: item.percent,
            })),
          )}

          {renderSection(
            "Operating Systems",
            (today?.operating_systems ?? []).slice(0, 4).map((item) => ({
              name: item.name,
              percent: item.percent,
            })),
          )}

          <View
            style={[
              styles.section,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Last 7 Days
            </Text>
            {week.length > 0 ? (
              <WeeklyChart days={week} />
            ) : (
              <Text style={[styles.empty, { color: colors.mutedForeground }]}>
                No data available
              </Text>
            )}
          </View>

          {allTimeSinceToday ? (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                All Time Stats
              </Text>
              <View style={{ gap: 8 }}>
                <View style={styles.row}>
                  <Text
                    style={[styles.heroSub, { color: colors.mutedForeground }]}
                  >
                    Total Time
                  </Text>
                  <Text style={[styles.heroSub, { color: colors.foreground }]}>
                    {allTimeSinceToday.text ?? "-"}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text
                    style={[styles.heroSub, { color: colors.mutedForeground }]}
                  >
                    Daily Avg
                  </Text>
                  <Text style={[styles.heroSub, { color: colors.foreground }]}>
                    {fmtSeconds(allTimeSinceToday.daily_average)}
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text
                    style={[styles.heroSub, { color: colors.mutedForeground }]}
                  >
                    Data Since
                  </Text>
                  <Text style={[styles.heroSub, { color: colors.foreground }]}>
                    {allTimeSinceToday.range?.start_text}
                  </Text>
                </View>
              </View>
            </View>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
