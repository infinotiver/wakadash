import React, { useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ButtonGroup } from "@/src/components/ButtonGroup";
import { AppBar } from "@/src/components/AppBar";
import { SetupScreen } from "@/src/components/SetupScreen";
import { HorizontalStackedBar } from "@/src/components/HorizontalStackedBar";
import { ct } from "@/src/constants/styles.common";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import {
  useProgramLanguages,
  useWakaStats,
} from "@/src/hooks/useWakaTimeQueries";
import { buildLanguageColorMap, formatDuration } from "@/src/utils/dashboard";

const styles = ct.styles.breakdown;

type Range =
  | "last_7_days"
  | "last_30_days"
  | "last_6_months"
  | "last_year"
  | "all_time";

type Category = "languages" | "editors" | "projects" | "operating_systems";

const RANGES: { label: string; value: Range }[] = [
  { label: "Last Week", value: "last_7_days" },
  { label: "Last Month", value: "last_30_days" },
  { label: "Last 6 Months", value: "last_6_months" },
  { label: "Last Year", value: "last_year" },
  { label: "All Time", value: "all_time" },
];

export function CategoryScreen({
  title,
  category,
}: {
  title: string;
  category: Category;
}) {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isConfigured } = useWakaTime();
  const [range, setRange] = useState<Range>("last_7_days");

  const statsQ = useWakaStats(range);
  const langMetaQ = useProgramLanguages();

  if (!isConfigured) return <SetupScreen />;

  const items = (statsQ.data?.[category] ?? []).filter(
    (p) => p.total_seconds > 0,
  );

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

  return (
    <ScrollView
      style={[ct.styles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: insets.bottom + 64 + ct.space.lg },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={statsQ.isFetching}
          onRefresh={() => statsQ.refetch()}
          tintColor={c.primary}
        />
      }
    >
      <AppBar
        title={title}
        variant="small"
        elevated={false}
        leadingIcon="arrow-left"
        leadingLabel="Go back"
        onLeadingPress={() => router.back()}
        actions={[]}
      />
      <ButtonGroup items={RANGES} value={range} onChange={setRange} />

      {showProError && (
        <Text style={{ color: c.onSurfaceVariant }}>
          30-day stats require a WakaTime Pro account.
        </Text>
      )}

      {statsQ.isLoading && (
        <ActivityIndicator
          color={c.primary}
          style={{ marginTop: ct.size.loading }}
        />
      )}

      {statsQ.isError && !showProError && (
        <Text style={{ color: c.error }}>
          {statsQ.error instanceof Error
            ? statsQ.error.message
            : "Failed to load"}
        </Text>
      )}

      {statsQ.data && items.length === 0 && (
        <Text style={[styles.empty, { color: c.onSurfaceVariant }]}>
          No data
        </Text>
      )}

      {statsQ.data &&
        items.map((p, i) => {
          const color =
            (category === "languages"
              ? langColorMap.get(p.name.toLowerCase())
              : undefined) ?? chartColors[i % chartColors.length];

          return (
            <View
              key={p.name}
              style={{
                backgroundColor: c.surfaceContainerHigh,
                borderRadius: ct.radius["2xl"],
                padding: ct.space.lg,
                gap: ct.space.md,
              }}
            >
              <View style={[ct.styles.rowCenter, { gap: ct.space.md }]}>
                <View
                  style={{
                    minWidth: 28,
                    height: 28,
                    borderRadius: ct.radius.full,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: c.secondaryContainer,
                  }}
                >
                  <Text
                    style={[
                      ct.text.captionMedium,
                      { color: c.onSecondaryContainer },
                    ]}
                  >
                    {i + 1}
                  </Text>
                </View>

                <Text
                  style={[
                    ct.text.sectionTitle,
                    { color: c.onSurface, flex: 1 },
                  ]}
                  numberOfLines={1}
                >
                  {p.name}
                </Text>

                <Text
                  style={[
                    ct.text.bodySemibold,
                    {
                      color: c.onSurface,
                      fontVariant: ["tabular-nums"],
                    },
                  ]}
                >
                  {p.percent.toFixed(1)}%
                </Text>
              </View>

              <HorizontalStackedBar
                segments={[{ value: p.percent, color }]}
                height={8}
                backgroundColor={c.surfaceContainerHighest}
              />

              <Text style={[ct.text.body, { color: c.onSurfaceVariant }]}>
                {p.text ?? formatDuration(p.total_seconds)}
              </Text>
            </View>
          );
        })}
    </ScrollView>
  );
}
