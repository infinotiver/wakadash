import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppBar } from "@/src/components/AppBar";
import { GoalCard } from "@/src/components/GoalCard";
import { GoalChart } from "@/src/components/GoalChart";
import { StatCard } from "@/src/components/StatCard";
import { ct } from "@/src/constants/styles.common";
import { useColors } from "@/src/hooks/useColors";
import { useGoal } from "@/src/hooks/useWakaTimeQueries";
import { formatDuration } from "@/src/utils/dashboard";
import {
  computeGoalStats,
  formatShortDate,
  goalTitle,
  timeAgo,
} from "@/src/utils/goals";

type Colors = ReturnType<typeof useColors>;

function Section({
  title,
  c,
  children,
}: {
  title: string;
  c: Colors;
  children: React.ReactNode;
}) {
  return (
    <View style={[ct.styles.card, { backgroundColor: c.surfaceContainerHigh }]}>
      <Text style={[ct.text.sectionTitle, { color: c.onSurface }]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function InfoRow({
  label,
  value,
  c,
}: {
  label: string;
  value: string;
  c: Colors;
}) {
  return (
    <View style={ct.styles.rowBetween}>
      <Text style={[ct.text.body, { color: c.onSurfaceVariant }]}>{label}</Text>
      <Text
        style={[
          ct.text.bodyMedium,
          {
            color: c.onSurface,
            marginLeft: ct.space.lg,
            textAlign: "right",
            flexShrink: 1,
          },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function ScopeChips({
  label,
  items,
  c,
}: {
  label: string;
  items: string[];
  c: Colors;
}) {
  if (items.length === 0) return null;
  return (
    <View style={{ gap: ct.space.xs }}>
      <Text style={[ct.text.caption, { color: c.onSurfaceVariant }]}>
        {label}
      </Text>
      <View
        style={{ flexDirection: "row", flexWrap: "wrap", gap: ct.space.xs }}
      >
        {items.map((name) => (
          <View
            key={name}
            style={{
              paddingHorizontal: ct.space.md,
              paddingVertical: ct.space.xs,
              borderRadius: ct.radius.full,
              backgroundColor: c.surfaceContainerHighest,
            }}
          >
            <Text style={[ct.text.tagText, { color: c.onSurfaceVariant }]}>
              {name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export default function GoalDetailScreen() {
  const c = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const goalQ = useGoal(id);

  const result = goalQ.data;
  const goal = result?.goal;

  const stats = goal
    ? computeGoalStats(goal.chart_data, goal.is_inverse)
    : null;
  const calculating =
    goal?.status_percent_calculated !== undefined &&
    goal.status_percent_calculated < 100;

  const hasScope =
    !!goal &&
    (goal.projects.length || goal.languages.length || goal.editors.length) > 0;

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <AppBar
        title={goal ? goalTitle(goal) : "Goal"}
        variant="small"
        elevated={false}
        leadingIcon="arrow-left"
        leadingLabel="Go back"
        onLeadingPress={() => router.back()}
        actions={[]}
      />
      <ScrollView
        style={ct.styles.scroll}
        contentContainerStyle={[
          ct.styles.breakdown.content,
          { paddingBottom: insets.bottom + ct.space.lg },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={goalQ.isFetching}
            onRefresh={() => goalQ.refetch()}
            tintColor={c.primary}
          />
        }
      >
        {goalQ.isLoading ? (
          <ActivityIndicator
            color={c.primary}
            style={{ marginTop: ct.size.loading }}
          />
        ) : goalQ.isError ? (
          <Text style={[ct.text.body, { color: c.error }]}>
            {goalQ.error instanceof Error
              ? goalQ.error.message
              : "Failed to load"}
          </Text>
        ) : !goal || !stats ? (
          <View
            style={[
              ct.styles.card,
              { backgroundColor: c.surfaceContainerHigh },
            ]}
          >
            <Text style={[ct.text.body, { color: c.onSurfaceVariant }]}>
              This goal is still being calculated. Pull down to refresh in a
              moment.
            </Text>
          </View>
        ) : (
          <>
            <View
              style={[
                ct.styles.card,
                { backgroundColor: c.surfaceContainerHigh },
              ]}
            >
              <GoalCard goal={goal} />
              {calculating ? (
                <Text style={[ct.text.caption, { color: c.onSurfaceVariant }]}>
                  Still calculating ({goal.status_percent_calculated}%). Numbers
                  may change.
                </Text>
              ) : null}
            </View>

            <Text
              style={[
                ct.text.label,
                { color: c.onSurfaceVariant, marginTop: ct.space.xs },
              ]}
            >
              Insights
            </Text>

            <View style={{ flexDirection: "row", gap: ct.space.lg }}>
              <StatCard
                value={`${stats.streak} ${goal.delta}${stats.streak === 1 ? "" : "s"}`}
                subtitle="Current streak"
                icon={(color) => <Feather name="zap" size={20} color={color} />}
                iconBackgroundColor={c.accent.amber.colorContainer}
                iconTintColor={c.accent.amber.onColorContainer}
              />
              <StatCard
                value={
                  stats.successRate === null
                    ? "—"
                    : `${Math.round(stats.successRate * 100)}%`
                }
                subtitle="Success rate"
                icon={(color) => (
                  <Feather name="check-circle" size={20} color={color} />
                )}
                iconBackgroundColor={c.accent.green.colorContainer}
                iconTintColor={c.accent.green.onColorContainer}
              />
            </View>

            <View style={{ flexDirection: "row", gap: ct.space.lg }}>
              <StatCard
                value={
                  stats.best ? formatDuration(stats.best.actual_seconds) : "—"
                }
                subtitle={goal.is_inverse ? "Lowest period" : "Best period"}
                icon={(color) => (
                  <Feather name="award" size={20} color={color} />
                )}
                iconBackgroundColor={c.accent.violet.colorContainer}
                iconTintColor={c.accent.violet.onColorContainer}
              />
              <StatCard
                value={formatDuration(stats.avgActual)}
                subtitle={`Avg per ${goal.delta}`}
                icon={(color) => (
                  <Feather name="bar-chart-2" size={20} color={color} />
                )}
                iconBackgroundColor={c.accent.teal.colorContainer}
                iconTintColor={c.accent.teal.onColorContainer}
              />
            </View>

            {stats.trendPct !== null ? (
              <StatCard
                value={`${stats.trendPct >= 0 ? "+" : ""}${Math.round(stats.trendPct)}%`}
                subtitle="Recent trend vs previous periods"
                icon={(color) => (
                  <Feather
                    name={
                      stats.trendPct! >= 0 ? "trending-up" : "trending-down"
                    }
                    size={20}
                    color={color}
                  />
                )}
                iconBackgroundColor={c.accent.coral.colorContainer}
                iconTintColor={c.accent.coral.onColorContainer}
              />
            ) : null}

            <Section title="History" c={c}>
              <GoalChart points={goal.chart_data} />
            </Section>

            <Section title="Tracks" c={c}>
              {hasScope ? (
                <>
                  <ScopeChips label="Projects" items={goal.projects} c={c} />
                  <ScopeChips label="Languages" items={goal.languages} c={c} />
                  <ScopeChips label="Editors" items={goal.editors} c={c} />
                </>
              ) : (
                <Text style={[ct.text.body, { color: c.onSurfaceVariant }]}>
                  All activity
                </Text>
              )}
            </Section>

            <Section title="Rules" c={c}>
              <InfoRow
                label="Period"
                value={goal.delta === "day" ? "Daily" : "Weekly"}
                c={c}
              />
              <InfoRow
                label="Target"
                value={`${formatDuration(goal.seconds)} per ${goal.delta}`}
                c={c}
              />
              <InfoRow
                label="Mode"
                value={goal.is_inverse ? "Stay under" : "Reach"}
                c={c}
              />
              {goal.improve_by_percent > 0 ? (
                <InfoRow
                  label="Improve by"
                  value={`${goal.improve_by_percent}% each ${goal.delta}`}
                  c={c}
                />
              ) : null}
              {goal.delta === "day" ? (
                <InfoRow
                  label="Ignored days"
                  value={
                    goal.ignore_days.length
                      ? goal.ignore_days.map(cap).join(", ")
                      : "None"
                  }
                  c={c}
                />
              ) : null}
              <InfoRow
                label="Skips zero days"
                value={goal.ignore_zero_days ? "Yes" : "No"}
                c={c}
              />
              {!goal.is_current_user_owner ? (
                <InfoRow label="Ownership" value="Shared with you" c={c} />
              ) : null}
            </Section>

            <Section title="Details" c={c}>
              <InfoRow
                label="Created"
                value={formatShortDate(goal.created_at)}
                c={c}
              />
              {goal.modified_at ? (
                <InfoRow
                  label="Last changed"
                  value={formatShortDate(goal.modified_at)}
                  c={c}
                />
              ) : null}
              {goal.is_snoozed && goal.snooze_until ? (
                <InfoRow
                  label="Snoozed until"
                  value={formatShortDate(goal.snooze_until)}
                  c={c}
                />
              ) : null}
              <InfoRow
                label="Updated"
                value={timeAgo(result?.cachedAt)}
                c={c}
              />
            </Section>
          </>
        )}
      </ScrollView>
    </View>
  );
}
