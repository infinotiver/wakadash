import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { HorizontalBreakdownChart } from "@/src/components/HorizontalBreakdownChart";
import { SplitBar } from "@/src/components/SplitBar";
import { SetupScreen } from "@/src/components/SetupScreen";
import { ct } from "@/src/constants/styles.common";
const styles = ct.styles.breakdown;
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useWakaStats } from "@/src/hooks/useWakaTimeQueries";
import type { WakaEntry, WakaStats } from "@/src/types/wakatime";
import { StatCard } from "@/src/components/StatCard";
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
          color: c.mutedForeground,
          marginBottom: ct.sm,
          marginTop: ct.xs,
        },
      ]}
    >
      {title}
    </Text>
  );
}

function Card({
  children,
  c,
}: {
  children: React.ReactNode;
  c: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}
    >
      {children}
    </View>
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

  const chartColors = c.chartColors as string[];

  const aiPromptEvents = stats?.ai_prompt_events ?? 0;
  const aiPromptLengthAvg = stats?.ai_prompt_length_avg ?? 0;
  const aiAdditions = stats?.ai_additions ?? 0;
  const aiDeletions = stats?.ai_deletions ?? 0;
  const humanAdditions = stats?.human_additions ?? 0;
  const humanDeletions = stats?.human_deletions ?? 0;

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
      <View
        style={[
          ct.styles.appBar,
          { paddingTop: Platform.OS === "web" ? ct.sm : insets.top },
        ]}
      >
        <Pressable
          accessibilityLabel="Go back"
          accessibilityRole="button"
          onPress={() => router.back()}
          style={ct.styles.appBarIcon}
        >
          <Feather name="arrow-left" size={22} color={c.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: c.foreground }]}>Breakdown</Text>
        <View style={ct.styles.appBarIcon} />
      </View>

      {/* Range toggle */}
      <View style={styles.pills}>
        {RANGES.map((r) => (
          <TouchableOpacity
            key={r.value}
            style={[
              styles.pill,
              {
                backgroundColor: range === r.value ? c.primary : c.card,
                borderColor: range === r.value ? c.primary : c.border,
              },
            ]}
            onPress={() => setRange(r.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.pillText,
                {
                  color:
                    range === r.value ? c.primaryForeground : c.mutedForeground,
                },
              ]}
            >
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Pro upsell */}
      {showProError && (
        <View
          style={[
            ct.styles.card,
            { backgroundColor: c.card, borderColor: `${c.primary}44` },
          ]}
        >
          <Text style={[{ color: c.foreground }]}>
            30-day stats require a WakaTime Pro account.
          </Text>
        </View>
      )}

      {statsQ.isLoading && (
        <ActivityIndicator color={c.primary} style={{ marginTop: ct.layout.loading }} />
      )}

      {statsQ.isError && !showProError && (
        <Text style={[styles.error, { color: c.destructive }]}>
          {statsQ.error instanceof Error
            ? statsQ.error.message
            : "Failed to load"}
        </Text>
      )}

      {stats && (
        <>
          <SectionLabel title="Summary" c={c} />
          <View style={[styles.summaryRow]}>
            <StatCard
              label="Coding time"
              value={stats.human_readable_total ?? "—"}
              subtitle={`Total: ${stats.human_readable_total_including_other_language}`}
            />
            <StatCard
              label="Coding avg"
              value={stats.human_readable_daily_average ?? "—"}
              subtitle={`Total Avg: ${stats.human_readable_daily_average_including_other_language}`}
            />
          </View>

          <View style={[styles.catRow, { marginBottom: ct.lg }]}>
            {stats.ai_prompt_events ? (
              <StatCard
                label="Prompts sent"
                value={String(stats.ai_prompt_events)}
                subtitle={
                  stats.ai_prompt_length_avg
                    ? `Avg length: ${stats.ai_prompt_length_avg} chars`
                    : undefined
                }
              />
            ) : null}
            {stats.ai_input_tokens || stats.ai_output_tokens ? (
              <StatCard
                label="Tokens"
                value={String(stats.ai_input_tokens)}
                subtitle={`in: ${stats.ai_input_tokens ?? 0} out: ${stats.ai_output_tokens ?? 0}`}
              />
            ) : null}
          </View>
          {hasAiData && (
            <>
              <SectionLabel title="AI Usage" c={c} />
              <Card c={c}>
                {aiAdditions > 0 && humanAdditions > 0 && (
                  <View style={{ marginTop: ct.md }}>
                    <SplitBar
                      left={{
                        label: "AI additions",
                        value: aiAdditions,
                        displayValue: `${aiAdditions.toLocaleString()} lines`,
                      }}
                      right={{
                        label: "Human additions",
                        value: humanAdditions,
                        displayValue: `${humanAdditions.toLocaleString()} lines`,
                      }}
                    />
                  </View>
                )}

                {aiDeletions > 0 && humanDeletions > 0 && (
                  <View style={{ marginTop: ct.md }}>
                    <SplitBar
                      left={{
                        label: "AI deletions",
                        value: aiDeletions,
                        displayValue: `${aiDeletions.toLocaleString()} lines`,
                      }}
                      right={{
                        label: "Human deletions",
                        value: humanDeletions,
                        displayValue: `${humanDeletions.toLocaleString()} lines`,
                      }}
                    />
                  </View>
                )}
              </Card>
            </>
          )}

          <SectionLabel title="Breakdown" c={c} />

          <View style={[styles.catRow, { marginBottom: ct.md }]}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.pill,
                  {
                    backgroundColor:
                      category === cat.value ? c.primary : c.secondary,
                    borderColor: category === cat.value ? c.primary : c.border,
                  },
                ]}
                onPress={() => setCategory(cat.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.catText,
                    {
                      color:
                        category === cat.value
                          ? c.primaryForeground
                          : c.secondaryForeground,
                    },
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Card c={c}>
            {visibleItems.length === 0 ? (
              <Text style={[styles.empty, { color: c.mutedForeground }]}>
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
                  color: chartColors[i % chartColors.length] ?? "#8a79ab",
                }))}
                textColor={c.foreground}
                mutedTextColor={c.mutedForeground}
                trackColor={c.secondary}
                separatorColor={c.card}
              />
            )}
          </Card>
        </>
      )}
    </ScrollView>
  );
}
