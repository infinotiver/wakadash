import { useMemo } from "react";
import { useColorScheme } from "react-native";

import colors from "@/src/constants/colors";
import { useDynamicPalette } from "@/src/context/DynamicColorContext";

type Palette = typeof colors.light;

const KEEP_STATIC = new Set(["accent", "fixed", "chart"]);

export function useColors(): Palette & { radius: number } {
  const scheme = useColorScheme() === "dark" ? "dark" : "light";
  const dynamic = useDynamicPalette();

  return useMemo(() => {
    const base: Palette = colors[scheme];
    const dynamicScheme = dynamic?.[scheme];
    if (!dynamicScheme) return { ...base, radius: colors.radius };

    const merged: Record<string, unknown> = { ...base };
    for (const key of Object.keys(base)) {
      if (KEEP_STATIC.has(key)) continue;
      const value = dynamicScheme[key];
      if (typeof value === "string") merged[key] = value;
    }

    return { ...(merged as Palette), radius: colors.radius };
  }, [dynamic, scheme]);
}
