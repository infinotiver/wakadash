// Type declarations for the entire project
// TODO: support custom API

// Common Types

export interface AiModelBreakdown {
  name: string;
  lines: number;
  cost?: number;
}

// Generic
export interface Duration {
  total_seconds: number;
  text?: string;
  digital?: string;
  decimal?: string;
  hours?: number;
  minutes?: number;
  seconds?: number;
}

export interface StatsEntry {
  name: string;
  total_seconds: number;
  percent: number;

  text?: string;
  digital?: string;
  hours?: number;
  minutes?: number;
  seconds?: number;

  color?: string | null;
}

export interface StatsRange {
  start: string;
  end: string;
  timezone?: string;

  // Per-day summaries
  date?: string;
  text?: string;

  // all_time_since_today / larger ranges
  start_date?: string;
  start_text?: string;
  end_date?: string;
  end_text?: string;
}

export interface BestDay {
  date: string;
  text?: string;
  total_seconds: number;
}

export interface DailyAverage {
  seconds: number;
  text?: string;

  holidays?: number;
  days_including_holidays?: number;
  days_minus_holidays?: number;

  seconds_including_other_language?: number;
  text_including_other_language?: string;
}

/**
 * A single day entry inside a summaries response's `data[]` array.
 *
 * NOTE: per both WakaTime's and Hackatime's actual API schemas,
 * `daily_average` is NOT part of this — it's a sibling of `data` on the
 * wrapping summaries-response envelope (see `SummariesEnvelope` below),
 * computed once across the whole requested range, not per day. It used to
 * live here; that was inaccurate for both providers, not just Hackatime.
 */
export interface CodingSummaryDay {
  range: StatsRange;
  grand_total: Duration;

  languages: StatsEntry[];
  editors: StatsEntry[];
  projects: StatsEntry[];

  categories: StatsEntry[];
  operating_systems: StatsEntry[];

  branches?: StatsEntry[];
  entities?: StatsEntry[];
}

/**
 * The full response shape of a /summaries call: the per-day array plus the
 * range-wide totals WakaTime and Hackatime both compute once, not per day.
 */
export interface SummariesEnvelope<TDay = CodingSummaryDay> {
  data: TDay[];
  cumulative_total: Duration;
  daily_average: DailyAverage;
  start: string;
  end: string;
}

// Stats
export interface CodingStats {
  total_seconds: number;
  daily_average: number;

  // WakaTime-only: total tracked time including non-coding activity.
  total_seconds_including_other_language?: number;
  daily_average_including_other_language?: number;

  languages: StatsEntry[];
  projects: StatsEntry[];
  editors: StatsEntry[];

  categories?: StatsEntry[];
  operating_systems?: StatsEntry[];
  machines?: StatsEntry[];
  dependencies?: StatsEntry[];

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

  streak?: number;
  best_day?: BestDay | null;
}

// Wakatime Specific

export interface WakaEntry extends StatsEntry {
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

// Backward compatiblity
export type WakaDuration = Duration;
export type WakaRange = StatsRange;
export type WakaBestDay = BestDay;

export interface WakaDailyAverage extends DailyAverage {
  holidays: number;
  days_including_holidays: number;
  days_minus_holidays: number;

  seconds_including_other_language: number;
  text_including_other_language: string;
}

export interface WakaSummaryDay extends CodingSummaryDay {
  range: WakaRange;
  grand_total: WakaDuration;

  languages: WakaEntry[];
  editors: WakaEntry[];
  projects: WakaEntry[];

  categories: WakaEntry[];
  operating_systems: WakaEntry[];

  branches?: WakaEntry[];
  entities?: WakaEntry[];
}

export type WakaSummariesEnvelope = SummariesEnvelope<WakaSummaryDay>;

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

// All Time
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

export interface WakaUser {
  id: string;
  username?: string;
  display_name: string;
  full_name: string;
  email?: string;
  photo: string;

  human_readable_website?: string;
  location?: string;
  created_at?: string;
  last_plugin_name?: string;

  // Hackatime-only
  timezone?: string;
  modified_at?: string;
  plan?: string;
}

export interface WakaProgramLanguage {
  id: string;
  name: string;
  color: string;
  is_verified: boolean;
  created_at: string;
  modified_at: string;
}

// Hackatime specific

export interface HackaTimeTrustFactor {
  trust_level: "blue" | "red" | "green";
  trust_value: 0 | 1 | 2;
}

/**
 * Hackatime aggregate statistics.
 *
 * Languages, projects and editors all use the common StatsEntry because
 * Hackatime only requires name, total_seconds and percent for these objects.
 */
export interface HackaTimeStatsData extends CodingStats {
  /**
   * Only present when features includes "projects" and filter_by_project
   * is supplied.
   */
  unique_total_seconds?: number;

  streak: number;
}

// Hackatime stats endpoint response.

export interface HackaTimeStats {
  data: HackaTimeStatsData;
  trust_factor: HackaTimeTrustFactor;
}

// Common All Time Stats Type

export interface CodingAllTime {
  total_seconds: number;
  daily_average: number;

  text: string;
  digital?: string;
  decimal?: string;

  range?: StatsRange;

  is_up_to_date?: boolean;
  percent_calculated?: number;

  trust_factor?: HackaTimeTrustFactor;
}
