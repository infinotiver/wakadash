import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
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
  useWeekSummaries,
  useWindowSummaries,
} from "@/src/hooks/useWakaTimeQueries";

import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

const styles = ct.styles.overview;

export default function TodayScreen() {
  const colors = useColors();
  const router = useRouter();
  const [iosPickerOpen, setIosPickerOpen] = useState(false);
  const onPickDate = (event: DateTimePickerEvent, picked?: Date) => {
    if (Platform.OS === "ios") setIosPickerOpen(false);
    if (event.type === "set" && picked) selectDate(toDateKey(picked));
  };

  const openPicker = () => {
    if (Platform.OS === "android") {
      DateTimePickerAndroid.open({
        design: "material",
        title: "Select date to view",
        value: new Date(`${date}T12:00:00`),
        mode: "date",
        maximumDate: new Date(), // can't pick the future
        onChange: onPickDate,
      });
    } else {
      setIosPickerOpen(true);
    }
  };

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

  // Never go past today.
  const step = (delta: number) => selectDate(shiftDateKey(date, delta));

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

      {/* iOS: Android uses the native dialog via DateTimePickerAndroid */}
      {Platform.OS === "ios" && iosPickerOpen ? (
        <Modal
          transparent
          animationType="fade"
          onRequestClose={() => setIosPickerOpen(false)}
        >
          <Pressable
            style={{
              flex: 1,
              backgroundColor: "#00000066",
              justifyContent: "center",
              padding: ct.space.lg,
            }}
            onPress={() => setIosPickerOpen(false)}
          >
            <Pressable
              onPress={() => {}} // swallow taps so the card doesn't dismiss
              style={{
                backgroundColor: colors.surfaceContainerHigh,
                borderRadius: ct.radius["2xl"],
                padding: ct.space.md,
              }}
            >
              <DateTimePicker
                value={new Date(`${date}T12:00:00`)}
                mode="date"
                display="inline"
                maximumDate={new Date()}
                accentColor={colors.primary}
                onChange={onPickDate}
              />
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}

      <ScrollView
        style={ct.styles.scroll}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-end",
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

            {/* Breakdown group */}
            <View
              style={[
                ct.styles.flex,
                {
                  paddingTop: ct.padding["2xl"],
                  paddingBottom: 64 + ct.space["2xl"],
                  paddingHorizontal: ct.padding["xl"],
                  backgroundColor: colors.surfaceContainerLow,
                  borderTopLeftRadius: ct.radius["3xl"],
                  borderTopRightRadius: ct.radius["3xl"],
                  gap: ct.padding.md,
                },
              ]}
            >
              <DashboardBreakdownSection
                title="Languages"
                chartColors={languageColors}
                onPress={() =>
                  router.push({
                    pathname: "/breakdown",
                    params: { category: "languages" },
                  })
                }
                items={(selected?.languages ?? []).slice(0, 4).map((item) => ({
                  name: item.name,
                  percent: item.percent,
                  trailingText: item.text ?? "",
                }))}
              />
              <DashboardBreakdownSection
                title="Editors"
                chartColors={chartColors}
                onPress={() =>
                  router.push({
                    pathname: "/breakdown",
                    params: { category: "editors" },
                  })
                }
                items={(selected?.editors ?? []).slice(0, 4).map((item) => ({
                  name: item.name,
                  percent: item.percent,
                  trailingText: item.text ?? "",
                }))}
              />
              <DashboardBreakdownSection
                title="Projects"
                chartColors={chartColors}
                onPress={() =>
                  router.push({
                    pathname: "/breakdown",
                    params: { category: "projects" },
                  })
                }
                items={(selected?.projects ?? []).slice(0, 4).map((item) => ({
                  name: item.name,
                  percent: item.percent,
                  trailingText: item.text ?? "",
                }))}
              />
              <DashboardBreakdownSection
                title="Operating Systems"
                chartColors={chartColors}
                items={(selected?.operating_systems ?? [])
                  .slice(0, 4)
                  .map((item) => ({
                    name: item.name,
                    percent: item.percent,
                    trailingText: item.text ?? "",
                  }))}
              />

              {/* Last 7 Days */}
              <View
                style={{
                  backgroundColor: colors.surfaceContainerLow,
                  padding: ct.padding["md"],
                  gap: ct.padding.md,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    gap: ct.space.md,
                  }}
                >
                  <View style={{ flex: 1 }}>
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
                        fontSize: ct.fontSize.md,
                        fontFamily: ct.fontFamily.medium,
                        color: colors.onSurfaceVariant,
                        marginTop: ct.space.xs,
                      }}
                    >
                      {formatDuration(weekTotal)}
                    </Text>
                  </View>
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
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
