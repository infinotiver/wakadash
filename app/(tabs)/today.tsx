import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";

import { AppBar } from "@/src/components/AppBar";
import { DashboardBreakdownSection } from "@/src/components/DashboardBreakdownSection";
import { StatCard } from "@/src/components/StatCard";
import { WeeklyChart } from "@/src/components/WeeklyChart";
import { SetupScreen } from "@/src/components/SetupScreen";
import { CategoryPieChart } from "@/src/components/CategoryPieChart";

import { ct } from "@/src/constants/styles.common";
import {
  averageSummarySeconds,
  buildLanguageColorMap,
  dayHeading,
  formatDuration,
  shiftDateKey,
  toDateKey,
} from "@/src/utils/dashboard";

import {
  useDaySummary,
  useProgramLanguages,
  useWindowSummaries,
} from "@/src/hooks/useWakaTimeQueries";
import { useDatePicker } from "@/src/hooks/useDatePicker";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

const styles = ct.styles.overview;

export default function TodayScreen() {
  const colors = useColors();
  const router = useRouter();
  const { open, modal } = useDatePicker();
  const { isConfigured } = useWakaTime();

  const [picked, setPicked] = useState<string | null>(null); // null = today
  const [windowEnd, setWindowEnd] = useState<string | null>(null); // null = today
  const todayKey = toDateKey(new Date());
  const date = picked ?? todayKey;
  const isToday = date === todayKey;
  const dayLabel = isToday ? "today" : "that day";
  const windowEndKey = windowEnd ?? todayKey;
  const windowStartKey = shiftDateKey(windowEndKey, -6);

  const dayQ = useDaySummary(date);
  const prevKey = shiftDateKey(date, -1);
  const nextKey = shiftDateKey(date, 1);
  useDaySummary(prevKey);
  useDaySummary(nextKey <= todayKey ? nextKey : date); // date is already cached
  const weekQ = useWindowSummaries(windowEndKey);
  const langMetaQ = useProgramLanguages();

  const selectDate = (key: string) => {
    const next = key >= todayKey ? todayKey : key;

    if (next < windowStartKey) {
      setWindowEnd(next); // selected day becomes the right-most bar
    } else if (next > windowEndKey) {
      const end = shiftDateKey(next, 6); // selected day becomes the left-most bar
      setWindowEnd(end >= todayKey ? null : end);
    }

    setPicked(next === todayKey ? null : next);
  };

  const openPicker = () =>
    open({ value: date, title: "Select date to view", onPick: selectDate });

  // Never go past today.
  const step = (delta: number) => selectDate(shiftDateKey(date, delta));

  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-24, 24])
    .failOffsetY([-12, 12])
    .onEnd((e) => {
      if (e.translationX > 60) step(-1);
      else if (e.translationX < -60 && !isToday) step(1);
    });

  const refetch = useCallback(async () => {
    await Promise.allSettled([dayQ.refetch(), weekQ.refetch()]);
  }, [dayQ, weekQ]);

  if (!isConfigured) {
    return <SetupScreen />;
  }

  const selected = dayQ.data; // the selected day's summary
  const week = weekQ.data ?? [];

  const weekAvg = averageSummarySeconds(week);
  const weekTotal = week.reduce(
    (total, day) => total + (day.grand_total?.total_seconds ?? 0),
    0,
  );
  const hasCategories = (selected?.categories?.length ?? 0) > 0;
  const bestDay = week.reduce(
    (best, day) =>
      !best || day.grand_total.total_seconds > best.grand_total.total_seconds
        ? day
        : best,
    null as (typeof week)[number] | null,
  );

  const loading = dayQ.isLoading || weekQ.isLoading;
  const failed = dayQ.isError || weekQ.isError;

  const chartColors = [
    colors.accent.violet.color,
    colors.accent.amber.color,
    colors.accent.teal.color,
    colors.accent.coral.color,
    colors.accent.green.color,
  ];

  const groupStyle = {
    gap: ct.space.sm,
    backgroundColor: colors.surfaceContainerHighest,
    padding: ct.space.xs,
    borderRadius: ct.radius["2xl"],
  } as const;

  const langColorMap = buildLanguageColorMap(langMetaQ.data);
  const languageColors = (selected?.languages ?? [])
    .slice(0, 4)
    .map(
      (item, i) =>
        langColorMap.get(item.name.toLowerCase()) ??
        chartColors[i % chartColors.length],
    );

  const shortDay = (key: string) =>
    new Date(`${key}T12:00:00`).toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });

  const windowTitle =
    windowEnd === null
      ? "Last 7 Days"
      : `${shortDay(windowStartKey)} – ${shortDay(windowEndKey)}`;

  const breakdownSections = [
    {
      key: "languages",
      title: "Languages",
      route: "/languages" as const,
      colors: languageColors,
      rawItems: selected?.languages ?? [],
    },
    {
      key: "editors",
      title: "Editors",
      route: "/editors" as const,
      colors: chartColors,
      rawItems: selected?.editors ?? [],
    },
    {
      key: "projects",
      title: "Projects",
      route: "/projects" as const,
      colors: chartColors,
      rawItems: selected?.projects ?? [],
    },
    {
      key: "operating_systems",
      title: "Operating Systems",
      route: "/operating-systems" as const,
      colors: chartColors,
      rawItems: selected?.operating_systems ?? [],
    },
  ];

  return (
    <View
      style={[
        ct.styles.flex,
        {
          backgroundColor: colors.background,
        },
      ]}
    >
      <AppBar
        title={dayHeading(date, todayKey)}
        onTitlePress={openPicker}
        variant="center"
        elevated={false}
        leadingIcon="chevron-left"
        leadingLabel="Previous day"
        onLeadingPress={() => step(-1)}
        actions={[
          {
            icon: "chevron-right",
            label: "Next day",
            onPress: () => step(1),
            disabled: isToday,
          },
        ]}
      />

      {modal}
      <GestureDetector gesture={swipe}>
        <ScrollView
          style={[
            ct.styles.scroll,
            {
              opacity:
                dayQ.isPlaceholderData || weekQ.isPlaceholderData ? 0.5 : 1,
            },
          ]}
          contentContainerStyle={{
            flexGrow: 1,
          }}
          refreshControl={
            <RefreshControl
              refreshing={dayQ.isFetching || weekQ.isFetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
          {loading ? (
            <ActivityIndicator
              color={colors.primary}
              style={{
                marginTop: ct.size.loading,
              }}
            />
          ) : failed ? (
            <View
              style={[
                styles.errorCard,
                {
                  marginHorizontal: ct.padding.md,
                  backgroundColor: colors.errorContainer,
                  borderColor: colors.error,
                },
              ]}
            >
              <Text
                style={[
                  styles.errorText,
                  {
                    color: colors.onErrorContainer,
                  },
                ]}
              >
                Failed to load
              </Text>
            </View>
          ) : (
            <>
              {!selected ? (
                <Text
                  style={[
                    ct.text.body,
                    {
                      color: colors.onSurfaceVariant,
                      textAlign: "center",
                      marginTop: ct.space.lg,
                    },
                  ]}
                >
                  No activity recorded
                </Text>
              ) : null}

              {/* Top Row: Category Pie Chart + 3 Summary StatCards */}
              <View
                style={[
                  styles.row,
                  styles.cardSpacing,
                  {
                    alignItems: "stretch",
                  },
                ]}
              >
                {hasCategories && (
                  <View style={{ flex: 5 }}>
                    <CategoryPieChart
                      items={(selected?.categories ?? [])
                        .slice(0, 5)
                        .map((item) => ({
                          name: item.name,
                          percent: item.percent,
                          total_seconds: item.total_seconds,
                          text: item.text ?? "",
                        }))}
                      totalLabel={dayLabel}
                    />
                  </View>
                )}

                <View
                  style={{
                    flex: hasCategories ? 3 : 1,
                    gap: ct.padding.sm,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <StatCard
                      value={
                        selected
                          ? formatDuration(selected.grand_total.total_seconds)
                          : "-"
                      }
                      subtitle={dayLabel}
                      icon={(tint) => (
                        <Feather name="clock" size={20} color={tint} />
                      )}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <StatCard
                      value={formatDuration(weekAvg)}
                      subtitle="7-Day Avg"
                      icon={(tint) => (
                        <Feather name="bar-chart" size={20} color={tint} />
                      )}
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <StatCard
                      value={
                        bestDay
                          ? formatDuration(bestDay.grand_total.total_seconds)
                          : "-"
                      }
                      subtitle="best day"
                      icon={(tint) => (
                        <Feather name="award" size={20} color={tint} />
                      )}
                    />
                  </View>
                </View>
              </View>

              {/* Unified 7-Day Window Header + Interactive Weekly Chart */}
              <View
                style={[
                  styles.cardSpacing,
                  {
                    backgroundColor:
                      colors.surfaceContainer ?? colors.surfaceContainerHigh,
                    padding: ct.padding.lg,
                    borderRadius: ct.radius["2xl"],
                    gap: ct.padding.sm,
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    gap: ct.space.md,
                  }}
                >
                  <Text
                    style={[
                      styles.sectionTitle,
                      {
                        color: colors.onSurface,
                      },
                    ]}
                  >
                    {windowTitle}
                  </Text>
                  <Text
                    style={{
                      fontSize: ct.fontSize.sm,
                      fontFamily: ct.fontFamily.medium,
                      color: colors.onSurfaceVariant,
                    }}
                  >
                    {formatDuration(weekTotal)}
                  </Text>
                </View>

                {week.length ? (
                  <WeeklyChart
                    days={week}
                    selectedDate={date}
                    onSelectDate={selectDate}
                  />
                ) : (
                  <Text
                    style={[
                      styles.empty,
                      {
                        color: colors.onSurfaceVariant,
                      },
                    ]}
                  >
                    No data available
                  </Text>
                )}
              </View>

              {/* Breakdown Bottom Sheet Group */}
              <View
                style={[
                  ct.styles.flex,
                  {
                    paddingTop: ct.padding["2xl"],
                    paddingBottom: 64 + ct.space["2xl"],
                    paddingHorizontal: ct.padding.xl,
                    backgroundColor: colors.surfaceContainerLow,
                    borderTopLeftRadius: ct.radius["3xl"],
                    borderTopRightRadius: ct.radius["3xl"],
                    gap: ct.padding.md,
                  },
                ]}
              >
                {breakdownSections.map((sec) => {
                  const top4 = sec.rawItems.slice(0, 4).map((item) => ({
                    name: item.name,
                    percent: item.percent,
                    trailingText: item.text ?? "",
                  }));

                  return (
                    <View key={sec.key} style={groupStyle}>
                      <DashboardBreakdownSection
                        title={sec.title}
                        chartColors={sec.colors}
                        items={top4}
                        onPress={() =>
                          router.push({
                            pathname: "/breakdown",
                            params: { category: sec.key },
                          })
                        }
                      />

                      {/* Uniform, full-width footer row to open multi-range CategoryScreen */}
                      <Pressable
                        onPress={() => router.push(sec.route)}
                        accessibilityRole="button"
                        accessibilityLabel={`View all ${sec.title}`}
                        style={({ pressed }) => ({
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingHorizontal: ct.padding.md,
                          paddingVertical: ct.space.sm,
                          borderTopWidth: 1,
                          borderTopColor: colors.outlineVariant + "40",
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Text
                          style={{
                            fontSize: ct.fontSize.xs,
                            fontFamily: ct.fontFamily.medium,
                            color: colors.onSurfaceVariant,
                          }}
                        >
                          View all {sec.title.toLowerCase()}
                        </Text>
                        <Feather
                          name="chevron-right"
                          size={16}
                          color={colors.onSurfaceVariant}
                        />
                      </Pressable>
                    </View>
                  );
                })}
              </View>
            </>
          )}
        </ScrollView>
      </GestureDetector>
    </View>
  );
}
