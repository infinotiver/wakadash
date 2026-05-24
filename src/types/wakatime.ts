// src/types/wakatime.ts

export interface WakaEntry {
  name: string;
  total_seconds: number;
  percent: number;
  text: string;
  digital: string;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface WakaDuration {
  total_seconds: number;
  text: string;
  digital: string;
  hours: number;
  minutes: number;
}

export interface WakaRange {
  start: string;
  end: string;
  start_date: string;
  end_date: string;
  start_text: string;
  end_text: string;
  timezone: string;
}

// --- Endpoint-specific types---

export interface WakaUser {
  id: string;
  username: string;
  display_name: string;
  full_name: string;
  email: string;
  photo: string;
  human_readable_website: string;
  location: string;
  created_at: string;
  last_plugin_name: string;
}

export interface WakaSummaryDay {
  range: {
    date: string;
    text: string;
    start: string;
    end: string;
    timezone: string;
  };
  grand_total: WakaDuration;
  languages: WakaEntry[];
  editors: WakaEntry[];
  projects: WakaEntry[];
  operating_systems: WakaEntry[];
}

export interface WakaStats {
  total_seconds: number;
  total_seconds_including_other_language: number;
  human_readable_total: string;
  human_readable_total_including_other_language: string;
  daily_average: number;
  daily_average_including_other_language: number;
  human_readable_daily_average: string;
  human_readable_daily_average_including_other_language: string;
  languages: WakaEntry[];
  editors: WakaEntry[];
  operating_systems: WakaEntry[];
  projects: WakaEntry[];
  best_day: {
    date: string;
    text: string;
    total_seconds: number;
  } | null;
  range: string;
  is_up_to_date: boolean;
  percent_calculated: number;
  start: string;
  end: string;
  timezone: string;
}

export interface WakaAllTime {
  text: string;
  decimal: string;
  digital: string;
  total_seconds: number;
  daily_average: number;
  is_up_to_date: boolean;
  percent_calculated: number;
  range: WakaRange;
}
