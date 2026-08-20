// Type declarations for the entire project
// TODO: support custom API

export interface AiModelBreakdown {
  name: string;
  lines: number;
  cost?: number;
}

export interface WakaEntry {
  name: string;

  digital?: string;
  total_seconds: number;
  percent: number;
  text: string;
  hours: number;
  minutes: number;
  seconds?: number;

  color?: string | null;
  machine_name_id?: string;

  human_additions?: number;
  human_deletions?: number;
  ai_additions?: number;
  ai_deletions?: number;

  ai_input_tokens?: number;
  ai_output_tokens?: number;

  ai_prompt_length_avg?: number;
  ai_prompt_length_avg_per_session?: number;
  ai_prompt_length_median_per_session?: number;
  ai_prompt_length_sum?: number;

  ai_prompt_events_total?: number;
  ai_prompt_events_avg_per_session?: number;
  ai_prompt_events_median_per_session?: number;

  ai_sessions?: number;

  /** AI model breakdown / costs */
  ai_model_breakdown?: AiModelBreakdown[];
  ai_model_costs?: Record<string, number>;
  ai_model_line_changes?: Record<string, number>;
  ai_model_total_cost?: number;
}

export interface WakaDuration {
  total_seconds: number;
  text: string;
  digital?: string;
  hours?: number;
  minutes?: number;
}

export interface WakaRange {
  start: string;
  end: string;

  timezone?: string;

  // Summaries per-day range
  date?: string;
  text?: string;

  // all_time_since_today range
  start_date?: string;
  start_text?: string;
  end_date?: string;
  end_text?: string;
}

// -----------------------------------------------------------------------------
// Endpoint-specific types
// -----------------------------------------------------------------------------

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

export interface WakaDailyAverage {
  holidays: number;

  days_including_holidays: number;

  days_minus_holidays: number;

  seconds: number;

  text: string;

  seconds_including_other_language: number;

  text_including_other_language: string;
}

export interface WakaSummaryDay {
  range: WakaRange;
  grand_total: WakaDuration;

  languages: WakaEntry[];
  editors: WakaEntry[];
  projects: WakaEntry[];
  categories: WakaEntry[];
  operating_systems: WakaEntry[];

  branches?: WakaEntry[];

  entities?: WakaEntry[];

  daily_average: WakaDailyAverage;
}

export interface WakaBestDay {
  date: string;
  text: string;
  total_seconds: number;
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
  categories?: WakaEntry[];
  dependencies?: WakaEntry[];
  machines?: WakaEntry[];

  best_day?: WakaBestDay | null;

  // ---------------------------------------------------------------------------
  // AI summary fields
  // ---------------------------------------------------------------------------

  ai_input_tokens?: number;
  ai_output_tokens?: number;

  ai_additions?: number;
  ai_deletions?: number;

  human_additions?: number;
  human_deletions?: number;

  ai_prompt_length_avg?: number;
  ai_prompt_length_avg_per_session?: number;
  ai_prompt_length_median_per_session?: number;
  ai_prompt_length_sum?: number;

  ai_prompt_events_total?: number;
  ai_prompt_events_avg_per_session?: number;
  ai_prompt_events_median_per_session?: number;

  ai_sessions?: number;

  ai_line_changes_total?: number;

  ai_model_line_changes?: Record<string, number>;
  ai_model_costs?: Record<string, number>;
  ai_model_breakdown?: AiModelBreakdown[];
  ai_model_total_cost?: number;

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
