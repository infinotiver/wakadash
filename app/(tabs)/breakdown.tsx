import React, { useEffect, useState } from "react";
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
import { CategoryPieChart } from "@/src/components/CategoryPieChart";
import { CategoryBarChart } from "@/src/components/CategoryBarChart";
import { SetupScreen } from "@/src/components/SetupScreen";
import { AppBar } from "@/src/components/AppBar";
import { ct } from "@/src/constants/styles.common";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import {
  useProgramLanguages,
  useWakaStats,
} from "@/src/hooks/useWakaTimeQueries";
import { StatCard } from "@/src/components/StatCard";
import { Feather } from "@expo/vector-icons";
import { buildLanguageColorMap, formatDuration } from "@/src/utils/dashboard";
import { SegmentedButtons } from "@/src/components/SegmentedButtons";

const styles = ct.styles.breakdown;

type Range =
  | "last_7_days"
  | "last_30_days"
  | "last_6_months"
  | "last_year"
  | "all_time";
type Category =
  | "categories"
  | "languages"
  | "editors"
  | "operating_systems"
  | "projects";
type ChartView = "pie" | "bar";

const RANGES: { label: string; value: Range }[] = [
  { label: "Last Week", value: "last_7_days" },
  { label: "Last Month", value: "last_30_days" },
  { label: "Last 6 Months", value: "last_6_months" },
  { label: "Last Year", value: "last_year" },
  { label: "All Time", value: "all_time" },
];

const RANGE_LABEL: Record<Range, string> = {
  last_7_days: "last week",
  last_30_days: "last month",
  last_6_months: "last 6 months",
  last_year: "last year",
  all_time: "all time",
};

const CATEGORIES: { label: string; value: Category }[] = [
  { label: "Categories", value: "categories" },
  { label: "Languages", value: "languages" },
  { label: "Editors", value: "editors" },
  { label: "Projects", value: "projects" },
  { label: "OS", value: "operating_systems" },
];

const CHART_VIEWS: { label: string; value: ChartView }[] = [
  { label: "Pie", value: "pie" },
  { label: "Bar", value: "bar" },
];

