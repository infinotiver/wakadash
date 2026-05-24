import { StyleSheet } from "react-native";

/**
 * Common typography and spacing constants
 */
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 16,
  full: 20,
} as const;

export const FONT_SIZES = {
  xs: 10,
  sm: 11,
  base: 12,
  md: 13,
  lg: 14,
  xl: 15,
  "2xl": 16,
  "3xl": 18,
  "4xl": 20,
  "5xl": 22,
  "6xl": 24,
  "7xl": 28,
  "8xl": 32,
  "9xl": 44,
} as const;

export const FONT_WEIGHTS = {
  regular: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
} as const;

/**
 * Common layout and container styles
 */
export const commonStyles = StyleSheet.create({
  // Flexbox utilities
  flex: { flex: 1 },
  row: { flexDirection: "row" },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  col: { flexDirection: "column" },
  center: { justifyContent: "center", alignItems: "center" },

  // Scroll and containers
  scroll: { flex: 1 },
  container: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  screenContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },

  // Cards and sections
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
  },
  section: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl - 6,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  sectionSmall: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    gap: SPACING.xs,
  },

  // Hero card
  heroCard: {
    borderRadius: RADIUS.xl + 2,
    padding: SPACING.xl,
    gap: SPACING.xs,
  },

  // Progress/loading
  progressBar: {
    height: 4,
    borderRadius: RADIUS.sm,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: RADIUS.sm,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    width: "100%",
    height: "90%",
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },

  // Button styles
  button: {
    paddingVertical: SPACING.md + 4,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonSmall: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
  },
  buttonText: {
    fontWeight: "600",
    textAlign: "center",
    fontSize: FONT_SIZES.lg,
  },

  // Input styles
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    height: 54,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    height: "100%",
  },

  // Empty state
  emptyWrap: { alignItems: "center", gap: SPACING.md, marginTop: 60 },
  empty: {
    fontSize: FONT_SIZES.lg,
    textAlign: "center",
    paddingVertical: 20,
  },

  // Error styles
  errorContainer: {
    borderRadius: RADIUS.md,
    overflow: "hidden",
    padding: SPACING.lg,
  },
  error: {
    fontSize: FONT_SIZES.lg,
    textAlign: "center",
    marginTop: SPACING.lg,
  },
});

/**
 * Typography utilities
 */
export const typographies = StyleSheet.create({
  // Page headers
  pageTitle: {
    fontSize: FONT_SIZES["7xl"],
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
  pageSubtitle: {
    fontSize: FONT_SIZES.lg,
    fontFamily: "Inter_400Regular",
  },

  // Section headers
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: "Inter_600SemiBold",
    marginBottom: SPACING.md,
  },
  sectionTitleSmall: {
    fontSize: FONT_SIZES.base,
    fontFamily: "Inter_600SemiBold",
    marginBottom: SPACING.sm,
  },

  // Hero text
  heroLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTime: {
    fontSize: FONT_SIZES["9xl"],
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  heroSub: {
    fontSize: FONT_SIZES.lg,
    fontFamily: "Inter_400Regular",
    marginTop: SPACING.xs,
  },

  // Card labels
  label: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  labelSmall: {
    fontSize: FONT_SIZES.xs,
    fontFamily: "Inter_500Medium",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  // Values
  value: {
    fontSize: FONT_SIZES["5xl"],
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  valueSmall: {
    fontSize: FONT_SIZES["2xl"],
    fontFamily: "Inter_700Bold",
  },

  // Body text
  body: {
    fontSize: FONT_SIZES.md,
    fontFamily: "Inter_400Regular",
  },
  bodySemibold: {
    fontSize: FONT_SIZES.md,
    fontFamily: "Inter_500Medium",
  },

  // Small text
  caption: {
    fontSize: FONT_SIZES.xs,
    fontFamily: "Inter_400Regular",
  },
  captionMedium: {
    fontSize: FONT_SIZES.xs,
    fontFamily: "Inter_500Medium",
  },
});
