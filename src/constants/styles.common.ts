import { StyleSheet } from "react-native";

const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
  "4xl": 40,
  full: 999,
} as const;
const padding = space;
const radius = space;

const fontSize = {
  xs: 10,
  sm: 11,
  md: 13,
  lg: 14,
  xl: 15,
  "2xl": 16,
  "3xl": 18,
  title: 20,
  display: 28,
  hero: 44,
} as const;

const fontFamily = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semibold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
} as const;

const lineHeight = {
  xs: 12,
  sm: 18,
  md: 20,
  lg: 22,
  xl: 52,
} as const;

const size = {
  avatar: 60,
  icon: 40,
  dot: 8,
  tinyDot: 3,
  marker: 5,
  tooltip: 32,
  loading: 40,
  loadingCompact: 20,
  input: 54,
  webHeader: 67,
  webTabBar: 34,
  tabBarExtra: 80,
} as const;

const text = StyleSheet.create({
  pageTitle: {
    fontSize: fontSize.display,
    fontFamily: fontFamily.bold,
    letterSpacing: -0.8,
  },

  pageSub: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.regular,
  },

  sectionTitle: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.semibold,
  },

  sectionLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.semibold,
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },

  label: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  value: {
    fontSize: 22,
    letterSpacing: -0.5,
  },

  body: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.regular,
  },

  bodyMedium: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
  },

  bodySemibold: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
  },

  caption: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.regular,
  },

  captionMedium: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
  },

  heroTime: {
    fontSize: fontSize.hero,
    fontFamily: fontFamily.bold,
    letterSpacing: -1.5,
    lineHeight: lineHeight.lg,
  },

  heroLabel: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  heroSub: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.regular,
    marginTop: space.xs,
  },

  pillText: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
  },

  tagText: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.medium,
  },

  buttonText: {
    fontSize: fontSize.lg,
    fontFamily: fontFamily.semibold,
  },

  cardLabel: {
    fontSize: fontSize.xs,
    fontFamily: fontFamily.medium,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  cardValue: {
    fontSize: fontSize.xl,
    fontFamily: fontFamily.bold,
  },

  cardSub: {
    fontSize: fontSize.sm,
    fontFamily: fontFamily.regular,
  },

  tabLabel: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.medium,
  },

  settingValue: {
    fontSize: fontSize.md,
    fontFamily: fontFamily.semibold,
  },

  displayName: {
    fontSize: fontSize["2xl"],
    fontFamily: fontFamily.semibold,
  },
});

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: space.lg,
  },

  flex: {
    flex: 1,
  },

  row: {
    flexDirection: "row",
  },

  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowCenter: {
    flexDirection: "row",
    alignItems: "center",
  },

  center: {
    justifyContent: "center",
    alignItems: "center",
  },

  scroll: {
    flex: 1,
  },

  screenContent: {
    paddingHorizontal: space.lg,
    gap: space.md,
  },

  card: {
    borderRadius: radius.xl,
    padding: space.lg,
    gap: space.md,
  },

  section: {
    borderRadius: radius.xl,
    padding: space.lg,
    borderWidth: 1,
    gap: space.xs,
  },

  heroCard: {
    borderRadius: radius.xl,
    padding: space.xl,
    gap: space.xs,
  },

  progressBar: {
    height: 4,
    borderRadius: radius.sm,
    overflow: "hidden",
  },

  progressFill: {
    height: "100%",
    borderRadius: radius.sm,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
  },

  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: radius.lg,
    paddingHorizontal: space.lg,
    height: size.input,
  },

  input: {
    flex: 1,
    fontSize: fontSize.md,
    height: "100%",
  },

  button: {
    paddingVertical: space.md,
    paddingHorizontal: space.xl,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },

  pill: {
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.full,
    borderWidth: 1,
  },

  tag: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.xs,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.md,
  },

  appBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.lg,
    paddingVertical: space.lg,
    marginVertical: space.sm,
  },

  appBarTitle: {
    fontSize: fontSize.title,
    fontFamily: fontFamily.semibold,
    paddingHorizontal: space.md,
    paddingVertical: space.xs,
    borderRadius: radius.md,
  },

  appBarIcon: {
    width: size.icon,
    height: size.icon,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.full,
  },

  overview: {
    content: {
      paddingHorizontal: space.lg,
      gap: space.md,
    },

    title: text.pageTitle,
    sectionTitle: text.sectionTitle,
    heroSub: text.heroSub,
    empty: text.body,
    errorText: text.body,

    row: {
      flexDirection: "row",
    },

    section: {
      borderRadius: radius.xl,
      padding: space.lg,
      gap: space.xs,
    },

    errorCard: {
      borderRadius: radius.lg,
      padding: space.lg,
      borderWidth: 1,
      alignItems: "center",
      marginTop: space.lg,
    },

    cardSpacing: {
      marginHorizontal: space.md,
      marginBottom: space.md,
    },
  },

  breakdown: {
    content: {
      paddingHorizontal: space.lg,
      gap: space.md,
    },

    title: text.pageTitle,

    pills: {
      flexDirection: "row",
      gap: space.sm,
    },

    summaryRow: {
      flexDirection: "row",
      gap: space.lg,
    },

    catText: {
      fontSize: fontSize.md,
      fontFamily: fontFamily.medium,
    },

    card: {
      borderRadius: radius.xl,
      padding: space.lg,
      borderWidth: 1,
      gap: space.xs,
    },

    empty: text.body,
  },

  settings: {
    content: {
      paddingHorizontal: space.lg,
      gap: space.md,
    },

    title: text.pageTitle,
    displayName: text.displayName,
    username: text.body,

    profileCard: {
      borderRadius: radius.xl,
      padding: space.lg,
      flexDirection: "row",
      alignItems: "center",
      gap: space.lg,
    },

    avatar: {
      width: size.avatar,
      height: size.avatar,
      borderRadius: size.avatar / 2,
    },

    avatarFallback: {
      width: size.avatar,
      height: size.avatar,
      borderRadius: size.avatar / 2,
      alignItems: "center",
      justifyContent: "center",
    },

    profileInfo: {
      flex: 1,
      gap: space.xs,
    },

    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.xs,
      marginTop: space.xs,
    },

    location: {
      fontSize: fontSize.sm,
      fontFamily: fontFamily.regular,
    },

    section: {
      borderRadius: radius.xl,
      padding: space.lg,
      gap: space.md,
    },

    sectionTitle: text.sectionTitle,

    keyRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: space.sm,
    },

    keyText: {
      flex: 1,
      fontSize: fontSize.md,
      fontFamily: fontFamily.medium,
    },

    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderRadius: radius.md,
      paddingHorizontal: space.lg,
    },

    input: {
      flex: 1,
      fontSize: fontSize.md,
    },

    btnRow: {
      flexDirection: "row",
      gap: space.md,
    },

    cancelBtn: {
      flex: 1,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
      padding: space.md,
    },

    cancelText: {
      fontSize: fontSize.md,
      fontFamily: fontFamily.medium,
    },

    saveBtn: {
      flex: 1,
      borderRadius: radius.full,
      alignItems: "center",
      justifyContent: "center",
      padding: space.md,
    },

    saveText: {
      fontSize: fontSize.md,
      fontFamily: fontFamily.semibold,
    },

    editBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      padding: space.md,
      borderRadius: radius.full,
    },

    editSection: {
      gap: space.lg,
    },
  },

  weeklyChart: {
    container: {
      width: "100%",
    },

    bars: {
      flexDirection: "row",
      alignItems: "flex-end",
      height: 120,
      gap: space.xs,
    },

    barCol: {
      flex: 1,
      alignItems: "center",
      height: "100%",
      justifyContent: "flex-end",
      gap: space.xs,
    },

    tooltip: {
      fontSize: fontSize.xs,
      fontFamily: fontFamily.medium,
      textAlign: "center",
    },

    barTrack: {
      flex: 1,
      width: "75%",
      justifyContent: "flex-end",
      borderRadius: radius.sm,
      overflow: "hidden",
    },

    barFill: {
      width: "100%",
      borderRadius: radius.sm,
    },

    dayLabel: {
      fontSize: fontSize.xs,
      textAlign: "center",
      fontFamily: fontFamily.regular,
    },
  },
} as const;

export const ct = {
  space,
  radius,
  fontSize,
  fontFamily,
  lineHeight,
  size,
  padding,
  text,
  styles,
} as const;
