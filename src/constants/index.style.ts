import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 12 },
  header: { marginBottom: 4 },
  greeting: { fontSize: 14, fontFamily: "Inter_400Regular" },
  title: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.8 },
  heroCard: {
    borderRadius: 18,
    padding: 24,
    gap: 4,
  },
  heroLabel: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  heroTime: {
    fontSize: 44,
    fontFamily: "Inter_700Bold",
    letterSpacing: -1.5,
    lineHeight: 52,
  },
  heroSub: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  row: { flexDirection: "row", gap: 12 },
  section: {
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    gap: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  empty: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingVertical: 20,
  },
  errorCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 20,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
});
