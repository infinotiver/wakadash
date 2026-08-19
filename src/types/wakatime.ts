// type declarations for the entire project
// TODO: support custom api
export interface AiModelBreakdown {
  name: string;
  lines: number;
  cost?: number;
}

/**
 * Shared shape for language/editor/project/category/os/dependency entries
 * across Stats and Summaries responses. NOTE: not every field below is
 * present on every entry type — e.g. `seconds` is absent on `projects`
 * entries, and the ai_* fields are only present on `projects` and `editors`
 * entries per the official docs. All are optional here for that reason.
 */

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

  // AI model breakdown / costs 
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

/**
 * NOTE: this is a merged/union convenience type covering two genuinely
 * different official range shapes:
 *  - Summaries' per-day range: { date, start, end, text, timezone }
 *  - all_time_since_today's range: { start, start_date, start_text, end,
 *    end_date, end_text, timezone }
 * Treat start_text/end_text/start_date/end_date as only populated when the
 * range came from all_time_since_today.
 */
export interface WakaRange {
  date?: string;
  start: string;
  end: string;
  text?: string;
  timezone?: string;
  start_date?: string;
  end_date?: string;
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
  grand_total: WakaDuration;
  languages: WakaEntry[];
  editors: WakaEntry[];
  projects: WakaEntry[];
  categories: WakaEntry[];
  operating_systems: WakaEntry[];
  // Present only when a `project` filter is applied to the request, per docs
  branches?: WakaEntry[];
  entities?: WakaEntry[];
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
  best_day?: {
    date: string;
    text: string;
    total_seconds: number;
  } | null;

  // top-level AI summary fields (sometimes present)
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
