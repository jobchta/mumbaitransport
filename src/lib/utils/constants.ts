/**
 * Application constants
 * Centralized configuration values to avoid magic numbers
 */

// Cache configuration
export const CACHE_CONFIG = {
  /** Time-to-live for alert cache in milliseconds (5 minutes) */
  ALERTS_TTL_MS: 5 * 60 * 1000,
  /** Maximum number of alerts to process */
  MAX_ALERTS: 12,
  /** Number of search results per query */
  SEARCH_RESULTS_PER_QUERY: 3,
} as const;

// Crowd level thresholds
export const CROWD_THRESHOLDS = {
  /** Low crowd percentage threshold */
  LOW: 40,
  /** Medium crowd percentage threshold */
  MEDIUM: 70,
  /** Base crowd percentage during off-peak hours */
  BASE_OFF_PEAK: 30,
  /** Base crowd percentage during morning peak */
  BASE_MORNING_PEAK: 75,
  /** Base crowd percentage during evening peak */
  BASE_EVENING_PEAK: 70,
  /** Base crowd percentage during night hours */
  BASE_NIGHT: 10,
} as const;

// Time constants (hours in 24-hour format)
export const TIME_CONSTANTS = {
  /** Morning peak start hour */
  MORNING_PEAK_START: 8,
  /** Morning peak end hour */
  MORNING_PEAK_END: 11,
  /** Evening peak start hour */
  EVENING_PEAK_START: 17,
  /** Evening peak end hour */
  EVENING_PEAK_END: 21,
  /** Night start hour */
  NIGHT_START: 22,
  /** Night end hour */
  NIGHT_END: 5,
} as const;

// Fare structure constants (in INR)
export const FARE_STRUCTURE = {
  RAILWAY: {
    DISTANCE_BRACKETS: [2, 5, 10, 15, 20, 30, 40, 50, 60],
    SECOND_CLASS: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50],
    FIRST_CLASS_MULTIPLIER: 10,
  },
  METRO: {
    DISTANCE_BRACKETS: [3, 6, 9, 12],
    BASE_FARES: [10, 20, 30, 40, 50],
    FIRST_CLASS_MULTIPLIER: 2,
  },
  /** Monthly pass multiplier (50x second class fare) */
  MONTHLY_MULTIPLIER: 50,
  /** Season pass multiplier (120x second class fare) */
  SEASON_MULTIPLIER: 120,
} as const;

// Train schedule constants
export const SCHEDULE_CONFIG = {
  /** Default frequency for local trains in minutes */
  LOCAL_FREQUENCY_MIN: 3,
  /** Frequency for metro trains in minutes */
  METRO_FREQUENCY_MIN: 4,
  /** Frequency for monorail in minutes */
  MONORAIL_FREQUENCY_MIN: 10,
  /** Start hour for local trains */
  LOCAL_START_HOUR: 4,
  /** End hour for local trains */
  LOCAL_END_HOUR: 1, // 1 AM next day
  /** Start hour for metro */
  METRO_START_HOUR: 5,
  /** End hour for metro */
  METRO_END_HOUR: 23,
} as const;

// Station list configuration
export const STATION_LIST_CONFIG = {
  /** Maximum stations to display without search */
  DEFAULT_DISPLAY_COUNT: 20,
  /** Travel time per kilometer in minutes */
  TRAVEL_TIME_PER_KM_MIN: 2,
} as const;

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  /** Window size in milliseconds (1 minute) */
  WINDOW_MS: 60 * 1000,
  /** Maximum requests per window */
  MAX_REQUESTS: 10,
} as const;

// Line colors for UI
export const LINE_COLORS: Record<string, string> = {
  western: '#3B82F6',      // Blue
  central: '#EF4444',      // Red
  harbour: '#F59E0B',      // Amber
  'trans-harbour': '#8B5CF6', // Violet
  'metro-1': '#EC4899',    // Pink
  'metro-2a': '#FBBF24',   // Yellow
  'metro-7': '#10B981',    // Emerald
  monorail: '#22C55E',     // Green
};

// Tailwind color classes for lines
export const LINE_COLOR_CLASSES: Record<string, string> = {
  western: 'bg-blue-500',
  central: 'bg-red-500',
  harbour: 'bg-yellow-500',
  'trans-harbour': 'bg-violet-500',
  'metro-1': 'bg-pink-500',
  'metro-2a': 'bg-yellow-400',
  'metro-7': 'bg-emerald-500',
  monorail: 'bg-green-500',
};

// Severity color classes
export const SEVERITY_COLOR_CLASSES: Record<string, string> = {
  critical: 'bg-red-600',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-blue-500',
};

// Status configuration for UI display
export const STATUS_CONFIG = {
  normal: { icon: 'CheckCircle2', color: 'text-green-400', bg: 'bg-green-500/20' },
  delayed: { icon: 'AlertTriangle', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  suspended: { icon: 'XCircle', color: 'text-red-400', bg: 'bg-red-500/20' },
} as const;
