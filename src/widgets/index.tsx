import React from "react";
import {
  FlexWidget,
  TextWidget,
  type ColorProp,
} from "react-native-android-widget";

import colors from "@/src/constants/colors";
import { ct } from "@/src/constants/styles.common";

const hex = (value: string): ColorProp => value as ColorProp;

// Same roles the app uses on home: card = surfaceContainerHigh,
// icon circle = secondary/onSecondary (StatCard), separators = outlineVariant.
export const C = {
  bg: hex(colors.dark.surfaceContainerHigh),
  on: hex(colors.dark.onSurface),
  variant: hex(colors.dark.onSurfaceVariant),
  secondary: hex(colors.dark.secondary),
  onSecondary: hex(colors.dark.onSecondary),
  separator: hex(colors.dark.outlineVariant),

  // violet → amber → teal → coral → green (same order as the app charts)
  series: [
    hex(colors.dark.accent.violet.color),
    hex(colors.dark.accent.amber.color),
    hex(colors.dark.accent.teal.color),
    hex(colors.dark.accent.coral.color),
    hex(colors.dark.accent.green.color),
  ],
} as const;

export type Slice = {
  name: string;
  percent: number;
};

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

// Both widgets share this shell. Radius matches StatCard (2xl).
const shell = {
  height: "match_parent",
  width: "match_parent",
  backgroundColor: C.bg,
  borderRadius: ct.radius["2xl"],
} as const;

// Same anatomy as StatCard: value + subtitle, with a secondary-tone circle.
// The circle is the refresh action.
function Header({ value, subtitle }: { value: string; subtitle: string }) {
  return (
    <FlexWidget
      style={{
        width: "match_parent",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <FlexWidget style={{ flexDirection: "column" }}>
        <TextWidget
          text={value}
          style={{
            fontSize: ct.fontSize.title,
            fontFamily: ct.fontFamily.semibold,
            color: C.on,
          }}
        />
        <TextWidget
          text={subtitle}
          style={{
            fontSize: ct.fontSize.lg,
            fontFamily: ct.fontFamily.regular,
            color: C.variant,
          }}
        />
      </FlexWidget>

      <FlexWidget
        clickAction="REFRESH"
        style={{
          width: ct.size.icon,
          height: ct.size.icon,
          borderRadius: ct.radius.full,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: C.secondary,
        }}
      >
        <TextWidget
          text="↻"
          style={{
            fontSize: ct.fontSize["3xl"],
            fontFamily: ct.fontFamily.semibold,
            color: C.onSecondary,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}

function StackedBar({ slices }: { slices: Slice[] }) {
  const total = slices.reduce((sum, s) => sum + s.percent, 0);
  const children = slices.flatMap((slice, index) => {
    const segment = (
      <FlexWidget
        key={`seg-${slice.name}`}
        style={{
          width: (slice.percent / total) * 100,
          height: "match_parent",
          backgroundColor: C.series[index % C.series.length],
        }}
      />
    );

    if (index === slices.length - 1) return [segment];

    return [
      segment,
      <FlexWidget
        key={`sep-${slice.name}`}
        style={{
          width: 1,
          height: "match_parent",
          backgroundColor: C.separator,
        }}
      />,
    ];
  });

  return (
    <FlexWidget
      style={{
        width: "match_parent",
        height: 20,
        flexDirection: "row",
        borderRadius: ct.radius.full,
        overflow: "hidden",
      }}
    >
      {children}
    </FlexWidget>
  );
}
// Mirrors HorizontalBreakdownChart legend rows: dot, label, trailing %.
function Legend({ slices }: { slices: Slice[] }) {
  return (
    <FlexWidget style={{ width: "match_parent", flexDirection: "column" }}>
      {slices.map((slice, index) => (
        <FlexWidget
          key={slice.name}
          style={{
            width: "match_parent",
            height: 22,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <FlexWidget
            style={{
              width: ct.size.dot,
              height: ct.size.dot,
              borderRadius: ct.radius.full,
              backgroundColor: C.series[index % C.series.length],
              marginRight: ct.space.md,
            }}
          />
          <FlexWidget style={{ flex: 1 }}>
            <TextWidget
              text={slice.name}
              maxLines={1}
              style={{
                fontSize: ct.fontSize.md,
                fontFamily: ct.fontFamily.regular,
                color: C.on,
              }}
            />
          </FlexWidget>
          <TextWidget
            text={`${Math.round(slice.percent)}%`}
            style={{
              fontSize: ct.fontSize.md,
              fontFamily: ct.fontFamily.regular,
              color: C.variant,
            }}
          />
        </FlexWidget>
      ))}
    </FlexWidget>
  );
}

export function TodayPillWidget({ data }: { data: WidgetData }) {
  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        ...shell,
        justifyContent: "center",
        paddingHorizontal: ct.space.lg,
      }}
    >
      <Header value={data.today} subtitle="today" />
    </FlexWidget>
  );
}

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

  const slices = sliceMap[stat]
    .filter((s) => s.percent > 0)
    .slice(0, 4)
    .map((s) => ({ ...s, percent: Math.min(100, s.percent) }));

  return (
    <FlexWidget
      clickAction="OPEN_APP"
      style={{
        ...shell,
        flexDirection: "column",
        padding: ct.space.lg,
      }}
    >
      <Header value={data.today} subtitle={`${STAT_LABELS[stat]} today`} />

      {slices.length > 0 ? (
        <FlexWidget
          style={{
            width: "match_parent",
            flexDirection: "column",
            marginTop: ct.space.lg,
          }}
        >
          <StackedBar slices={slices} />
          <FlexWidget style={{ width: "match_parent", marginTop: ct.space.md }}>
            <Legend slices={slices} />
          </FlexWidget>
        </FlexWidget>
      ) : (
        <FlexWidget
          style={{
            flex: 1,
            width: "match_parent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <TextWidget
            text="No data"
            style={{
              fontSize: ct.fontSize.md,
              fontFamily: ct.fontFamily.regular,
              color: C.variant,
            }}
          />
        </FlexWidget>
      )}
    </FlexWidget>
  );
}
