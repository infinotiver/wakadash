import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    gap: 6,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  time: {
    fontSize: 12,
    fontFamily: "Inter_400Regular",
  },
  percent: {
    fontSize: 12,
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
