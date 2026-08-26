import type {
  WakaAllTime,
  HackaTimeStats,
  CodingAllTime,
} from "../types/wakatime";
import { formatDuration } from "./dashboard";

export function normalizeWakaAllTime(data: WakaAllTime): CodingAllTime {
  return {
    total_seconds: data.total_seconds,
    daily_average: data.daily_average,
    text: data.text,
    digital: data.digital,
    decimal: data.decimal,
    range: data.range,
    is_up_to_date: data.is_up_to_date,
    percent_calculated: data.percent_calculated,
  };
}

export function normalizeHackaTimeStats(data: HackaTimeStats): CodingAllTime {
  return {
    total_seconds: data.data.total_seconds,
    daily_average: data.data.daily_average,

    text: formatDuration(data.data.total_seconds),
    digital: formatDuration(data.data.total_seconds),

    trust_factor: data.trust_factor,
  };
}
