import React, { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
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
      style={[styles.scroll, { backgroundColor: c.background }]}
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

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  content: { paddingHorizontal: 16, gap: 12 },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
    marginBottom: 4,
  },
  pills: { flexDirection: "row", gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  proCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  proLabel: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  proMessage: { fontSize: 14, fontFamily: "Inter_400Regular", lineHeight: 20 },
  proLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  proLinkText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  summaryRow: { flexDirection: "row", gap: 10 },
  summaryItem: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  summaryLabel: {
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: { fontSize: 15, fontFamily: "Inter_700Bold" },
  catRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  catText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  card: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
  },
  empty: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 20,
  },
  error: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    marginTop: 20,
  },
});
