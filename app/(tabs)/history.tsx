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
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime, type WakaSummaryDay } from "@/src/context/WakaTimeContext";
import { SetupScreen } from "@/src/components/SetupScreen";
import { styles } from "@/src/constants/style"

const SCALE_SECONDS = 12 * 3600; // 12 hours = full bar

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isConfigured, fetchWeekSummaries } = useWakaTime();

  const weekQ = useQuery({
    queryKey: ["week"],
    queryFn: fetchWeekSummaries,
    enabled: isConfigured,
    staleTime: 5 * 60 * 1000,
  });

  const refetch = useCallback(() => {
    weekQ.refetch();
  }, [weekQ]);

  if (!isConfigured) return <SetupScreen />;

  const days = [...(weekQ.data ?? [])].reverse();

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
          refreshing={weekQ.isFetching}
          onRefresh={refetch}
          tintColor={colors.primary}
        />
      }
    >
      <Text style={[styles.title, { color: colors.foreground }]}>History</Text>
      <Text style={[styles.sub, { color: colors.mutedForeground }]}>
        Last 7 days
      </Text>

      {weekQ.isLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : weekQ.isError ? (
        <Text style={[styles.error, { color: colors.destructive }]}>
          {weekQ.error instanceof Error
            ? weekQ.error.message
            : "Failed to load"}
        </Text>
      ) : days.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Feather name="calendar" size={40} color={colors.mutedForeground} />
          <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>
            No history yet
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {days.map((day) => (
            <DayCard key={day.range?.date} day={day} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

function DayCard({ day }: { day: WakaSummaryDay }) {
  const colors = useColors();
  const seconds = day.grand_total?.total_seconds ?? 0;
  const ratio = Math.min(1, seconds / SCALE_SECONDS);
  const isToday = day.range?.date === new Date().toISOString().split("T")[0];

  const date = day.range?.date ?? "";
  const d = new Date(date + "T12:00:00");
  const dayName = d.toLocaleDateString("en-US", { weekday: "short" });
  const dateStr = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });

  const topLang = day.languages?.[0];
  const topProject = day.projects?.[0];

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: isToday ? colors.primary : colors.border,
          borderWidth: isToday ? 1.5 : 1,
        },
      ]}
    >
      <View style={styles.cardHeader}>
        <View>
          <Text
            style={[
              styles.dayName,
              { color: isToday ? colors.primary : colors.foreground },
            ]}
          >
            {isToday ? "Today" : dayName}
          </Text>
          <Text style={[styles.dateStr, { color: colors.mutedForeground }]}>
            {dateStr}
          </Text>
        </View>
        <Text style={[styles.totalTime, { color: colors.foreground }]}>
          {seconds === 0 ? "—" : day.grand_total?.text}
        </Text>
      </View>

      <View style={[styles.barTrack, { backgroundColor: colors.secondary }]}>
        <View
          style={[
            styles.barFill,
            {
              backgroundColor: isToday ? colors.primary : colors.primary + "66",
              width: `${ratio * 100}%`,
            },
          ]}
        />
      </View>

      {seconds > 0 && (topLang ?? topProject) ? (
        <View style={styles.tags}>
          {topLang ? (
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Text
                style={[styles.tagText, { color: colors.secondaryForeground }]}
              >
                {topLang.name}
              </Text>
            </View>
          ) : null}
          {topProject ? (
            <View style={[styles.tag, { backgroundColor: colors.secondary }]}>
              <Feather name="folder" size={11} color={colors.mutedForeground} />
              <Text
                style={[styles.tagText, { color: colors.secondaryForeground }]}
              >
                {topProject.name}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
