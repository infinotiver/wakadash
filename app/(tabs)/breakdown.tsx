import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { ButtonGroup } from "@/src/components/ButtonGroup";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { HorizontalBreakdownChart } from "@/src/components/HorizontalBreakdownChart";
import { SetupScreen } from "@/src/components/SetupScreen";
import { AppBar } from "@/src/components/AppBar";
import { ct } from "@/src/constants/styles.common";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useWakaStats } from "@/src/hooks/useWakaTimeQueries";
import { StatCard } from "@/src/components/StatCard";
import { Feather } from "@expo/vector-icons";
const styles = ct.styles.breakdown;
type Range = "last_7_days" | "last_30_days";
type Category = "languages" | "editors" | "operating_systems" | "projects";

const RANGES: { label: string; value: Range }[] = [
  { label: "7 days", value: "last_7_days" },
  { label: "30 days", value: "last_30_days" },
];

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "Languages", value: "languages" },
  { label: "Editors", value: "editors" },
  { label: "Projects", value: "projects" },
  { label: "OS", value: "operating_systems" },
];

function SectionLabel({
  title,
  c,
}: {
  title: string;
  c: ReturnType<typeof useColors>;
}) {
  return (
    <Text
      style={[
        ct.text.label,
        {
          color: c.onSurfaceVariant,
          marginBottom: ct.sm,
          marginTop: ct.xs,
        },
      ]}
    >
      {title}
    </Text>
  );
}

