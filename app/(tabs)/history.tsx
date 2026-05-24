import React from "react";
import {
  ActivityIndicator,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useWeekSummaries } from "@/src/hooks/useWakaTimeQueries";
import { SetupScreen } from "@/src/components/SetupScreen";
import { commonStyles } from "@/src/constants/styles.common";
import { historyScreenStyles as styles } from "@/src/constants/styles.screens";
import type { WakaSummaryDay, WakaEntry } from "@/src/types/wakatime";

const SCALE_SECONDS = 12 * 3600;

function formatSeconds(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (seconds === 0) return "—";
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

export default function HistoryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isConfigured } = useWakaTime();
  const weekQ = useWeekSummaries();

  if (!isConfigured) return <SetupScreen />;

  const days = [...(weekQ.data ?? [])].reverse();

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
          refreshing={weekQ.isFetching}
          onRefresh={() => weekQ.refetch()}
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
        <View style={commonStyles.emptyWrap}>
          <Feather name="calendar" size={40} color={colors.mutedForeground} />
          <Text
            style={[commonStyles.emptyText, { color: colors.mutedForeground }]}
          >
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

  const languages = day.languages?.slice(0, 3) ?? [];
  const editors = day.editors?.slice(0, 2) ?? [];
  const topProject = day.projects?.[0];
  const topOS = day.operating_systems?.[0];

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
      {/* Header */}
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
          {formatSeconds(seconds)}
        </Text>
      </View>

      {/* Progress bar */}
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

      {seconds > 0 && (
        <View style={{ marginTop: 12 }}>
          {/* Top language + project (concise) */}
          {languages.length > 0 && (
            <Text style={[styles.sub, { color: colors.mutedForeground }]}>
              {languages[0].name} · {languages[0].text}
            </Text>
          )}

          {topProject && (
            <Text
              style={[
                styles.sub,
                { color: colors.mutedForeground, marginTop: 6 },
              ]}
            >
              Project: {topProject.name}
            </Text>
          )}

          {/* Compact chips for editors / OS */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginTop: 8,
            }}
          >
            {editors.map((e: WakaEntry) => (
              <MetaTag
                key={e.name}
                icon="code"
                label={e.name}
                colors={colors}
              />
            ))}
            {topOS && (
              <MetaTag icon="monitor" label={topOS.name} colors={colors} />
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function MetaTag({
  icon,
  label,
  colors,
}: {
  icon: React.ComponentProps<typeof Feather>["name"];
  label: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: colors.secondary,
        borderRadius: 6,
        paddingHorizontal: 8,
        paddingVertical: 4,
      }}
    >
      <Feather name={icon} size={11} color={colors.mutedForeground} />
      <Text
        style={{
          fontSize: 12,
          color: colors.secondaryForeground,
          fontFamily: "Inter_400Regular",
        }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
