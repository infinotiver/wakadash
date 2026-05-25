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
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
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
    (s, d) => s + (d.grand_total?.total_seconds ?? 0),
    0,
  );
  const weekAvg = week.length ? weekTotal / week.length : 0;

  function fmtSeconds(s: number) {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }

  const loading = todayQ.isLoading && weekQ.isLoading;

  const chartColors = colors.chartColors as string[];

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

        <View
          style={{
            height: 12,
            borderRadius: 999,
            overflow: "hidden",
            backgroundColor: colors.secondary,
            flexDirection: "row",
            marginTop: 8,
          }}
        >
          {items.map((item, i) => (
            <View
              key={`${title}-${item.name}`}
              style={{
                flex: Math.max(item.percent, 0.01),
                backgroundColor:
                  chartColors[i % chartColors.length] ?? "#8a79ab",
                borderRightWidth: i < items.length - 1 ? 2 : 0,
                borderRightColor: colors.card,
              }}
            />
          ))}
        </View>

        <View style={{ marginTop: 10, gap: 8 }}>
          {items.map((item, i) => (
            <View key={`${title}-row-${item.name}`} style={styles.keyRow}>
              <View
                style={[
                  styles.keyDot,
                  {
                    backgroundColor:
                      chartColors[i % chartColors.length] ?? "#8a79ab",
                  },
                ]}
              />
              <Text
                style={[styles.keyText, { color: colors.foreground }]}
                numberOfLines={1}
              >
                {item.name} · {item.percent.toFixed(1)}%
              </Text>
            </View>
          ))}
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
        {/* <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
          WakaDash
        </Text> */}
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
          <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
            <Text
              style={[
                styles.heroLabel,
                { color: colors.primaryForeground + "AA" },
              ]}
            >
              Today
            </Text>
            <Text
              style={[styles.heroTime, { color: colors.primaryForeground }]}
            >
              {today?.grand_total?.text ?? "0 mins"}
            </Text>
            {topLang ? (
              <Text
                style={[
                  styles.heroSub,
                  { color: colors.primaryForeground + "CC" },
                ]}
              >
                Top: {topLang.name} ({topLang.text})
              </Text>
            ) : null}
          </View>
          <View style={styles.row}>
            <StatCard
              label="Weekly avg"
              value={fmtSeconds(weekAvg)}
              subtitle="per day"
            />
            <StatCard
              label="Active project"
              value={topProject?.name ?? "—"}
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

          {allTimeSinceToday && (
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
                    {allTimeSinceToday.text ?? "—"}
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
          )}
        </>
      )}
    </ScrollView>
  );
}
