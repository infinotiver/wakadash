import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Platform } from "react-native";
import {
  createMaterial3Theme,
  useMaterial3Theme,
} from "@pchmn/expo-material3-theme";

import staticColors from "@/src/constants/colors";

const KEY = "pref:themeChoice";
const supported = Platform.OS === "android" && Number(Platform.Version) >= 31;

type Palette = {
  light: Record<string, unknown>;
  dark: Record<string, unknown>;
} | null;

// "system" | "default" | "#rrggbb" seed
const Ctx = createContext<{
  palette: Palette;
  choice: string;
  setChoice: (v: string) => void;
}>({ palette: null, choice: "system", setChoice: () => {} });

export function DynamicColorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { theme } = useMaterial3Theme({
    fallbackSourceColor: staticColors.light.primary,
  });
  const [choice, setChoiceState] = useState("system");

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((v) => v && setChoiceState(v));
  }, []);

  const setChoice = (v: string) => {
    setChoiceState(v);
    AsyncStorage.setItem(KEY, v);
  };

  const palette = useMemo<Palette>(() => {
    if (choice === "system") return supported ? theme : null;
    if (choice === "default") return null;
    return createMaterial3Theme(choice);
  }, [choice, theme]);

  return (
    <Ctx.Provider value={{ palette, choice, setChoice }}>
      {children}
    </Ctx.Provider>
  );
}

export const useDynamicPalette = () => useContext(Ctx).palette;
export const useThemeChoice = () => ({ ...useContext(Ctx), supported });
