import React, { useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { useWakaStats } from "@/src/hooks/useWakaTimeQueries";
import { SetupScreen } from "@/src/components/SetupScreen";
import colors from "@/src/constants/colors";
import { commonStyles as sharedStyles } from "@/src/constants/styles.common";
import { breakdownScreenStyles as styles } from "@/src/constants/styles.screens";
import type { WakaEntry, WakaStats } from "@/src/types/wakatime";

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function StatTile({
  label,
  value,
  accent,
  colors: c,
}: {
  label: string;
  value: string;
  accent?: boolean;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        styles.summaryItem,
        {
          backgroundColor: c.card,
          borderColor: accent ? c.primary + "55" : c.border,
        },
      ]}
    >
      <Text style={[styles.summaryLabel, { color: c.mutedForeground }]}>
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          { color: accent ? c.primary : c.foreground },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function SectionHeader({
  title,
  colors: c,
}: {
  title: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Text
      style={{
        fontSize: 11,
        fontFamily: "Inter_600SemiBold",
        color: c.mutedForeground,
        letterSpacing: 0.6,
        marginBottom: 8,
        marginTop: 4,
      }}
    >
      {title.toUpperCase()}
    </Text>
  );
}

function SegmentBar({
  items,
  chartColors,
  cardColor,
}: {
  items: WakaEntry[];
  chartColors: string[];
  cardColor: string;
}) {
  return (
    <View
      style={{
        height: 10,
        borderRadius: 999,
        overflow: "hidden",
        flexDirection: "row",
        marginBottom: 12,
      }}
    >
      {items.slice(0, 10).map((item, i) => (
        <View
          key={item.name}
          style={{
            flex: Math.max(item.percent, 0.5),
            backgroundColor: chartColors[i % chartColors.length] ?? "#8a79ab",
            borderRightWidth: i < Math.min(items.length, 10) - 1 ? 2 : 0,
            borderRightColor: cardColor,
          }}
        />
      ))}
    </View>
  );
}

function EntryRow({
  item,
  index,
  chartColors,
  colors: c,
}: {
  item: WakaEntry;
  index: number;
  chartColors: string[];
  colors: ReturnType<typeof useColors>;
}) {
  const dotColor = chartColors[index % chartColors.length] ?? "#8a79ab";
  return (
    <View style={{ gap: 4 }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
        }}
      >
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: dotColor,
          }}
        />
        <Text
          style={{
            flex: 1,
            fontSize: 13,
            color: c.foreground,
            fontFamily: "Inter_400Regular",
          }}
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: c.mutedForeground,
            fontFamily: "Inter_400Regular",
            marginRight: 6,
          }}
        >
          {item.text}
        </Text>
        <Text
          style={{
            fontSize: 12,
            color: c.mutedForeground,
            width: 40,
            textAlign: "right",
          }}
        >
          {item.percent.toFixed(1)}%
        </Text>
      </View>
      {/* Per-row mini bar */}
      <View
        style={{
          marginLeft: 16,
          height: 3,
          backgroundColor: c.secondary,
          borderRadius: 2,
        }}
      >
        <View
          style={{
            width: `${item.percent}%`,
            height: 3,
            backgroundColor: dotColor + "99",
            borderRadius: 2,
          }}
        />
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function BreakdownScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { isConfigured } = useWakaTime();
  const [range, setRange] = useState<Range>("last_7_days");
  const [category, setCategory] = useState<Category>("languages");

  const statsQ = useWakaStats(range);

  if (!isConfigured) return <SetupScreen />;

  const stats = statsQ.data as (WakaStats & Record<string, any>) | undefined;
  const items: WakaEntry[] = stats?.[category] ?? [];
  const visibleItems = items.filter((it) => (it?.percent ?? 0) >= 1);
  const showProError = statsQ.isError && range === "last_30_days";

  const chartColors =
    Platform.OS === "web"
      ? colors.light.chartColors
      : (c.chartColors as string[]);

  return (
    <ScrollView
      style={[sharedStyles.scroll, { backgroundColor: c.background }]}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Platform.OS === "web" ? 67 + 16 : insets.top + 16,
          paddingBottom: Platform.OS === "web" ? 34 + 80 : insets.bottom + 80,
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
      <Text style={[styles.title, { color: c.foreground }]}>Breakdown</Text>

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
            styles.proCard,
            { backgroundColor: c.card, borderColor: c.primary + "44" },
          ]}
        >
          <View
            style={[styles.proBadge, { backgroundColor: c.primary + "18" }]}
          >
            <Feather name="zap" size={13} color={c.primary} />
            <Text style={[styles.proLabel, { color: c.primary }]}>
              WakaTime Pro
            </Text>
          </View>
          <Text style={[styles.proMessage, { color: c.foreground }]}>
            30-day stats require a WakaTime Pro account.
          </Text>
          <TouchableOpacity
            style={[styles.proLink, { borderColor: c.border }]}
            onPress={() => Linking.openURL("https://wakatime.com/pricing")}
            activeOpacity={0.7}
          >
            <Text style={[styles.proLinkText, { color: c.primary }]}>
              View plans
            </Text>
            <Feather name="external-link" size={13} color={c.primary} />
          </TouchableOpacity>
        </View>
      )}

      {statsQ.isLoading && (
        <ActivityIndicator color={c.primary} style={{ marginTop: 40 }} />
      )}

      {statsQ.isError && !showProError && (
        <Text style={[styles.error, { color: c.destructive }]}>
          {statsQ.error instanceof Error
            ? statsQ.error.message
            : "Failed to load"}
        </Text>
      )}

      {!showProError && stats && (
        <>
          {/* ----------------------------------------------------------------
              Summary tiles — two rows
          ---------------------------------------------------------------- */}
          <SectionHeader title="Summary" colors={c} />

          {/* Coding time row */}
          <View style={[styles.summaryRow, { marginBottom: 8 }]}>
            <StatTile
              label="Coding time"
              value={stats.human_readable_total ?? "—"}
              colors={c}
            />
            <StatTile
              label="Daily avg"
              value={stats.human_readable_daily_average ?? "—"}
              colors={c}
            />
          </View>

          {/* Including other language row */}
          <View style={[styles.summaryRow, { marginBottom: 8 }]}>
            <StatTile
              label="Total incl. other"
              value={stats.human_readable_total_including_other_language ?? "—"}
              accent
              colors={c}
            />
            <StatTile
              label="Avg incl. other"
              value={
                stats.human_readable_daily_average_including_other_language ??
                "—"
              }
              accent
              colors={c}
            />
          </View>

          {/* Best day + days active */}
          <View style={[styles.summaryRow, { marginBottom: 16 }]}>
            {stats.best_day && (
              <StatTile
                label="Best day"
                value={stats.best_day.text}
                colors={c}
              />
            )}
            <StatTile
              label="Days tracked"
              value={
                stats.days_minus_holidays != null
                  ? `${stats.days_minus_holidays}d`
                  : "—"
              }
              colors={c}
            />
          </View>

          {/* ----------------------------------------------------------------
              Category filter + list
          ---------------------------------------------------------------- */}
          <SectionHeader title="Breakdown" colors={c} />

          <View style={[styles.catRow, { marginBottom: 12 }]}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.catBtn,
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

          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border, padding: 12 },
            ]}
          >
            {visibleItems.length === 0 ? (
              <Text style={[styles.empty, { color: c.mutedForeground }]}>
                No data
              </Text>
            ) : (
              <>
                <SegmentBar
                  items={visibleItems}
                  chartColors={chartColors}
                  cardColor={c.card}
                />
                <View style={{ gap: 10 }}>
                  {visibleItems.slice(0, 10).map((item, i) => (
                    <EntryRow
                      key={item.name}
                      item={item}
                      index={i}
                      chartColors={chartColors}
                      colors={c}
                    />
                  ))}
                </View>
              </>
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}
