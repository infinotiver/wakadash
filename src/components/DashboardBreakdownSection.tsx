import { Pressable, Text, View } from "react-native";
import { useColors } from "@/src/hooks/useColors";
import { HorizontalBreakdownChart } from "@/src/components/HorizontalBreakdownChart";
import { ct } from "@/src/constants/styles.common";

interface DashboardBreakdownSectionProps {
  title: string;
  items: Array<{ name: string; percent: number; trailingText: string }>;
  chartColors: string[];
  onPress?: () => void;
}

export function DashboardBreakdownSection({
  title,
  items,
  chartColors,
  onPress,
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
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        accessibilityRole={onPress ? "button" : undefined}
        accessibilityLabel={onPress ? `Open ${title} breakdown` : title}
        style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: ct.space.sm,
          }}
        >
          <Text
            style={[
              ct.styles.overview.sectionTitle,
              { color: colors.onSurfaceVariant, flex: 1 },
            ]}
          >
            {title}
          </Text>
          {onPress ? (
            <Text style={{ color: colors.onBackground }}>›</Text>
          ) : null}
        </View>
      </Pressable>
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
