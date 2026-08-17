import { Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { HorizontalBreakdownChart } from "@/src/components/HorizontalBreakdownChart";
import { ct } from "@/src/constants/styles.common";

interface DashboardBreakdownSectionProps {
  title: string;
  items: Array<{ name: string; percent: number }>;
  chartColors: string[];
}

export function DashboardBreakdownSection({
  title,
  items,
  chartColors,
}: DashboardBreakdownSectionProps) {
  const colors = useColors();

  if (!items.length) return null;

  return (
    <View
      style={[
        ct.styles.overview.section,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text
        style={[ct.styles.overview.sectionTitle, { color: colors.foreground }]}
      >
        {title}
      </Text>
      <HorizontalBreakdownChart
        items={items.map((item, index) => ({
          key: `${title}-${item.name}`,
          label: item.name,
          percent: item.percent,
          secondaryText: `${item.percent.toFixed(1)}%`,
          color: chartColors[index % chartColors.length] ?? colors.primary,
        }))}
        textColor={colors.foreground}
        mutedTextColor={colors.mutedForeground}
        trackColor={colors.secondary}
        separatorColor={colors.card}
      />
    </View>
  );
}
