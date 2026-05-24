import { StyleSheet } from "react-native";
import {
  commonStyles,
  typographies,
  SPACING,
  RADIUS,
  FONT_SIZES,
} from "./styles.common";

/**
 * Index/Overview Screen specific styles
 */
export const overviewScreenStyles = StyleSheet.create({
  content: commonStyles.screenContent,
  header: { marginBottom: SPACING.xs },
  greeting: typographies.pageSubtitle,
  title: typographies.pageTitle,
  heroCard: commonStyles.heroCard,
  heroLabel: typographies.heroLabel,
  heroTime: typographies.heroTime,
  heroSub: typographies.heroSub,
  row: { flexDirection: "row", gap: SPACING.md },
  section: commonStyles.section,
  sectionTitle: typographies.sectionTitle,
  empty: typographies.body,
  errorCard: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    borderWidth: 1,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});

/**
 * History Screen specific styles
 */
export const historyScreenStyles = StyleSheet.create({
  content: commonStyles.screenContent,
  title: typographies.pageTitle,
  sub: {
    fontSize: FONT_SIZES.lg,
    fontFamily: "Inter_400Regular",
    marginBottom: SPACING.xs,
  },
  list: { gap: SPACING.lg },
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayName: {
    fontSize: FONT_SIZES["2xl"],
    fontFamily: "Inter_600SemiBold",
  },
  dateStr: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Inter_400Regular",
    marginTop: SPACING.xs,
  },
  totalTime: {
    fontSize: FONT_SIZES["5xl"],
    fontFamily: "Inter_700Bold",
  },
  barTrack: {
    height: 6,
    borderRadius: RADIUS.sm,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: RADIUS.sm,
  },
  tags: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.md,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Inter_500Medium",
  },
});

/**
 * Breakdown Screen specific styles
 */
export const breakdownScreenStyles = StyleSheet.create({
  content: commonStyles.screenContent,
  title: typographies.pageTitle,
  pills: { flexDirection: "row", gap: SPACING.md },
  pill: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
    borderWidth: 1,
  },
  pillText: {
    fontSize: FONT_SIZES.md,
    fontFamily: "Inter_500Medium",
  },
  proCard: {
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    padding: SPACING.lg,
    gap: SPACING.lg + 4,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.md + 2,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  proLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Inter_600SemiBold",
  },
  proMessage: {
    fontSize: FONT_SIZES.lg,
    fontFamily: "Inter_400Regular",
    lineHeight: 20,
  },
  proLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.lg - 2,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  proLinkText: {
    fontSize: FONT_SIZES.md,
    fontFamily: "Inter_500Medium",
  },
  summaryRow: { flexDirection: "row", gap: SPACING.lg },
  summaryItem: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg - 2,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  summaryLabel: {
    fontSize: FONT_SIZES.xs,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: FONT_SIZES.xl,
    fontFamily: "Inter_700Bold",
  },
  catRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  catBtn: {
    paddingHorizontal: SPACING.lg - 2,
    paddingVertical: SPACING.md - 1,
    borderRadius: RADIUS.md,
    borderWidth: 1,
  },
  catText: {
    fontSize: FONT_SIZES.md,
    fontFamily: "Inter_500Medium",
  },
  card: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl - 6,
    borderWidth: 1,
  },
  empty: typographies.body,
  error: typographies.body,
});

/**
 * Settings Screen specific styles
 */
export const settingsScreenStyles = StyleSheet.create({
  content: commonStyles.screenContent,
  title: typographies.pageTitle,
  profileCard: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg - 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarFallback: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  profileInfo: {
    flex: 1,
    gap: SPACING.xs,
  },
  displayName: {
    fontSize: FONT_SIZES["2xl"],
    fontFamily: "Inter_600SemiBold",
  },
  username: {
    fontSize: FONT_SIZES.md,
    fontFamily: "Inter_400Regular",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    marginTop: SPACING.xs,
  },
  location: {
    fontSize: FONT_SIZES.sm,
    fontFamily: "Inter_400Regular",
  },
  section: {
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    gap: SPACING.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.base,
    fontFamily: "Inter_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionHint: {
    fontSize: FONT_SIZES.xs,
    fontFamily: "Inter_400Regular",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  sectionDesc: {
    fontSize: FONT_SIZES.md,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginTop: -SPACING.xs,
  },
  keyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg - 6,
  },
  keyText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
  },
  editBtn: {
    padding: SPACING.md,
    borderRadius: RADIUS.md,
  },
  editSection: {
    gap: SPACING.lg - 6,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: RADIUS.lg - 2,
    paddingHorizontal: SPACING.lg - 2,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: FONT_SIZES.md,
  },
  btnRow: {
    flexDirection: "row",
    gap: SPACING.lg - 6,
  },
  cancelBtn: {
    flex: 1,
    height: 44,
    borderRadius: RADIUS.lg - 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    fontSize: FONT_SIZES.md,
    fontFamily: "Inter_500Medium",
  },
  saveBtn: {
    flex: 2,
    height: 44,
    borderRadius: RADIUS.lg - 2,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    fontSize: FONT_SIZES.md,
    fontFamily: "Inter_600SemiBold",
  },
  creditRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingTop: SPACING.lg - 6,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  creditLabel: {
    fontSize: FONT_SIZES.md,
    fontFamily: "Inter_400Regular",
  },
});

/**
 * SetupScreen specific styles
 */
export const setupScreenStyles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.xl + 4,
    gap: SPACING.lg,
  },
  iconWrap: {
    alignSelf: "center",
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES["8xl"],
    fontFamily: "Inter_700Bold",
    textAlign: "center",
    letterSpacing: -1,
  },
  sub: {
    fontSize: FONT_SIZES.lg,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
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
  eyeBtn: {
    padding: SPACING.sm,
  },
  error: {
    fontSize: FONT_SIZES.md,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
