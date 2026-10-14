import React, { useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { ct } from "@/src/constants/styles.common";
import type { WakaGoalChartPoint } from "@/src/types/wakatime";
import { GoalStatusChip } from "@/src/components/GoalStatusChip";
import { pointLabel, statusMeta } from "@/src/utils/goals";

const MAX_BARS = 14;
const CHART_HEIGHT = 120;

interface Props {
  points: WakaGoalChartPoint[];
}

export function GoalChart({ points }: Props) {
  const c = useColors();
  const visible = useMemo(() => points.slice(-MAX_BARS), [points]);
  const [selected, setSelected] = useState<number | null>(null);

  if (visible.length === 0) return null;

  const activeIndex =
    selected !== null && selected < visible.length
      ? selected
      : visible.length - 1;
  const active = visible[activeIndex];

  const max = Math.max(
    1,
    ...visible.map((p) => Math.max(p.actual_seconds, p.goal_seconds)),
  );

  return (
    <View style={{ gap: ct.space.md }}>
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-end",
          height: CHART_HEIGHT,
          gap: ct.space.xs,
        }}
      >
        {visible.map((p, i) => {
          const meta = statusMeta(p.range_status, c);
          const isActive = i === activeIndex;
          const barPct = (p.actual_seconds / max) * 100;
          const targetPct = (p.goal_seconds / max) * 100;

          return (
            <Pressable
              key={`${p.range.start}-${i}`}
              onPress={() => setSelected(i)}
              accessibilityRole="button"
              accessibilityLabel={`${pointLabel(p)}, ${p.actual_seconds_text} of ${p.goal_seconds_text}, ${meta.label}`}
              accessibilityState={{ selected: isActive }}
              style={{ flex: 1, height: "100%", justifyContent: "flex-end" }}
            >
              {p.actual_seconds > 0 && (
                <View
                  style={{
                    width: "100%",
                    height: `${barPct}%`,
                    minHeight: 6,
                    borderRadius: ct.radius.full,
                    backgroundColor: isActive ? meta.color : meta.container,
                  }}
                />
              )}
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: `${targetPct}%`,
                  height: 2,
                  backgroundColor: c.onSurfaceVariant,
                }}
              />
            </Pressable>
          );
        })}
      </View>

      <View style={ct.styles.rowBetween}>
        <Text style={[ct.text.caption, { color: c.onSurfaceVariant }]}>
          {pointLabel(visible[0])}
        </Text>
        <Text style={[ct.text.caption, { color: c.onSurfaceVariant }]}>
          Line marks each period's goal
        </Text>
        <Text style={[ct.text.caption, { color: c.onSurfaceVariant }]}>
          {pointLabel(visible[visible.length - 1])}
        </Text>
      </View>

      <View
        style={{
          gap: ct.space.xs,
          padding: ct.space.lg,
          borderRadius: ct.radius.xl,
          backgroundColor: c.surfaceContainerHighest,
        }}
      >
        <View style={[ct.styles.rowBetween, { gap: ct.space.md }]}>
          <Text style={[ct.text.bodySemibold, { color: c.onSurface, flex: 1 }]}>
            {active.range.text ?? pointLabel(active)}
          </Text>
          <GoalStatusChip status={active.range_status} />
        </View>
        <Text style={[ct.text.body, { color: c.onSurfaceVariant }]}>
          {active.actual_seconds_text} of {active.goal_seconds_text}
        </Text>
        {active.range_status_reason ? (
          <Text style={[ct.text.caption, { color: c.onSurfaceVariant }]}>
            {active.range_status_reason}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
