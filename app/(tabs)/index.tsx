import React, { useCallback } from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery } from "@tanstack/react-query";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { StatCard } from "@/src/components/StatCard";
import { WeeklyChart } from "@/src/components/WeeklyChart";
import { BreakdownItem } from "@/src/components/BreakdownItem";
import { SetupScreen } from "@/src/components/SetupScreen";

export default function OverviewScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isConfigured, fetchTodaySummary, fetchWeekSummaries } = useWakaTime();

  const todayQ = useQuery({
    queryKey: ["today"],
    queryFn: fetchTodaySummary,
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000,
  });

  const weekQ = useQuery({
    queryKey: ["week"],
    queryFn: fetchWeekSummaries,
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000,
  });

  const refetch = useCallback(async () => {
    await Promise.all([todayQ.refetch(), weekQ.refetch()]);
  }, [todayQ, weekQ]);

  if (!isConfigured) return <SetupScreen />;

  const today = todayQ.data;
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

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.background }]}
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
        <Text style={[styles.greeting, { color: colors.mutedForeground }]}>
          {getGreeting()}
        </Text>
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
                {topLang.name} · {topLang.text}
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

          {/* Languages */}
          {(today?.languages?.length ?? 0) > 0 && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Languages
              </Text>
              {today!.languages.slice(0, 4).map((item, i) => (
                <BreakdownItem
                  key={item.name}
                  name={item.name}
                  text={item.text}
                  percent={item.percent}
                  color={chartColors[i % chartColors.length] ?? "#8a79ab"}
                  index={i}
                />
              ))}
            </View>
          )}

          {/* Editors */}
          {(today?.editors?.length ?? 0) > 0 && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Editors
              </Text>
              {today!.editors.slice(0, 4).map((item, i) => (
                <BreakdownItem
                  key={item.name}
                  name={item.name}
                  text={item.text}
                  percent={item.percent}
                  color={chartColors[i % chartColors.length] ?? "#8a79ab"}
                  index={i}
                />
              ))}
            </View>
          )}

          {/* Operating Systems */}
          {(today?.operating_systems?.length ?? 0) > 0 && (
            <View
              style={[
                styles.section,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Operating Systems
              </Text>
              {today!.operating_systems.slice(0, 4).map((item, i) => (
                <BreakdownItem
                  key={item.name}
                  name={item.name}
                  text={item.text}
                  percent={item.percent}
                  color={chartColors[i % chartColors.length] ?? "#8a79ab"}
                  index={i}
                />
              ))}
            </View>
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
        </>
      )}
    </ScrollView>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  header: { marginBottom: 4 },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.8 },
  heroCard: {
    borderRadius: 18,
    padding: 24,
    gap: 4,
  },
  heroLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTime: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  row: { flexDirection: "row", gap: 12 },
  section: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  empty: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 20,
  },
  errorCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
