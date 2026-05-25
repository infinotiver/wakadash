// src/types/wakatime.ts

export interface AiAgentBreakdown {
  name: string;
  lines: number;
  cost?: number;
}

export interface WakaEntry {
  name: string;
  decimal?: string;
  digital?: string;
  total_seconds: number;
  percent: number;
  text: string;
  hours: number;
  minutes: number;
  seconds: number;
  color?: string | null;
  machine_name_id?: string;

  // human / ai edit counts
  human_additions?: number;
  human_deletions?: number;
  ai_additions?: number;
  ai_deletions?: number;

  // AI token / prompt metrics
  ai_input_tokens?: number;
  ai_output_tokens?: number;
  ai_prompt_events?: number;
  ai_prompt_length_avg?: number;
  ai_prompt_length_sum?: number;

  // agent breakdown / costs
  ai_agent_breakdown?: AiAgentBreakdown[];
  ai_agent_costs?: Record<string, number>;
  ai_agent_line_changes?: Record<string, number>;
  ai_agent_total_cost?: number;
}

export interface WakaDuration {
  total_seconds: number;
  text: string;
  digital?: string;
  hours?: number;
  minutes?: number;
}

export interface WakaRange {
  date?: string;
  start: string;
  end: string;
  text?: string;
  timezone?: string;
  start_text?: string;
  end_text?: string;
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
  range: WakaRange;
  grand_total: WakaEntry | WakaDuration;
  languages: WakaEntry[];
  editors: WakaEntry[];
  projects: WakaEntry[];
  operating_systems: WakaEntry[];
}

export interface WakaStats {
  total_seconds?: number;
  total_seconds_including_other_language?: number;
  human_readable_total?: string;
  human_readable_total_including_other_language?: string;
  daily_average?: number;
  daily_average_including_other_language?: number;
  human_readable_daily_average?: string;
  human_readable_daily_average_including_other_language?: string;
  languages?: WakaEntry[];
  editors?: WakaEntry[];
  operating_systems?: WakaEntry[];
  projects?: WakaEntry[];
  best_day?: {
    date: string;
    text: string;
    total_seconds: number;
  } | null;

  // top-level AI summary fields (sometimes present)
  ai_input_tokens?: number;
  ai_output_tokens?: number;
  ai_prompt_events?: number;
  ai_additions?: number;
  ai_deletions?: number;
  ai_prompt_length_avg?: number;
  ai_prompt_length_sum?: number;

  // metadata
  range?: string | WakaRange;
  is_up_to_date?: boolean;
  percent_calculated?: number;
  start?: string;
  end?: string;
  timezone?: string;
  days_minus_holidays?: number;
  days_including_holidays?: number;
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
