import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { useColors } from "@/src/hooks/useColors";
import { useWakaTime } from "@/src/context/WakaTimeContext";

import { AppBar } from "@/src/components/AppBar";
import { DashboardBreakdownSection } from "@/src/components/DashboardBreakdownSection";
import { StatCard } from "@/src/components/StatCard";
import { WeeklyChart } from "@/src/components/charts/WeeklyChart";
import { CategoryPieChart } from "@/src/components/charts/CategoryPieChart";

import { ct } from "@/src/constants/styles.common";
import { formatWakaTimeError } from "@/src/api/wakatime";
import {
  averageSummarySeconds,
  buildLanguageColorMap,
  dayHeading,
  formatDateRange,
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

  const [picked, setPicked] = useState<string | null>(null); // null = today
  const [windowEnd, setWindowEnd] = useState<string | null>(null); // null = today
  const todayKey = toDateKey(new Date());
  const date = picked ?? todayKey;
  const isToday = date === todayKey;
  const dayLabel = isToday ? "Today" : "That day";
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
  const topProject = selected?.projects?.[0];

  const loading = dayQ.isLoading || weekQ.isLoading;
  const failed = dayQ.isError || weekQ.isError;
  const failure = dayQ.error ?? weekQ.error;

  const langColorMap = buildLanguageColorMap(langMetaQ.data);
  const languageColors = (selected?.languages ?? [])
    .slice(0, 4)
    .map(
      (item, i) =>
        langColorMap.get(item.name.toLowerCase()) ??
        colors.chart.languages[i % colors.chart.languages.length],
    );

  const windowTitle =
    windowEnd === null
      ? "Past 7 Days"
      : formatDateRange(windowStartKey, windowEndKey);

  const breakdownSections = [
    {
      key: "languages",
      title: "Languages",
      colors: languageColors,
      rawItems: selected?.languages ?? [],
    },
    {
      key: "editors",
      title: "Editors",
      colors: colors.chart.editors,
      rawItems: selected?.editors ?? [],
    },
    {
      key: "projects",
      title: "Projects",
      colors: colors.chart.projects,
      rawItems: selected?.projects ?? [],
    },
    {
      key: "operating_systems",
      title: "Operating Systems",
      colors: colors.chart.operating_systems,
      rawItems: selected?.operating_systems ?? [],
    },
  ];

  const categoryItems = (selected?.categories ?? [])
    .slice(0, 5)
    .map((item) => ({
      name: item.name,
      percent: item.percent,
      total_seconds: item.total_seconds,
      text: formatDuration(item.total_seconds),
    }));

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
                {formatWakaTimeError(failure)}
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

              <View
                style={[
                  styles.row,
                  styles.cardSpacing,
                  {
                    alignItems: "stretch",
                    marginHorizontal: ct.padding.xl,
                  },
                ]}
              >
                {hasCategories && (
                  <View style={{ flex: 3 }}>
                    <CategoryPieChart
                      items={categoryItems}
                      totalLabel={dayLabel}
                    />
                  </View>
                )}

                <View
                  style={{
                    flex: hasCategories ? 2 : 1,
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
                        <MaterialCommunityIcons
                          name="clock-outline"
                          size={20}
                          color={tint}
                        />
                      )}
                      iconTintColor={colors.accent.teal.onColor}
                      iconBackgroundColor={colors.accent.teal.color}
                      containerBackgroundColor={
                        colors.accent.teal.colorContainer
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <StatCard
                      value={formatDuration(weekAvg)}
                      subtitle="7-day avg"
                      icon={(tint) => (
                        <MaterialCommunityIcons
                          name="chart-bar"
                          size={20}
                          color={tint}
                        />
                      )}
                      iconTintColor={colors.accent.violet.onColor}
                      iconBackgroundColor={colors.accent.violet.color}
                      containerBackgroundColor={
                        colors.accent.violet.colorContainer
                      }
                    />
                  </View>

                  <View style={{ flex: 1 }}>
                    <StatCard
                      value={
                        bestDay
                          ? formatDuration(bestDay.grand_total.total_seconds)
                          : "-"
                      }
                      subtitle="Best day"
                      icon={(tint) => (
                        <MaterialCommunityIcons
                          name="trophy-award"
                          size={20}
                          color={tint}
                        />
                      )}
                      iconTintColor={colors.accent.amber.onColor}
                      iconBackgroundColor={colors.accent.amber.color}
                      containerBackgroundColor={
                        colors.accent.amber.colorContainer
                      }
                    />
                  </View>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{
                  marginVertical: ct.space.xs,
                }}
                contentContainerStyle={{
                  gap: ct.space.sm,
                  paddingHorizontal: ct.padding.xl,
                  paddingVertical: ct.space.xs,
                }}
              >
                {categoryItems.map((item, index) => (
                  <View
                    key={`${item.name}-${index}`}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: ct.space.xs,
                      paddingHorizontal: ct.space.sm,
                      paddingVertical: ct.space.sm,
                      borderRadius: ct.radius.full,
                      backgroundColor: colors.surfaceContainerHigh,
                    }}
                  >
                    <View
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: ct.radius.full,
                        backgroundColor:
                          colors.chart.categories[
                            index % colors.chart.categories.length
                          ],
                      }}
                    />
                    <Text
                      numberOfLines={1}
                      style={[ct.text.caption, { color: colors.onSurface }]}
                    >
                      {item.name}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        ct.text.captionMedium,
                        { color: colors.onSurfaceVariant },
                      ]}
                    >
                      {item.text}
                    </Text>
                  </View>
                ))}
              </ScrollView>

              <View
                style={[
                  styles.cardSpacing,
                  {
                    backgroundColor: colors.surfaceContainerHigh,
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
                    borderTopLeftRadius: ct.radius["2xl"],
                    borderTopRightRadius: ct.radius["2xl"],
                    gap: ct.padding.md,
                  },
                ]}
              >
                {breakdownSections.map((sec) => {
                  const top4 = sec.rawItems.slice(0, 4).map((item) => ({
                    name: item.name,
                    percent: item.percent,
                    trailingText: formatDuration(item.total_seconds),
                  }));

                  return (
                    <DashboardBreakdownSection
                      key={sec.key}
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
