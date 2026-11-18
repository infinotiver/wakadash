import React, { useMemo, useState } from "react";
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
import { ct } from "@/src/constants/styles.common";
import { useColors } from "@/src/hooks/useColors";
import {
  useProgramLanguages,
  useWakaStats,
} from "@/src/hooks/useWakaTimeQueries";
import {
  buildLanguageColorMap,
  formatDuration,
  formatPercentage,
} from "@/src/utils/dashboard";

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

function ProgressBar({
  ratio,
  fill,
  track,
  height = 8,
}: {
  ratio: number; // 0..1
  fill: string;
  track: string;
  height?: number;
}) {
  // keep tiny values visible, clamp anything out of range
  const clamped = Math.min(1, Math.max(0.02, ratio));
  return (
    <View
      style={{
        height,
        borderRadius: ct.radius.full,
        overflow: "hidden",
        backgroundColor: track,
      }}
    >
      <View
        style={{
          width: `${clamped * 100}%`,
          height: "100%",
          borderRadius: ct.radius.full,
          backgroundColor: fill,
        }}
      />
    </View>
  );
}

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
  const [range, setRange] = useState<Range>("last_7_days");

  const statsQ = useWakaStats(range);
  const langMetaQ = useProgramLanguages();

  const items = useMemo(
    () => (statsQ.data?.[category] ?? []).filter((p) => p.total_seconds > 0),
    [statsQ.data, category],
  );

  const maxSeconds = items.reduce((m, p) => Math.max(m, p.total_seconds), 0);
  const totalSeconds = items.reduce((s, p) => s + p.total_seconds, 0);

  const showProError =
    statsQ.error instanceof Error &&
    "status" in statsQ.error &&
    statsQ.error.status === 403 &&
    range === "last_30_days";

  // fill = accent.color, track/badge = same hue's container, so each row
  // reads as one tonal family
  const accents = [
    c.accent.violet,
    c.accent.amber,
    c.accent.teal,
    c.accent.coral,
    c.accent.green,
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

      {statsQ.data && items.length > 0 && (
        <View
          style={[ct.styles.rowBetween, { paddingHorizontal: ct.space.xs }]}
        >
          <Text style={[ct.text.label, { color: c.onSurfaceVariant }]}>
            {items.length} {items.length === 1 ? "entry" : "entries"}
          </Text>
          <Text style={[ct.text.label, { color: c.onSurfaceVariant }]}>
            {formatDuration(totalSeconds)} total
          </Text>
        </View>
      )}

      {statsQ.data &&
        items.map((p, i) => {
          const accent = accents[i % accents.length];
          const langColor =
            category === "languages"
              ? langColorMap.get(p.name.toLowerCase())
              : undefined;
          const hasLangColor =
            typeof langColor === "string" && langColor.trim() !== "";

          const fill = hasLangColor ? langColor : accent.color;
          const track = hasLangColor ? `${langColor}33` : accent.colorContainer;
          const badgeBg = hasLangColor
            ? `${langColor}33`
            : accent.colorContainer;
          const badgeFg = hasLangColor ? c.onSurface : accent.onColorContainer;

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
                    backgroundColor: badgeBg,
                  }}
                >
                  <Text style={[ct.text.captionMedium, { color: badgeFg }]}>
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
                    { color: c.onSurface, fontVariant: ["tabular-nums"] },
                  ]}
                >
                  {formatPercentage(p.percent)}
                </Text>
              </View>

              <ProgressBar
                ratio={maxSeconds > 0 ? p.total_seconds / maxSeconds : 0}
                fill={fill}
                track={track}
              />

              <Text style={[ct.text.body, { color: c.onSurfaceVariant }]}>
                {formatDuration(p.total_seconds)}
              </Text>
            </View>
          );
        })}
    </ScrollView>
  );
}
