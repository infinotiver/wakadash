import { StyleSheet } from "react-native";

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
  full: 999,
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

export const commonStyles = StyleSheet.create({
  // Layout
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.lg,
  },
  flex: { flex: 1 },
  row: { flexDirection: "row" },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  center: { justifyContent: "center", alignItems: "center" },
  scroll: { flex: 1 },

  // Screen content wrapper — used by all screens
  screenContent: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },

  // Cards
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
  heroCard: {
    borderRadius: RADIUS.xl + 2,
    padding: SPACING.xl,
    gap: SPACING.xs,
  },

  // Progress bar
  progressBar: { height: 4, borderRadius: RADIUS.sm, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: RADIUS.sm },

  // Inputs
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    height: 54,
  },
  input: { flex: 1, fontSize: FONT_SIZES.md, height: "100%" },

  // Button
  button: {
    paddingVertical: SPACING.md + 4,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { fontFamily: "Inter_600SemiBold", fontSize: FONT_SIZES.lg },

  // Empty / error
  emptyWrap: { alignItems: "center", gap: SPACING.md, marginTop: 60 },
  emptyText: { fontSize: FONT_SIZES.lg, textAlign: "center" },
  topButton: {
    position: "absolute",
    right: SPACING.lg,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    maxHeight: "82%",
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SPACING.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontSize: FONT_SIZES["3xl"],
    fontFamily: "Inter_600SemiBold",
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  modalScrollView: { flexGrow: 0 },
  modalScrollContent: { padding: SPACING.lg },
  errorContainer: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    textAlign: "center",
    marginTop: SPACING.lg,
  },
});

export const t = StyleSheet.create({
  pageTitle: {
    fontSize: FONT_SIZES["7xl"],
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.8,
  },
  pageSub: {
    fontSize: FONT_SIZES.lg,
    fontFamily: "Inter_400Regular",
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontFamily: "Inter_600SemiBold",
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
  body: { fontSize: FONT_SIZES.md, fontFamily: "Inter_400Regular" },
  caption: { fontSize: FONT_SIZES.xs, fontFamily: "Inter_400Regular" },
  heroTime: {
    fontSize: FONT_SIZES["9xl"],
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  heroLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroSub: {
    fontSize: FONT_SIZES.lg,
    fontFamily: "Inter_400Regular",
    marginTop: SPACING.xs,
  },
});

export const typographies = t;
