import React from "react";
import { Pressable, Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";
import type { WakaGoal } from "@/src/types/wakatime";
import { GoalStatusChip } from "@/src/components/GoalStatusChip";
import { computeGoalStats, currentPoint, goalTitle } from "@/src/utils/goals";

interface Props {
  goal: WakaGoal;
  onPress?: () => void;
}

export function GoalCard({ goal, onPress }: Props) {
  const c = useColors();
  const latest = currentPoint(goal);
  const actual = latest?.actual_seconds ?? 0;
  const target = latest?.goal_seconds ?? goal.seconds;
  const pct = target > 0 ? Math.min(100, (actual / target) * 100) : 0;

  const met = goal.is_inverse ? actual <= target : actual >= target;
  const ignored = goal.status === "ignored";
  const inverseExceeded = goal.is_inverse && actual > target;
  const fill = ignored
    ? c.outline
    : inverseExceeded
      ? c.error
      : met
        ? c.primary
        : c.tertiary;

  const { streak } = computeGoalStats(goal.chart_data, goal.is_inverse);
  const paused = !goal.is_enabled || goal.is_snoozed;

  const content = (backgroundColor = c.surfaceContainerHigh) => (
    <View
      style={{
        gap: ct.space.md,
        padding: ct.space.lg,
        borderRadius: ct.radius["2xl"],
        backgroundColor,
        opacity: paused ? 0.6 : 1,
      }}
    >
      <View style={{ gap: ct.space.xs }}>
        <View style={[ct.styles.rowBetween, { gap: ct.space.md }]}>
          <Text
            style={[
              ct.text.bodySemibold,
              {
                color: ignored ? c.onSurfaceVariant : c.onSurface,
                flex: 1,
              },
            ]}
          >
            {goalTitle(goal)}
          </Text>
          <GoalStatusChip status={goal.status} />
        </View>
        <Text
          style={{
            color: ignored
              ? c.onSurfaceVariant
              : inverseExceeded
                ? c.error
                : c.onSurface,
            fontFamily: ct.fontFamily.semibold,
            fontSize: ct.fontSize.lg,
          }}
        >
          {latest?.actual_seconds_text ?? "0m"} /{" "}
          {latest?.goal_seconds_text ?? "—"}
        </Text>
      </View>

      <View
        style={{
          height: 10,
          borderRadius: ct.radius.full,
          backgroundColor: c.secondaryContainer,
          overflow: "hidden",
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: "100%",
            backgroundColor: fill,
            borderRadius: ct.radius.full,
          }}
        />
      </View>

      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: ct.space.md,
        }}
      >
        <Text style={[ct.text.caption, { color: c.onSurfaceVariant, flex: 1 }]}>
          {goal.range_text}
        </Text>
        <View style={{ alignItems: "flex-end", gap: ct.space.xs }}>
          {goal.is_inverse ? (
            <Text
              style={[
                ct.text.captionMedium,
                { color: inverseExceeded ? c.error : c.tertiary },
              ]}
            >
              Stay under
            </Text>
          ) : null}
          {streak > 0 ? (
            <Text
              style={[ct.text.captionMedium, { color: c.onSurfaceVariant }]}
            >
              {streak}-{goal.delta} streak
            </Text>
          ) : null}
          {paused ? (
            <Text
              style={[ct.text.captionMedium, { color: c.onSurfaceVariant }]}
            >
              {goal.is_enabled ? "Snoozed" : "Disabled"}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );

  if (!onPress) return content();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${goalTitle(goal)} goal details`}
      style={{ borderRadius: ct.radius["2xl"] }}
    >
      {({ pressed }) =>
        content(pressed ? c.tertiaryContainer : c.surfaceContainerHigh)
      }
    </Pressable>
  );
}
