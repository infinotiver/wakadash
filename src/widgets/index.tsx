import React from "react";
import {
  FlexWidget,
  TextWidget,
  type ColorProp,
} from "react-native-android-widget";

import colors from "@/src/constants/colors";
import { ct } from "@/src/constants/styles.common";

const hex = (value: string): ColorProp => value as ColorProp;

export const C = {
  bg: hex(colors.dark.surfaceContainerHigh),
  on: hex(colors.dark.onSurface),
  variant: hex(colors.dark.onSurfaceVariant),
  primary: hex(colors.dark.primary),
  series: [
    hex(colors.dark.accent.violet.color),
    hex(colors.dark.accent.amber.color),
    hex(colors.dark.accent.teal.color),
    hex(colors.dark.accent.coral.color),
    hex(colors.dark.accent.green.color),
  ],
} as const;

export type Slice = { name: string; percent: number };

export type StatKey = "languages" | "projects" | "system";

export const STAT_LABELS: Record<StatKey, string> = {
  languages: "Languages",
  projects: "Projects",
  system: "System",
};

export type WidgetData = {
  today: string;
  topLanguages: Slice[];
  topProjects: Slice[];
  topOS: Slice[];
};

export const EMPTY: WidgetData = {
  today: "—",
  topLanguages: [],
  topProjects: [],
  topOS: [],
};

const shell = {
  height: "match_parent",
  width: "match_parent",
  backgroundColor: C.bg,
  borderRadius: ct.radius["2xl"],
} as const;

function RefreshDot() {
  return (
    <FlexWidget
      clickAction="REFRESH"
      style={{
        width: ct.size.icon,
        height: ct.size.icon,
        borderRadius: ct.radius.full,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <TextWidget
        text="↻"
        style={{ fontSize: ct.fontSize["2xl"], color: C.primary }}
      />
    </FlexWidget>
  );
}

function StatRow({ slice, index }: { slice: Slice; index: number }) {
  return (
    <FlexWidget
      style={{
        flexDirection: "row",
        alignItems: "center",
        width: "match_parent",
      }}
    >
      <FlexWidget
        style={{
          width: ct.size.dot,
          height: ct.size.dot,
          borderRadius: ct.radius.full,
          backgroundColor: C.series[index % C.series.length],
        }}
      />
      <TextWidget
        text={slice.name}
        maxLines={1}
        style={{
          fontSize: ct.fontSize.sm,
          fontFamily: ct.fontFamily.regular,
          color: C.on,
        }}
      />
      <TextWidget
        text={`${Math.round(slice.percent)}%`}
        style={{
          fontSize: ct.fontSize.sm,
          fontFamily: ct.fontFamily.semibold,
          color: C.variant,
        }}
      />
    </FlexWidget>
  );
}

// 2x1 — today's total with an inline refresh tap target
export function TodayPillWidget({ data }: { data: WidgetData }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        ...shell,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: ct.space.lg,
      }}
    >
      <FlexWidget style={{ flexDirection: "column" }}>
        <TextWidget
          text={data.today}
          style={{
            fontSize: ct.fontSize.title,
            fontFamily: ct.fontFamily.bold,
            color: C.on,
          }}
        />
        <TextWidget
          text="TODAY"
          style={{
            fontSize: ct.fontSize.xs,
            fontFamily: ct.fontFamily.semibold,
            color: C.variant,
          }}
        />
      </FlexWidget>
      <RefreshDot />
    </FlexWidget>
  );
}

// 4x2 — shows a single configured stat as a flat list
export function TopBreakdownWidget({
  data,
  stat = "languages",
}: {
  data: WidgetData;
  stat?: StatKey;
}) {
  const sliceMap: Record<StatKey, Slice[]> = {
    languages: data.topLanguages,
    projects: data.topProjects,
    system: data.topOS,
  };
  const slices = sliceMap[stat];

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{ ...shell, flexDirection: "column", padding: ct.space.md }}
    >
      <FlexWidget
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          width: "match_parent",
        }}
      >
        <TextWidget
          text={data.today}
          style={{
            fontSize: ct.fontSize["2xl"],
            fontFamily: ct.fontFamily.bold,
            color: C.on,
          }}
        />
        <RefreshDot />
      </FlexWidget>

      <TextWidget
        text={STAT_LABELS[stat].toUpperCase()}
        style={{
          fontSize: ct.fontSize.xs,
          fontFamily: ct.fontFamily.semibold,
          color: C.variant,
        }}
      />

      {slices.length ? (
        slices
          .slice(0, 5)
          .map((s, i) => <StatRow key={s.name} slice={s} index={i} />)
      ) : (
        <TextWidget
          text="No data"
          style={{
            fontSize: ct.fontSize.sm,
            fontFamily: ct.fontFamily.regular,
            color: C.variant,
          }}
        />
      )}
    </FlexWidget>
  );
}

