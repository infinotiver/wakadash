import { Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { HorizontalBreakdownChart } from "@/src/components/HorizontalBreakdownChart";
import { ct } from "@/src/constants/styles.common";

interface DashboardBreakdownSectionProps {
  title: string;
  items: Array<{ name: string; percent: number; trailingText: string }>;
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
        {
          backgroundColor: colors.surfaceContainerHigh,
        },
      ]}
    >
      <Text
        style={[
          ct.styles.overview.sectionTitle,
          { color: colors.onSurfaceVariant },
        ]}
      >
        {title}
      </Text>
      <HorizontalBreakdownChart
        items={items.map((item, index) => ({
          key: `${title}-${item.name}`,
          label: item.name,
          percent: item.percent,
          trailingText: item.trailingText,
          color: chartColors[index % chartColors.length] ?? colors.primary,
        }))}
        textColor={colors.onSurface}
        mutedTextColor={colors.onSurfaceVariant}
        trackColor={colors.surfaceContainerHigh}
        separatorColor={colors.outlineVariant}
      />
    </View>
  );
}
