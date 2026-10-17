import React from "react";
import { View } from "react-native";
import { ButtonGroup } from "./ButtonGroup";
import { ct } from "@/src/constants/styles.common";

interface Props {
  value: string; // YYYY or YYYY-MM
  onChange: (value: string) => void;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const YEARS_BACK = 5;

export function PeriodPicker({ value, onChange }: Props) {
  const now = new Date();
  const thisYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [year, month = "year"] = value.split("-");
  // no future months in current year
  const maxMonth = Number(year) == thisYear ? currentMonth : 12;

  const years = Array.from({ length: YEARS_BACK + 1 }, (_, i) => {
    const y = String(thisYear - i);
    return { label: y, value: y };
  });
  const isCurrentYear = Number(year) === thisYear;

  const months = [
    // WakaTime rejects the current year as a full range ("Invalid time range")
    ...(isCurrentYear ? [] : [{ label: "Full year", value: "year" }]),
    ...MONTHS.slice(0, maxMonth).map((label, i) => ({
      label,
      value: String(i + 1).padStart(2, "0"),
    })),
  ];
  const pick = (y: string, m: string) =>
    onChange(m === "year" ? y : `${y}-${m}`);
  const pickYear = (y: string) => {
    // current year has no full-year option, and no future months
    if (
      Number(y) === thisYear &&
      (month === "year" || Number(month) > currentMonth)
    ) {
      return pick(y, String(currentMonth).padStart(2, "0"));
    }
    pick(y, month);
  };
  return (
    <View style={{ gap: ct.space.sm }}>
      <ButtonGroup items={years} value={year} onChange={pickYear} />
      <ButtonGroup
        items={months}
        value={month}
        onChange={(m) => pick(year, m)}
      />
    </View>
  );
}