// Entries beyond this rank are summed into a single "Other" slice/bar so the
// pie and bar views always show the same set and their percentages sum
// honestly, instead of silently dropping the tail.
const CHART_TOP_N = 6;

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
          marginBottom: ct.space.sm,
          marginTop: ct.space.xs,
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
  const [category, setCategory] = useState<Category>("categories");
  const [chartView, setChartView] = useState<ChartView>("pie");

  const statsQ = useWakaStats(range);
  const langMetaQ = useProgramLanguages();

  const stats = statsQ.data;

  // Not every category breakdown exists for every provider
  const availableCategories = CATEGORIES.filter(
    (cat) => stats?.[cat.value] !== undefined,
  );

  useEffect(() => {
    if (!stats) return;
    const stillAvailable = availableCategories.some(
      (c) => c.value === category,
    );
    if (!stillAvailable && availableCategories.length > 0) {
      setCategory(availableCategories[0].value);
    }
  }, [stats, availableCategories, category]);

  if (!isConfigured) return <SetupScreen />;

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

  const langColorMap = buildLanguageColorMap(langMetaQ.data);

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
          paddingBottom: insets.bottom + ct.space.lg,
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
      {/* <AppBar title="Breakdown" variant="center" /> */}
      <AppBar
        title="Breakdown"
        variant="small"
        elevated={false}
        leadingIcon="arrow-left"
        leadingLabel="Go back"
        onLeadingPress={() => router.back()}
        actions={[]}
      />
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
          style={{ marginTop: ct.size.loading }}
        />
      )}

      {statsQ.isError && !showProError && (
        <Text style={[ct.styles.pill, { color: c.error }]}>
          {statsQ.error instanceof Error
            ? statsQ.error.message
            : "Failed to load"}
        </Text>
      )}

      {stats && (
        <>
          {stats.streak !== undefined && stats.streak > 0 && (
            <StatCard
              value={`${stats.streak} ${stats.streak === 1 ? "day" : "days"}`}
              subtitle="Current Streak"
              icon={(color) => <Feather name="zap" size={20} color={color} />}
              iconBackgroundColor={c.accent.amber.colorContainer}
              iconTintColor={c.accent.amber.onColorContainer}
            />
          )}
          <SectionLabel title="Summary" c={c} />

          <View style={styles.summaryRow}>
            <StatCard
              value={formatDuration(stats.total_seconds)}
              subtitle="Coding Time"
              icon={(color) => <Feather name="clock" size={20} color={color} />}
              iconBackgroundColor={c.accent.green.colorContainer}
              iconTintColor={c.accent.green.onColorContainer}
            />

            <StatCard
              value={formatDuration(stats.daily_average)}
              subtitle="Daily Avg"
              icon={(color) => (
                <Feather name="activity" size={20} color={color} />
              )}
              iconBackgroundColor={c.accent.violet.colorContainer}
              iconTintColor={c.accent.violet.onColorContainer}
            />
          </View>

          {stats.total_seconds_including_other_language !== undefined && (
            <View style={styles.summaryRow}>
              <StatCard
                value={formatDuration(
                  stats.total_seconds_including_other_language,
                )}
                subtitle="Total Time"
                icon={(color) => (
                  <Feather name="clock" size={20} color={color} />
                )}
                iconBackgroundColor={c.accent.coral.colorContainer}
                iconTintColor={c.accent.coral.onColorContainer}
              />

              <StatCard
                value={formatDuration(
                  stats.daily_average_including_other_language ?? 0,
                )}
                subtitle="Total Avg"
                icon={(color) => (
                  <Feather name="activity" size={20} color={color} />
                )}
                iconBackgroundColor={c.accent.coral.colorContainer}
                iconTintColor={c.accent.coral.onColorContainer}
              />
            </View>
          )}

          {hasAiData && (
            <>
              <SectionLabel title="AI Activity" c={c} />

              <View style={styles.summaryRow}>
                <StatCard
                  value={String(aiPromptEvents)}
                  subtitle="Prompts sent"
                  icon={(color) => (
                    <Feather name="message-square" size={20} color={color} />
                  )}
                  iconBackgroundColor={c.accent.teal.colorContainer}
                  iconTintColor={c.accent.teal.onColorContainer}
                />

                <StatCard
                  value={`${aiPromptLengthAvg} chars`}
                  subtitle="Avg prompt length"
                  icon={(color) => (
                    <Feather name="type" size={20} color={color} />
                  )}
                  iconBackgroundColor={c.accent.teal.colorContainer}
                  iconTintColor={c.accent.teal.onColorContainer}
                />
              </View>

              <View style={styles.summaryRow}>
                <StatCard
                  value={aiInputTokens.toLocaleString("en-US", {
                    notation: "compact",
                  })}
                  subtitle="Input tokens"
                  icon={(color) => (
                    <Feather name="log-in" size={20} color={color} />
                  )}
                  iconBackgroundColor={c.accent.green.colorContainer}
                  iconTintColor={c.accent.green.onColorContainer}
                />

                <StatCard
                  value={aiOutputTokens.toLocaleString("en-US", {
                    notation: "compact",
                  })}
                  subtitle="Output tokens"
                  icon={(color) => (
                    <Feather name="log-out" size={20} color={color} />
                  )}
                  iconBackgroundColor={c.accent.green.colorContainer}
                  iconTintColor={c.accent.green.onColorContainer}
                />
              </View>

              <View style={[styles.summaryRow, { marginBottom: ct.space.lg }]}>
                <StatCard
                  value={`+${aiAdditions.toLocaleString("en-US", { notation: "compact" })} / -${aiDeletions.toLocaleString("en-US", { notation: "compact" })}`}
                  subtitle="AI changes"
                  icon={(color) => (
                    <Feather name="cpu" size={20} color={color} />
                  )}
                  iconBackgroundColor={c.accent.coral.colorContainer}
                  iconTintColor={c.accent.coral.onColorContainer}
                />

                <StatCard
                  value={`+${humanAdditions.toLocaleString("en-US", { notation: "compact" })} / -${humanDeletions.toLocaleString("en-US", { notation: "compact" })}`}
                  subtitle="Human changes"
                  icon={(color) => (
                    <Feather name="user" size={20} color={color} />
                  )}
                  iconBackgroundColor={c.accent.violet.colorContainer}
                  iconTintColor={c.accent.violet.onColorContainer}
                />
              </View>
            </>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <SectionLabel title="Breakdown" c={c} />
            <SegmentedButtons
              items={CHART_VIEWS}
              value={chartView}
              onChange={setChartView}
            />
          </View>

          <ButtonGroup
            items={availableCategories}
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
              (() => {
                let fallbackCursor = 0;
                const mappedItems = visibleItems.map((item) => {
                  const mapped =
                    category === "languages"
                      ? langColorMap.get(item.name.toLowerCase())
                      : undefined;
                  const hasColor =
                    typeof mapped === "string" && mapped.trim() !== "";
                  const color = hasColor
                    ? mapped
                    : chartColors[fallbackCursor++ % chartColors.length];

                  return {
                    name: item.name,
                    percent: item.percent,
                    total_seconds: item.total_seconds,
                    text: item.text ?? "",
                    color,
                  };
                });

               
                const topItems = mappedItems.slice(0, CHART_TOP_N);
                const restItems = mappedItems.slice(CHART_TOP_N);
                const otherSeconds = restItems.reduce(
                  (sum, item) => sum + item.total_seconds,
                  0,
                );
                const otherPercent = restItems.reduce(
                  (sum, item) => sum + item.percent,
                  0,
                );

                const chartItems =
                  restItems.length > 0
                    ? [
                        ...topItems,
                        {
                          name: "Other",
                          percent: otherPercent,
                          total_seconds: otherSeconds,
                          text: formatDuration(otherSeconds),
                          color: c.outline,
                        },
                      ]
                    : topItems;

                return (
                  <View style={{ gap: ct.space.md }}>
                    {chartView === "pie" ? (
                      <CategoryPieChart
                        items={chartItems}
                        seriesColors={chartItems.map((i) => i.color)}
                        backgroundColor={c.surfaceContainerHigh}
                        totalLabel={RANGE_LABEL[range]}
                        radiusRatio={0.55}
                      />
                    ) : (
                      <CategoryBarChart
                        key={`${range}-${category}}`}
                        items={chartItems}
                        colors={chartItems.map((i) => i.color)}
                      />
                    )}
                  </View>
                );
              })()
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
