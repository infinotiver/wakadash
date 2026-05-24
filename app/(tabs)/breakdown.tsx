import React, { useState, useCallback } from "react";
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
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";
import { BreakdownItem } from "@/src/components/BreakdownItem";
import { SetupScreen } from "@/src/components/SetupScreen";
import colors from "@/src/constants/colors";
import { styles as sharedStyles } from "@/src/constants/style";
import { styles } from "@/src/constants/breakdown.style";

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

function isProError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return /402|403|upgrade|pro|premium/i.test(err.message);
}

export default function BreakdownScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const { isConfigured, fetchStats } = useWakaTime();
  const [range, setRange] = useState<Range>("last_7_days");
  const [category, setCategory] = useState<Category>("languages");

  const statsQ = useQuery({
    queryKey: ["stats", range],
    queryFn: () => fetchStats(range),
    enabled: isConfigured,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  const refetch = useCallback(() => {
    statsQ.refetch();
  }, [statsQ]);

  if (!isConfigured) return <SetupScreen />;

  const stats = statsQ.data;
  const items = stats?.[category] ?? [];

  const chartColors =
    Platform.OS === "web"
      ? colors.light.chartColors
      : (c.chartColors as string[]);

  const showProError = statsQ.isError && range === "last_30_days";

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
          onRefresh={refetch}
          tintColor={c.primary}
        />
      }
    >
      <Text style={[styles.title, { color: c.foreground }]}>Breakdown</Text>

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

      {/* Pro upsell banner when 30-day fails */}
      {showProError ? (
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
      ) : null}

      {!showProError && stats ? (
        <View style={styles.summaryRow}>
          <View
            style={[
              styles.summaryItem,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: c.mutedForeground }]}>
              Total
            </Text>
            <Text style={[styles.summaryValue, { color: c.foreground }]}>
              {stats.human_readable_total ?? "—"}
            </Text>
          </View>
          <View
            style={[
              styles.summaryItem,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            <Text style={[styles.summaryLabel, { color: c.mutedForeground }]}>
              Daily avg
            </Text>
            <Text style={[styles.summaryValue, { color: c.foreground }]}>
              {stats.daily_average?.text ?? "—"}
            </Text>
          </View>
          {stats.best_day ? (
            <View
              style={[
                styles.summaryItem,
                { backgroundColor: c.card, borderColor: c.border },
              ]}
            >
              <Text style={[styles.summaryLabel, { color: c.mutedForeground }]}>
                Best day
              </Text>
              <Text style={[styles.summaryValue, { color: c.primary }]}>
                {stats.best_day.text}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {!showProError ? (
        <View style={styles.catRow}>
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
      ) : null}

      {!showProError ? (
        statsQ.isLoading ? (
          <ActivityIndicator color={c.primary} style={{ marginTop: 40 }} />
        ) : statsQ.isError ? (
          <Text style={[styles.error, { color: c.destructive }]}>
            {statsQ.error instanceof Error
              ? statsQ.error.message
              : "Failed to load"}
          </Text>
        ) : (
          <View
            style={[
              styles.card,
              { backgroundColor: c.card, borderColor: c.border },
            ]}
          >
            {items.length === 0 ? (
              <Text style={[styles.empty, { color: c.mutedForeground }]}>
                No data
              </Text>
            ) : (
              items
                .slice(0, 10)
                .map((item, i) => (
                  <BreakdownItem
                    key={item.name}
                    name={item.name}
                    text={item.text}
                    percent={item.percent}
                    color={chartColors[i % chartColors.length] ?? "#00BFA5"}
                    index={i}
                  />
                ))
            )}
          </View>
        )
      ) : null}
    </ScrollView>
  );
}
