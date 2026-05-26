import { StyleSheet } from "react-native";
import { SPACING, RADIUS, FONT_SIZES } from "./styles.common";

export const weeklyChartStyles = StyleSheet.create({
  container: {
    width: "100%",
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 120,
    gap: SPACING.xs,
  },
  barCol: {
    flex: 1,
    alignItems: "center",
    height: "100%",
    justifyContent: "flex-end",
    gap: SPACING.xs,
  },
  tooltip: {
    fontSize: FONT_SIZES.xs,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },
  barTrack: {
    flex: 1,
    width: "75%",
    justifyContent: "flex-end",
    borderRadius: RADIUS.sm,
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    borderRadius: RADIUS.sm,
  },
  dayLabel: {
    fontSize: FONT_SIZES.xs,
    textAlign: "center",
    fontFamily: "Inter_400Regular",
  },
});

export const tabIconStyles = StyleSheet.create({
  container: {
    width: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs + 2,
  },
  label: {
    fontSize: FONT_SIZES.base,
    fontFamily: "Inter_500Medium",
  },
});
