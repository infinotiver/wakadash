import { StyleSheet } from "react-native";
import { SPACING, RADIUS, FONT_SIZES } from "./styles.common";

/**
 * StatCard component styles
 */
export const statCardStyles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  label: {
    fontSize: FONT_SIZES.xs,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  value: {
    fontSize: FONT_SIZES["5xl"],
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Inter_400Regular",
  },
});

/**
 * BreakdownItem component styles
 */
export const breakdownItemStyles = StyleSheet.create({
  container: {
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    flex: 1,
    fontSize: FONT_SIZES.lg,
    fontFamily: "Inter_500Medium",
  },
  time: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Inter_400Regular",
  },
  percent: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Inter_500Medium",
    width: 44,
    textAlign: "right",
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 2,
  },
});

/**
 * WeeklyChart component styles
 */
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

/**
 * TabIcon component styles (for navigation)
 */
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
  label: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZES.xs,
    lineHeight: 14,
    maxWidth: 64,
    textAlign: "center",
    fontFamily: "Inter_500Medium",
  },
});