export default function BreakdownScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isConfigured } = useWakaTime();
  const [range, setRange] = useState<Range>("last_7_days");
  const [category, setCategory] = useState<Category>("languages");

  const statsQ = useWakaStats(range);

  if (!isConfigured) return <SetupScreen />;

  const stats = statsQ.data;
  const items = stats?.[category] ?? [];
  const visibleItems = items.filter((item) => (item?.percent ?? 0) >= 0.1);
  const showProError =
    statsQ.error instanceof Error &&
    "status" in statsQ.error &&
    statsQ.error.status === 403 &&
    range === "last_30_days";

  const chartColors = [
    c.accent.violet.color,
    c.accent.amber.color,
    c.accent.teal.color,
    c.accent.coral.color,
    c.accent.green.color,
  ];

  const aiPromptEvents = stats?.ai_prompt_events_total ?? 0;
  const aiPromptLengthAvg = stats?.ai_prompt_length_avg ?? 0;
  const aiAdditions = stats?.ai_additions ?? 0;
  const aiDeletions = stats?.ai_deletions ?? 0;
  const humanAdditions = stats?.human_additions ?? 0;
  const humanDeletions = stats?.human_deletions ?? 0;
  const aiInputTokens = stats?.ai_input_tokens ?? 0;
  const aiOutputTokens = stats?.ai_output_tokens ?? 0;

  const hasAiData = aiPromptEvents > 0 || aiAdditions > 0;

  return (
    <ScrollView
      style={[ct.styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingBottom: insets.bottom + ct.lg,
        },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={statsQ.isFetching}
          onRefresh={() => statsQ.refetch()}
          tintColor={c.primary}
        />
      }
    >
      <AppBar title="Breakdown" variant="center" />

      <ButtonGroup items={RANGES} value={range} onChange={setRange} />

      {/* Pro upsell */}
      {showProError && (
        <View
          style={[
            ct.styles.card,
            {
              backgroundColor: c.surfaceContainerHigh,
              borderColor: c.outline,
            },
          ]}
        >
          <Text style={[{ color: c.onSurface }]}>
            30-day stats require a WakaTime Pro account.
          </Text>
        </View>
      )}

      {statsQ.isLoading && (
        <ActivityIndicator
          color={c.primary}
          style={{ marginTop: ct.layout.loading }}
        />
      )}

      {statsQ.isError && !showProError && (
        <Text style={[styles.error, { color: c.error }]}>
          {statsQ.error instanceof Error
            ? statsQ.error.message
            : "Failed to load"}
        </Text>
      )}

      {stats && (
        <>
          <SectionLabel title="Summary" c={c} />

          <View style={styles.summaryRow}>
            <StatCard
              value={stats.human_readable_total ?? "—"}
              subtitle="Coding Time"
              icon={(color) => <Feather name="clock" size={20} color={color} />}
              iconBackgroundColor={c.accent.amber.colorContainer}
              iconTintColor={c.accent.amber.onColorContainer}
            />

            <StatCard
              value={stats.human_readable_total_including_other_language ?? "—"}
              subtitle="Total coding"
              icon={(color) => <Feather name="clock" size={20} color={color} />}
              iconBackgroundColor={c.accent.coral.colorContainer}
              iconTintColor={c.accent.coral.onColorContainer}
            />
          </View>

          <View style={styles.summaryRow}>
            <StatCard
              value={stats.human_readable_daily_average ?? "—"}
              subtitle="Coding avg"
              icon={(color) => (
                <Feather name="activity" size={20} color={color} />
              )}
              iconBackgroundColor={c.accent.violet.colorContainer}
              iconTintColor={c.accent.violet.onColorContainer}
            />

            <StatCard
              value={
                stats.human_readable_daily_average_including_other_language ??
                "—"
              }
              subtitle="Total avg"
              icon={(color) => (
                <Feather name="activity" size={20} color={color} />
              )}
              iconBackgroundColor={c.accent.violet.colorContainer}
              iconTintColor={c.accent.violet.onColorContainer}
            />
          </View>

          {aiPromptEvents > 0 ||
          aiPromptLengthAvg > 0 ||
          aiInputTokens > 0 ||
          aiOutputTokens > 0 ? (
            <View style={[styles.pills, { marginBottom: ct.lg }]}>
              {aiPromptEvents > 0 && (
                <StatCard
                  value={String(aiPromptEvents)}
                  subtitle="Prompts sent"
                  icon={(color) => (
                    <Feather name="message-square" size={20} color={color} />
                  )}
                />
              )}

              {aiPromptLengthAvg > 0 && (
                <StatCard
                  value={`${aiPromptLengthAvg} chars`}
                  subtitle="Avg prompt length"
                  icon={(color) => (
                    <Feather name="type" size={20} color={color} />
                  )}
                />
              )}

              {aiInputTokens > 0 && (
                <StatCard
                  value={aiInputTokens.toLocaleString()}
                  subtitle="Input tokens"
                  icon={(color) => (
                    <Feather name="log-in" size={20} color={color} />
                  )}
                />
              )}

              {aiOutputTokens > 0 && (
                <StatCard
                  value={aiOutputTokens.toLocaleString()}
                  subtitle="Output tokens"
                  icon={(color) => (
                    <Feather name="log-out" size={20} color={color} />
                  )}
                />
              )}
            </View>
          ) : null}

          <SectionLabel title="Breakdown" c={c} />

          <ButtonGroup
            items={CATEGORIES}
            value={category}
            onChange={setCategory}
          />

          <View
            style={[
              ct.styles.overview.section,
              {
                backgroundColor: c.surfaceContainerHigh,
              },
            ]}
          >
            {visibleItems.length === 0 ? (
              <Text style={[styles.empty, { color: c.onSurfaceVariant }]}>
                No data
              </Text>
            ) : (
              <HorizontalBreakdownChart
                items={visibleItems.slice(0, 10).map((item, i) => ({
                  key: item.name,
                  label: item.name,
                  percent: item.percent,
                  secondaryText: item.text,
                  trailingText: `${item.percent.toFixed(1)}%`,

                  color: chartColors[i % chartColors.length] ?? c.primary,
                }))}
                textColor={c.onSurface}
                mutedTextColor={c.onSurfaceVariant}
                trackColor={c.surfaceContainerHigh}
                separatorColor={c.outlineVariant}
              />
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
